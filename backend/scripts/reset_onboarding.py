
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def reset_onboarding(email: str):
    supabase = get_supabase_client()
    print(f"Resetting onboarding for: {email}")
    
    try:
        # Get profile first to get UID
        profile_res = supabase.table("profiles").select("supabase_uid").eq("email", email).maybe_single().execute()
        if not profile_res.data:
            print(f"❌ User with email {email} not found.")
            return
            
        uid = profile_res.data.get("supabase_uid")
        placeholder_username = f"user_{uid[:8]}"

        # Reset profile
        res = supabase.table("profiles").update({
            "username": placeholder_username,
            "onboarding_completed": False,
            "display_name": None
        }).eq("email", email).execute()
        
        if res.data:
            print(f"✅ Successfully reset onboarding for {email}")
            print("You can now refresh your dashboard to see the new onboarding flow.")
        else:
            print(f"❌ User with email {email} not found.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reset_onboarding.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    asyncio.run(reset_onboarding(email))

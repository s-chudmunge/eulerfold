
import asyncio
from app.core.supabase_client import get_supabase_client

async def check_recent_users():
    supabase = get_supabase_client()
    print("Checking for new profiles...")
    try:
        response = supabase.table("profiles").select("*").order("id", desc=True).limit(3).execute()
        if response.data:
            for profile in response.data:
                print(f"ID: {profile.get('id')}, Email: {profile.get('email')}, Created: {profile.get('created_at')}")
        else:
            print("No profiles found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_recent_users())

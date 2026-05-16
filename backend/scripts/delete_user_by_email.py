
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client, get_admin_supabase_client

async def delete_user_by_email(email: str):
    sb = get_supabase_client()
    admin_sb = get_admin_supabase_client()
    
    print(f"Searching for user with email: {email}")
    try:
        # 1. Find the profile to get the supabase_uid
        res_profile = sb.table("profiles").select("supabase_uid, username").eq("email", email).maybe_single().execute()
        
        if not res_profile.data:
            print(f"No profile found for email: {email}")
            # Try searching in auth.users directly if possible, but usually profiles is enough
            return

        uid = res_profile.data.get("supabase_uid")
        username = res_profile.data.get("username")
        
        if not uid:
            print(f"Found profile for {email} but it has no supabase_uid.")
            return

        print(f"Found user: {username} (UID: {uid})")
        
        # 2. Cleanup associated data that might not cascade
        print(f"Cleaning up associated data for {email}...")
        
        # Delete coin transactions
        sb.table("eulercoin_transactions").delete().eq("user_email", email).execute()
        print("- Deleted eulercoin_transactions")
        
        # 3. Delete from auth.users (Cascades to profiles, roadmaps, etc. if configured)
        print(f"Deleting user from Supabase Auth (UID: {uid})...")
        admin_sb.auth.admin.delete_user(uid)
        print(f"Successfully deleted user {email} from database and auth.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        email = "jukeask1@gmail.com"
    else:
        email = sys.argv[1]
    
    asyncio.run(delete_user_by_email(email))

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
sb: Client = create_client(url, key)

def trim_dummy_users(target_count=150):
    print(f"Fetching dummy profiles...")
    res = sb.table("profiles")\
        .select("supabase_uid, email, created_at")\
        .ilike("email", "%@dummy.eulerfold.com")\
        .order("created_at", desc=True)\
        .execute()
    
    profiles = res.data
    current_count = len(profiles)
    
    if current_count <= target_count:
        print(f"Current count ({current_count}) is already at or below target ({target_count}).")
        return

    to_delete = profiles[:(current_count - target_count)]
    print(f"Trimming {len(to_delete)} users to reach target of {target_count}...")

    deleted_count = 0
    for p in to_delete:
        uid = p["supabase_uid"]
        try:
            # Delete from Auth (will cascade to profiles if configured, 
            # but we'll be safe and rely on the admin delete)
            sb.auth.admin.delete_user(uid)
            deleted_count += 1
            if deleted_count % 10 == 0:
                print(f"Deleted {deleted_count} users...")
        except Exception as e:
            print(f"Error deleting user {uid}: {e}")

    print(f"Successfully deleted {deleted_count} users. Current dummy count: {current_count - deleted_count}")

if __name__ == "__main__":
    trim_dummy_users(150)

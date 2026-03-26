import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")

USER_UUID = "b083da08-835f-458a-9b53-1ee01e3036ba"

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: Supabase credentials missing.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def cleanup_all():
    print(f"Purging all data for user {USER_UUID}...")
    
    # Get profile info
    p_res = sb.table("profiles").select("id, email").eq("supabase_uid", USER_UUID).execute()
    if not p_res.data:
        print("Profile not found.")
        return
    pid = p_res.data[0]["id"]
    email = p_res.data[0]["email"]

    # 1. Delete Roadmaps (cascades to submissions, progress, etc.)
    print("- Deleting roadmaps...")
    sb.table("roadmaps").delete().eq("user_id", pid).execute()
    
    # 3. Delete user skills
    print("- Deleting user skills...")
    sb.table("user_skills").delete().eq("user_id", USER_UUID).execute()
    
    # 4. Delete practice sessions (cascades to practice_progress)
    print("- Deleting practice sessions...")
    sb.table("practice_sessions").delete().eq("user_id", USER_UUID).execute()
    
    # 5. Delete EulerCoin transactions
    print("- Deleting eulercoin transactions...")
    sb.table("eulercoin_transactions").delete().eq("user_email", email).execute()

    # 6. Reset profile to "new user" state
    print("- Resetting profile status...")
    sb.table("profiles").update({
        "profile_completed": False,
        "onboarding_completed": False,
        "eulercoins": 0,
        "current_streak": 0,
        "last_active_date": None,
        "metadata": {}
    }).eq("id", pid).execute()

    print("\nCleanup successful. Profile is now clean with no roadmaps, no data, just a new user state.")

if __name__ == "__main__":
    cleanup_all()

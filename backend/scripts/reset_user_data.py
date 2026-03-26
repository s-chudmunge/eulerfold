import asyncio
import logging
import os
import sys

# Ensure we can import app
sys.path.append(os.getcwd())

from app.core.supabase_client import get_supabase_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reset_user():
    # Target user: sankalp
    user_id = "b083da08-835f-458a-9b53-1ee01e3036ba"
    email = "jukeask@gmail.com"
    
    sb = get_supabase_client()
    print(f"Starting final data wipe for user {email} ({user_id})...")

    # 1. Clean tables by user_id (UUID)
    uid_tables = [
        "user_skills",
        "learning_sessions",
        "practice_progress",
        "practice_sessions"
    ]
    for table in uid_tables:
        try:
            res = sb.table(table).delete().eq("user_id", user_id).execute()
            print(f"Cleaned table '{table}': {len(res.data) if res.data else 0} rows removed.")
        except Exception as e:
            print(f"Error cleaning '{table}': {e}")

    # 2. Clean tables by user_email
    email_tables = [
        "module_progress",
        "submissions",
        "eulercoin_transactions",
        "recall_responses",
        "roadmaps"
    ]
    for table in email_tables:
        try:
            # Most tables use 'user_email' or 'email'
            field = "user_email" if table in ["module_progress", "submissions", "eulercoin_transactions", "recall_responses"] else "email"
            res = sb.table(table).delete().eq(field, email).execute()
            print(f"Cleaned table '{table}': {len(res.data) if res.data else 0} rows removed.")
        except Exception as e:
            print(f"Error cleaning '{table}': {e}")

    # 3. Reset Profile
    try:
        sb.table("profiles").update({
            "current_streak": 0,
            "eulercoins": 0,
            "onboarding_completed": False,
            "profile_completed": False,
            "metadata": {},
            "last_active_date": None,
            "username": None, # Force re-claim if desired
            "display_name": None
        }).eq("supabase_uid", user_id).execute()
        print("Profile metrics reset to 0.")
    except Exception as e:
        print(f"Error resetting profile: {e}")

    print("\nAccount successfully reset to new user state.")

if __name__ == "__main__":
    asyncio.run(reset_user())

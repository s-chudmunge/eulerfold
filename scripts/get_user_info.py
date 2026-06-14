import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase: Client = create_client(url, key)

email = "shibinsp43@gmail.com"

# Get user profiles
profile_res = supabase.table("profiles").select("*").eq("email", email).execute()

if not profile_res.data:
    print(f"User {email} not found in profiles.")
else:
    profile = profile_res.data[0]
    print(f"=== Profile Info ===")
    for k, v in profile.items():
        print(f"{k}: {v}")
    
    user_id = profile.get("id")
    supabase_uid = profile.get("supabase_uid")

    if supabase_uid:
        try:
            learning_res = supabase.table("learning_sessions").select("*").eq("user_id", supabase_uid).execute()
            print(f"\n=== Learning Sessions ===")
            for ls in learning_res.data:
                print(ls)
        except Exception as e:
            print(f"Error fetching learning_sessions: {e}")

        try:
            auth_res = supabase.auth.admin.get_user_by_id(supabase_uid)
            print(f"\n=== Auth Data ===")
            print(f"Created At: {auth_res.user.created_at}")
            print(f"Last Sign In: {auth_res.user.last_sign_in_at}")
            print(f"App Metadata: {auth_res.user.app_metadata}")
            print(f"User Metadata: {auth_res.user.user_metadata}")
        except Exception as e:
            print(f"Error fetching auth data: {e}")

    try:
        roadmaps_res = supabase.table("roadmaps").select("id, title, subject, created_at").eq("email", email).execute()
        print(f"\n=== Roadmaps ===")
        for r in roadmaps_res.data:
            print(r)
    except Exception as e:
        print(f"Error fetching roadmaps: {e}")
        
    try:
        tasks_res = supabase.table("study_tasks").select("*").eq("user_email", email).execute()
        print(f"\n=== Study Tasks ===")
        print(f"Total tasks: {len(tasks_res.data)}")
        for t in tasks_res.data[:5]:
            print(t)
    except Exception as e:
        print(f"Error fetching study tasks: {e}")


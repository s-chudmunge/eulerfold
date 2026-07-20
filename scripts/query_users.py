import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env")
    sys.exit(1)

supabase: Client = create_client(url, key)

emails = [
    "sharynn22@gmail.com",
    "pallaviasadi660@gmail.com",
    "lowkey.kappesberg@gmail.com"
]

for email in emails:
    print(f"\n=========================================\nChecking {email}\n=========================================")
    
    profile_res = supabase.table("profiles").select("*").ilike("email", email).execute()
    
    if not profile_res.data:
        print(f"User {email} not found in profiles.")
        continue
        
    profile = profile_res.data[0]
    print(f"Profile found. Created at: {profile.get('created_at')}")
    supabase_uid = profile.get("supabase_uid")
    
    if supabase_uid:
        try:
            auth_res = supabase.auth.admin.get_user_by_id(supabase_uid)
            print(f"Auth created at: {auth_res.user.created_at}")
            print(f"Last sign in: {auth_res.user.last_sign_in_at}")
        except Exception as e:
            print(f"Could not fetch auth user: {e}")
    
    # Roadmaps
    roadmaps_res = supabase.table("roadmaps").select("*").eq("email", email).execute()
    print(f"\nRoadmaps ({len(roadmaps_res.data)}):")
    for r in roadmaps_res.data:
        print(f"  - ID: {r.get('id')}")
        for key, value in r.items():
            if key not in ['roadmap_plan']: # skip large plan json
                print(f"    {key}: {value}")
        
    # Study Tasks
    tasks_res = supabase.table("study_tasks").select("*").eq("user_email", email).execute()
    print(f"\nStudy Tasks ({len(tasks_res.data)}):")
    for t in tasks_res.data[:10]:
        print(f"  - {t.get('title', 'No Title')} [Status: {t.get('status', 'N/A')}, Completed: {t.get('is_completed', 'N/A')}]")
        
    # Learning Sessions
    if supabase_uid:
        try:
            ls_res = supabase.table("learning_sessions").select("*").eq("user_id", supabase_uid).execute()
            print(f"\nLearning Sessions ({len(ls_res.data)}):")
            for i, ls in enumerate(ls_res.data):
                print(f"  - Session {i}: {ls}")
        except Exception as e:
            print(f"Error fetching learning sessions: {e}")
            
    # Activity Logs
    if supabase_uid:
        try:
            act_res = supabase.table("activity_logs").select("*").eq("user_id", supabase_uid).order("created_at", desc=True).limit(5).execute()
            if act_res.data:
                print(f"\nRecent Activity Logs:")
                for act in act_res.data:
                    print(f"  - {act.get('action')} on {act.get('entity_type')} at {act.get('created_at')}")
        except Exception:
            pass # Ignore if table doesn't exist
            
    print("\n")

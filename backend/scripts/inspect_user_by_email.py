
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def inspect_user(email: str):
    supabase = get_supabase_client()
    print(f"Searching for user with email: {email}")
    
    try:
        # 1. Fetch Profile by email
        res_user = supabase.table("profiles").select("*").eq("email", email).maybe_single().execute()
        user_id = None
        if not res_user.data:
            print(f"Error: Profile with email '{email}' not found.")
        else:
            profile = res_user.data
            user_id = profile.get('id')
            print("\n--- Profile Data ---")
            for key, value in profile.items():
                print(f"{key}: {value}")

        # 2. Fetch Roadmaps
        # Check by email OR user_id
        if user_id:
            res_roadmaps = supabase.table("roadmaps").select("*").or_(f"email.eq.{email},user_id.eq.{user_id}").execute()
        else:
            res_roadmaps = supabase.table("roadmaps").select("*").eq("email", email).execute()
        
        if res_roadmaps.data:
            print(f"\n--- Roadmaps Found ({len(res_roadmaps.data)}) ---")
            for i, roadmap in enumerate(res_roadmaps.data, 1):
                print(f"{i}. ID: {roadmap.get('id')}")
                print(f"   Subject: {roadmap.get('subject')}")
                print(f"   Goal: {roadmap.get('goal')}")
                print(f"   Status: {roadmap.get('status')}")
                print(f"   Created At: {roadmap.get('created_at')}")
                print("-" * 30)
        else:
            print(f"No roadmaps found for email/user_id.")

        # 3. Fetch Submissions
        res_subs = supabase.table("submissions").select("*").eq("user_email", email).execute()
        if res_subs.data:
            print(f"\n--- Submissions Found ({len(res_subs.data)}) ---")
            for i, sub in enumerate(res_subs.data, 1):
                print(f"{i}. ID: {sub.get('id')}, Roadmap ID: {sub.get('roadmap_id')}, Status: {sub.get('evaluation_level')}")
                print(f"   Submitted At: {sub.get('submitted_at')}")
                print(f"   Link: {sub.get('link')}")
                print("-" * 30)
        else:
            print("No submissions found.")

        # 4. Fetch Learning Sessions
        if profile.get('supabase_uid'):
            res_sessions = supabase.table("learning_sessions").select("*").eq("user_id", profile.get('supabase_uid')).execute()
            if res_sessions.data:
                print(f"\n--- Learning Sessions Found ({len(res_sessions.data)}) ---")
                for i, sess in enumerate(res_sessions.data, 1):
                    print(f"{i}. ID: {sess.get('id')}, Duration: {sess.get('duration_seconds')}s, Created: {sess.get('created_at')}")
            else:
                print("No learning sessions found.")

        # 5. Fetch User Skills
        res_skills = supabase.table("user_skills").select("*").eq("user_email", email).execute()
        if res_skills.data:
            print(f"\n--- User Skills Found ({len(res_skills.data)}) ---")
            for i, skill in enumerate(res_skills.data, 1):
                print(f"{i}. ID: {skill.get('id')}, Confidence: {skill.get('confidence_score')}, Tier: {skill.get('tier')}")
        else:
            print("No user skills found.")

        # 6. Fetch Practice Sessions
        if profile.get('supabase_uid'):
            res_practice = supabase.table("practice_sessions").select("*").eq("user_id", profile.get('supabase_uid')).execute()
            if res_practice.data:
                print(f"\n--- Practice Sessions Found ({len(res_practice.data)}) ---")
                for i, sess in enumerate(res_practice.data, 1):
                    print(f"{i}. ID: {sess.get('id')}, Roadmap ID: {sess.get('roadmap_id')}, Created: {sess.get('created_at')}")
            else:
                print("No practice sessions found.")

        # 7. Fetch Module Progress
        res_progress = supabase.table("module_progress").select("*").eq("user_email", email).execute()
        if res_progress.data:
            print(f"\n--- Module Progress Found ({len(res_progress.data)}) ---")
            for i, p in enumerate(res_progress.data, 1):
                print(f"{i}. Roadmap ID: {p.get('roadmap_id')}, Module: {p.get('module_number')}, Completed: {p.get('completed')}")
        else:
            print("No module progress entries found.")

        # 8. Fetch Discussions (Threads)
        if user_id:
            try:
                res_disc = supabase.table("discussion_threads").select("*").eq("author_id", user_id).execute()
                if res_disc.data:
                    print(f"\n--- Discussion Threads Found ({len(res_disc.data)}) ---")
                    for i, d in enumerate(res_disc.data, 1):
                        print(f"{i}. ID: {d.get('id')}, Content: {d.get('content')[:50]}...")
                else:
                    print("No discussion threads found.")
            except Exception as e:
                print(f"Error fetching discussions: {e}")

    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python inspect_user_by_email.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    asyncio.run(inspect_user(email))


import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def debug_user():
    supabase = get_supabase_client()
    print("Searching for user: Ajit Chaudhari / ajitashokchaudh_2315")
    try:
        # Search by username
        res_user = supabase.table("profiles").select("*").eq("username", "ajitashokchaudh_2315").maybe_single().execute()
        if res_user.data:
            profile = res_user.data
            print(f"Found Profile by username:")
            print(f"ID: {profile.get('id')}")
            print(f"Username: {profile.get('username')}")
            print(f"Display Name: {profile.get('display_name')}")
            print(f"Email: {profile.get('email')}")
            
            email = profile.get('email')
            if email:
                print(f"\nSearching for roadmaps for email: {email}")
                res_roadmaps = supabase.table("roadmaps").select("id, goal, subject, created_at").eq("email", email).execute()
                if res_roadmaps.data:
                    print(f"Found {len(res_roadmaps.data)} roadmaps:")
                    for roadmap in res_roadmaps.data:
                        print(f"- ID: {roadmap.get('id')}, Subject: {roadmap.get('subject')}, Goal: {roadmap.get('goal')}, Created: {roadmap.get('created_at')}")
                else:
                    print("No roadmaps found for this email.")
        else:
            print("No profile found by username 'ajitashokchaudh_2315'.")
            
            # Try searching by display name
            print("\nSearching by display name 'Ajit Chaudhari'...")
            res_display = supabase.table("profiles").select("*").ilike("display_name", "%Ajit%Chaudhari%").execute()
            if res_display.data:
                print(f"Found {len(res_display.data)} profiles by display name:")
                for p in res_display.data:
                    print(f"- Username: {p.get('username')}, Display Name: {p.get('display_name')}, Email: {p.get('email')}")
            else:
                print("No profiles found by display name.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_user())

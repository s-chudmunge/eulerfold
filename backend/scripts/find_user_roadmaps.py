
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def find_roadmaps(username: str):
    """
    Finds and prints the roadmaps for a given username.
    """
    supabase = get_supabase_client()
    print(f"Searching for user: @{username}")
    
    try:
        # 1. Fetch Profile
        res_user = supabase.table("profiles").select("*").eq("username", username).maybe_single().execute()
        if not res_user.data:
            print(f"Error: Profile with username '{username}' not found.")
            return

        profile = res_user.data
        email = profile.get("email")
        display_name = profile.get("display_name")
        print(f"User Found: {display_name} ({email})")

        # 2. Fetch Roadmaps
        res_roadmaps = supabase.table("roadmaps").select("id, goal, subject, created_at").eq("email", email).execute()
        
        if res_roadmaps.data:
            print(f"\nFound {len(res_roadmaps.data)} roadmaps for {display_name}:")
            for i, roadmap in enumerate(res_roadmaps.data, 1):
                print(f"{i}. ID: {roadmap.get('id')}")
                print(f"   Subject: {roadmap.get('subject')}")
                print(f"   Goal: {roadmap.get('goal')}")
                print(f"   Created At: {roadmap.get('created_at')}")
                print("-" * 30)
        else:
            print(f"No roadmaps found for user {display_name}.")

    except Exception as e:
        print(f"Error querying database: {e}")

if __name__ == "__main__":
    # Default search for Ajit Chaudhari
    target_username = "ajitashokchaudh_2315"
    
    # Allow command line argument for username
    if len(sys.argv) > 1:
        target_username = sys.argv[1].replace("@", "")
        
    asyncio.run(find_roadmaps(target_username))

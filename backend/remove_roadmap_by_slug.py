import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.supabase_client import get_supabase_client

async def remove_roadmap():
    sb = get_supabase_client()
    slug = "book-recommendation-engine"
    
    # First, find the roadmap
    res = sb.table("roadmaps").select("id, title, email, is_public").eq("slug", slug).execute()
    
    if not res.data:
        print(f"No roadmap found with slug: {slug}")
        return

    for roadmap in res.data:
        print(f"Found roadmap: {roadmap['title']} (ID: {roadmap['id']}) by {roadmap['email']}")
        
        # Update is_public to false
        update_res = sb.table("roadmaps").update({"is_public": False}).eq("id", roadmap['id']).execute()
        if update_res.data:
            print(f"Successfully set is_public=False for roadmap ID: {roadmap['id']}")
        else:
            print(f"Failed to update roadmap ID: {roadmap['id']}")

if __name__ == "__main__":
    asyncio.run(remove_roadmap())

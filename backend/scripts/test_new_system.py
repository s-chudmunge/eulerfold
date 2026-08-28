import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from app.core.supabase_client import get_admin_supabase_client
from app.utils.youtube_client import search_youtube_videos

async def run_test():
    sb = get_admin_supabase_client()
    slug = "linear-algebra-quantum-mechanics-101"
    
    # 1. Fetch roadmap
    res = sb.table("roadmaps").select("*").eq("slug", slug).execute()
    if not res.data:
        # Try finding by title similarity or just list roadmaps to find the right one
        res = sb.table("roadmaps").select("id, slug, title").limit(10).execute()
        print(f"Could not find roadmap with slug {slug}. Available roadmaps: {[r['slug'] for r in res.data]}")
        return

    roadmap = res.data[0]
    print(f"Found Roadmap: {roadmap['title']}")
    
    plan = roadmap.get("roadmap_plan")
    if not plan or "modules" not in plan:
        print("Invalid roadmap_plan format")
        return
        
    updated = False
    
    # 2. Iterate through topics and re-search
    for mod in plan["modules"]:
        for topic in mod.get("topics", []):
            topic_title = topic["title"]
            print(f"\nRe-processing: {topic_title}")
            
            # Use the new hybrid system
            videos = await search_youtube_videos(
                query=topic_title,
                max_results=1,
                topic_title=topic_title
            )
            
            if videos:
                vid = videos[0]
                print(f"  -> NEW VIDEO: {vid['video_title']} (ID: {vid['video_id']}, Channel: {vid['channel_name']})")
                topic["video_id"] = vid["video_id"]
                topic["video_title"] = vid["video_title"]
                topic["channel_name"] = vid["channel_name"]
                topic["duration_minutes"] = vid["duration_minutes"]
                updated = True
            else:
                print("  -> No video found")

    # 3. Save back to DB
    if updated:
        sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", roadmap["id"]).execute()
        print("\nSuccessfully updated roadmap in database with new videos!")

if __name__ == "__main__":
    asyncio.run(run_test())

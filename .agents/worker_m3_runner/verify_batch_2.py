import os
import sys
import json

sys.path.append("/home/sankalp/Documents/projects/eulerfold/backend")
from app.core.supabase_client import get_supabase_client

def verify():
    supabase = get_supabase_client()
    res = supabase.table("roadmaps").select("id, title, roadmap_plan").gte("id", 1401).lte("id", 1413).order("id").execute()
    records = res.data or []
    
    print(f"Total roadmaps found in range 1401-1413: {len(records)}")
    if len(records) != 13:
        print(f"FAIL: Expected 13 records, found {len(records)}")
        return False

    all_passed = True
    for r in records:
        rid = r["id"]
        title = r["title"]
        plan = r["roadmap_plan"]
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        modules = plan.get("modules", [])
        total_topics = 0
        topics_with_videos = 0
        total_resources = 0

        for m in modules:
            resources = m.get("resources", [])
            total_resources += len(resources)
            for t in m.get("topics", []):
                total_topics += 1
                if t.get("youtube_video_title") or t.get("youtube_url") or t.get("youtube_video_id"):
                    topics_with_videos += 1

        print(f"ID {rid}: '{title}' | Modules: {len(modules)} | Topics: {topics_with_videos}/{total_topics} with videos | Resources: {total_resources}")
        if topics_with_videos < total_topics or total_resources == 0:
            print(f"  --> WARNING/FAIL for ID {rid}")
            all_passed = False

    if all_passed:
        print("\nVERIFICATION PASSED: All 13 courses (1401-1413) have populated YouTube video titles and resources.")
    else:
        print("\nVERIFICATION COMPLETED WITH ISSUES.")
    return all_passed

if __name__ == "__main__":
    verify()

import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from seed_batch_5 import seed
from smart_video_enrich import enrich_roadmap
from smart_resource_enrich import enrich_resources
from app.core.supabase_client import get_supabase_client

async def main():
    print("Starting Batch 3 course seeding and enrichment...")
    inserted_records = await seed()
    
    enriched_summary = []
    for rec in inserted_records:
        r_id = rec['id']
        title = rec['title']
        print(f"\n============================================================")
        print(f"Starting enrichment for roadmap ID {r_id}: {title}")
        print(f"============================================================\n")
        
        await enrich_roadmap(r_id)
        await enrich_resources(r_id)
        
        # VERIFY ENRICHMENT IN SUPABASE
        sb = get_supabase_client()
        data = sb.table('roadmaps').select('roadmap_plan').eq('id', r_id).execute().data[0]['roadmap_plan']
        has_videos = any(t.get('youtube_video_title') for m in data.get('modules',[]) for t in m.get('topics',[]))
        has_resources = any(len(m.get('resources',[]))>0 for m in data.get('modules',[]))
        print(f"VERIFICATION ID {r_id}: Has Videos = {has_videos}, Has Resources = {has_resources}")
        
        enriched_summary.append({
            "id": r_id,
            "title": title,
            "has_videos": has_videos,
            "has_resources": has_resources
        })
        
    print("\n============================================================")
    print(f"Batch 3 Execution & Enrichment Summary:")
    print(f"Total courses seeded & enriched: {len(enriched_summary)}")
    for item in enriched_summary:
        print(f"  - ID: {item['id']} | Title: {item['title']} | Videos: {item['has_videos']} | Resources: {item['has_resources']}")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(main())

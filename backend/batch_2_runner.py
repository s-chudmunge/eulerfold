import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.supabase_client import get_supabase_client
from seed_batch_4 import seed
from smart_video_enrich import enrich_roadmap
from smart_resource_enrich import enrich_resources

async def main():
    print("Starting Batch 2 course seeding and enrichment...")
    supabase = get_supabase_client()
    res = supabase.table("roadmaps").select("id, title").gte("id", 1401).lte("id", 1413).order("id").execute()
    if res.data and len(res.data) == 13:
        print(f"Found {len(res.data)} existing records for Batch 2 (IDs 1401-1413). Proceeding with enrichment...")
        inserted_records = res.data
    else:
        inserted_records = await seed()
    
    enriched_summary = []
    for rec in inserted_records:
        roadmap_id = rec['id']
        title = rec['title']
        print(f"\n============================================================")
        print(f"Enriching Roadmap ID {roadmap_id}: {title}")
        print(f"============================================================\n")
        
        await enrich_roadmap(roadmap_id)
        await enrich_resources(roadmap_id)
        
        enriched_summary.append({
            "id": roadmap_id,
            "title": title
        })
        
    print("\n============================================================")
    print(f"Batch 2 Execution & Enrichment Summary:")
    print(f"Total courses seeded & enriched: {len(enriched_summary)}")
    for item in enriched_summary:
        print(f"  - ID: {item['id']} | Title: {item['title']}")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(main())

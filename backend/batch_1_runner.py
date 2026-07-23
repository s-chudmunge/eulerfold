import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from seed_batch_3 import seed
from smart_video_enrich import enrich_roadmap
from smart_resource_enrich import enrich_resources

async def main():
    print("Starting Batch 1 course seeding and enrichment...")
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
    print(f"Batch 1 Execution & Enrichment Summary:")
    print(f"Total courses seeded & enriched: {len(enriched_summary)}")
    for item in enriched_summary:
        print(f"  - ID: {item['id']} | Title: {item['title']}")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(main())

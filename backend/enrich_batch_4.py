import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from smart_video_enrich import enrich_roadmap
from smart_resource_enrich import enrich_resources
from app.core.supabase_client import get_supabase_client

ROADMAP_IDS = [
    1427, 1428, 1429, 1430, 1431, 1432, 1433, 1434, 1435, 1436, 1437, 1438, 1439
]

async def main():
    print(f"Starting enrichment for Batch 4 roadmap IDs: {ROADMAP_IDS}")
    
    enriched_summary = []
    sb = get_supabase_client()

    for r_id in ROADMAP_IDS:
        print(f"\n============================================================")
        print(f"Starting enrichment for roadmap ID {r_id}...")
        print(f"============================================================\n")
        
        await enrich_roadmap(r_id)
        await enrich_resources(r_id)
        
        # VERIFY ENRICHMENT IN SUPABASE
        data = sb.table('roadmaps').select('title, roadmap_plan').eq('id', r_id).execute().data[0]
        title = data['title']
        plan = data['roadmap_plan']
        has_videos = any(bool(t.get('youtube_video_title')) for m in plan.get('modules', []) for t in m.get('topics', []))
        has_resources = any(len(m.get('resources', [])) > 0 for m in plan.get('modules', []))
        print(f"VERIFICATION ID {r_id} ({title}): Has Videos = {has_videos}, Has Resources = {has_resources}")
        
        enriched_summary.append({
            "id": r_id,
            "title": title,
            "has_videos": has_videos,
            "has_resources": has_resources
        })
        
    print("\n============================================================")
    print(f"Batch 4 Execution & Enrichment Verification Summary:")
    print(f"Total courses verified: {len(enriched_summary)}")
    all_passed = True
    for item in enriched_summary:
        status = "PASSED" if (item['has_videos'] and item['has_resources']) else "FAILED"
        if not (item['has_videos'] and item['has_resources']):
            all_passed = False
        print(f"  [{status}] ID: {item['id']} | Title: {item['title']} | Videos: {item['has_videos']} | Resources: {item['has_resources']}")
    print(f"ALL ENRICHMENTS VERIFIED: {all_passed}")
    print("============================================================\n")

if __name__ == "__main__":
    asyncio.run(main())

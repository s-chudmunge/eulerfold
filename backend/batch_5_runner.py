import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from seed_batch_7 import seed
from smart_video_enrich import enrich_roadmap
from smart_resource_enrich import enrich_resources
from app.core.supabase_client import get_supabase_client

async def main():
    inserted_records = await seed()
    for rec in inserted_records:
        r_id = rec['id']
        print(f'Starting enrichment for roadmap ID {r_id}...')
        await enrich_roadmap(r_id)
        await enrich_resources(r_id)
        # VERIFY ENRICHMENT IN SUPABASE
        sb = get_supabase_client()
        data = sb.table('roadmaps').select('roadmap_plan').eq('id', r_id).execute().data[0]['roadmap_plan']
        has_videos = any(t.get('youtube_video_title') for m in data.get('modules',[]) for t in m.get('topics',[]))
        has_resources = any(len(m.get('resources',[]))>0 for m in data.get('modules',[]))
        print(f'VERIFICATION ID {r_id}: Has Videos = {has_videos}, Has Resources = {has_resources}')

if __name__ == "__main__":
    asyncio.run(main())

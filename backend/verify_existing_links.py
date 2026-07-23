import asyncio
import httpx
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client

async def verify_url(url: str, client: httpx.AsyncClient) -> bool:
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        resp = await client.head(url, headers=headers, follow_redirects=True, timeout=5.0)
        if resp.status_code < 400:
            return True
        resp = await client.get(url, headers=headers, follow_redirects=True, timeout=5.0)
        return resp.status_code < 400
    except Exception as e:
        return False

async def main():
    sb = get_supabase_client()
    
    # We want to check courses 1371, 1372, 1373, 1374, 1375, 1376, 1377
    rids = [1371, 1372, 1373, 1374, 1375, 1376, 1377]
    
    async with httpx.AsyncClient() as client:
        for rid in rids:
            res = sb.table('roadmaps').select('title, roadmap_plan').eq('id', rid).execute()
            if not res.data:
                continue
                
            course = res.data[0]
            plan = course['roadmap_plan']
            title = course['title']
            
            needs_update = False
            
            for mod in plan.get('modules', []):
                valid_resources = []
                for resource in mod.get('resources', []):
                    url = resource.get('url')
                    if url:
                        is_valid = await verify_url(url, client)
                        if is_valid:
                            valid_resources.append(resource)
                        else:
                            print(f"[REMOVED] Broken link in '{title}': {url}")
                            needs_update = True
                            
                mod['resources'] = valid_resources
                
            if needs_update:
                print(f"Updating course {rid} ({title}) to remove broken links...")
                sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', rid).execute()
            else:
                print(f"Course {rid} ({title}) has 100% valid links.")

if __name__ == "__main__":
    asyncio.run(main())

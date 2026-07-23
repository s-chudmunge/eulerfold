import asyncio
import argparse
import sys
import os

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client
from ddgs import DDGS

async def enrich_resources(roadmap_id: int):
    sb = get_supabase_client()
    
    # 1. Fetch roadmap
    res = sb.table('roadmaps').select('title, roadmap_plan, subject').eq('id', roadmap_id).execute()
    if not res.data:
        print(f"Roadmap ID {roadmap_id} not found.")
        return
        
    course = res.data[0]
    plan = course['roadmap_plan']
    print(f"\n============================================================")
    print(f"Enriching Resources for: {course['title']}")
    print(f"============================================================\n")
    
    # 2. Iterate modules
    with DDGS() as ddgs:
        for i, module in enumerate(plan.get('modules', [])):
            print(f"Module {i+1}: {module.get('title')}")
            
            # Use optimal_search_query if present, otherwise construct one
            query = module.get('optimal_search_query')
            if not query:
                query = f"{course['subject']} {module.get('title')} documentation tutorial"
            
            print(f"  Searching DDG for: '{query}'")
            
            try:
                # Fetch top 3 results
                results = [r for r in ddgs.text(query, max_results=3)]
                
                new_resources = []
                for idx, r in enumerate(results):
                    # Skip youtube links (we have video enrichment for that)
                    if 'youtube.com' in r['href'] or 'youtu.be' in r['href']:
                        continue
                        
                    new_resources.append({
                        "title": r['title'],
                        "url": r['href'],
                        "type": "article"
                    })
                    print(f"    ✓ Added: {r['title']}")
                    
                # Overwrite module resources with real live search results
                module['resources'] = new_resources
                
            except Exception as e:
                print(f"  [ERROR] DDG search failed: {e}")
                
    # 3. Save back to Supabase
    print(f"\nSaving resources to Supabase...")
    sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', roadmap_id).execute()
    print("Done!\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("roadmap_id", type=int, help="The roadmap ID to enrich")
    args = parser.parse_args()
    
    asyncio.run(enrich_resources(args.roadmap_id))

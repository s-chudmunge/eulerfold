import os
import sys

# Ensure backend root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.supabase_client import get_supabase_client
from ddgs import DDGS
import time

def fix_roadmap():
    supabase = get_supabase_client()
    slug = "the-complete-guide-to-number-theory"
    
    print(f"Fetching roadmap: {slug}")
    response = supabase.table("roadmaps").select("*").eq("slug", slug).execute()
    
    if not response.data:
        print("Roadmap not found!")
        return
        
    roadmap = response.data[0]
    roadmap_plan = roadmap.get("roadmap_plan")
    
    if not roadmap_plan or "modules" not in roadmap_plan:
        print("No modules found in roadmap_plan")
        return
        
    modules = roadmap_plan["modules"]
    updated = False
    
    for i, module in enumerate(modules):
        print(f"\nProcessing module {i+1}/{len(modules)}: {module.get('title')}")
        
        # Check if resources already exist
        if module.get("resources") and len(module.get("resources")) > 0:
            print("Resources already exist, skipping...")
            # We can overwrite them or skip. Given the request, let's overwrite to ensure they are there
            pass
            
        search_query = module.get("optimal_search_query")
        if not search_query:
            # Fallback to title if optimal search query wasn't generated
            search_query = f"{roadmap.get('subject')} {module.get('title')} tutorial"
            
        print(f"Searching DuckDuckGo for: '{search_query}'")
        try:
            with DDGS() as ddgs:
                ddg_results = list(ddgs.text(search_query, max_results=3))
                
            if ddg_results:
                print(f"Found {len(ddg_results)} results.")
                resources = [{"title": r["title"], "url": r["href"], "type": "article"} for r in ddg_results]
                module["resources"] = resources
                updated = True
            else:
                print("No results found.")
        except Exception as e:
            print(f"DDG search failed: {e}")
            
        # Avoid rate limiting
        time.sleep(1)
        
    if updated:
        print("\nUpdating roadmap in database...")
        supabase.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", roadmap["id"]).execute()
        print("Successfully updated!")
    else:
        print("\nNo updates were made.")

if __name__ == "__main__":
    fix_roadmap()

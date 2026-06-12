import os
import sys

# Move to backend app directory to allow correct imports
os.chdir("backend/app")
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from core.supabase_client import get_admin_supabase_client
import json

def check():
    sb = get_admin_supabase_client()
    res = sb.table("roadmaps").select("id, title, roadmap_plan").eq("id", 75).execute()
    roadmaps = res.data
    
    for r in roadmaps:
        print(f"\n--- Roadmap: {r['title']} ---")
        roadmap_plan = r.get("roadmap_plan", {})
        modules = roadmap_plan.get("modules", [])
        
        for mod in modules[:2]:  # Check first two modules
            print(f"Module: {mod.get('title')}")
            resources = mod.get("resources", [])
            for res in resources:
                print(f"  - [{res.get('type')}] {res.get('title')}: {res.get('url')}")
            print()

if __name__ == "__main__":
    check()

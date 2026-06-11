import asyncio
import os
from dotenv import load_dotenv

# Ensure environment is loaded so Supabase client can initialize
load_dotenv()

from app.core.supabase_client import get_supabase_client
sb = get_supabase_client()
res = sb.table("roadmaps").select("roadmap_plan").eq("slug", "intensive-cloud-architecture-mastery-3-week-sprint").execute()
if res.data:
    import json
    plan = res.data[0]["roadmap_plan"]
    if isinstance(plan, str):
        plan = json.loads(plan)
    for m in plan.get("modules", []):
        print(f"\nModule: {m.get('title')}")
        print(f"Optimal Search Query: {m.get('optimal_search_query')}")
        for r in m.get("resources", []):
            print(f"  Resource: {r}")
else:
    print("Roadmap not found")

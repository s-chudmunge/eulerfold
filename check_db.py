import sys
import os
import asyncio

sys.path.append(os.path.abspath('backend'))
from app.core.supabase_client import get_supabase_client

async def main():
    sb = get_supabase_client()
    res = sb.table("roadmaps").select("roadmap_plan").eq("slug", "number-theory-fundamentals-from-divisibility-to-algorithms").execute()
    if not res.data:
        print("Roadmap not found!")
        return
    
    plan = res.data[0].get("roadmap_plan", {})
    if isinstance(plan, str):
        import json
        plan = json.loads(plan)
        
    modules = plan.get("modules", [])
    for idx, m in enumerate(modules):
        print(f"Module {idx + 1}: {m.get('title')}")
        print(f"  optimal_search_query: {m.get('optimal_search_query')}")
        print(f"  resources: {m.get('resources')}")

asyncio.run(main())

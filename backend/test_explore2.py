import asyncio
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()
res = sb.table("roadmaps").select("id, roadmap_plan, time_value").eq("is_public", True).limit(2).execute()
for r in res.data:
    plan = r.get("roadmap_plan", {})
    if isinstance(plan, str):
        import json
        try:
            plan = json.loads(plan)
        except:
            plan = {}
    modules = plan.get("modules", []) if plan else []
    public_modules = [m for m in modules if not m.get("is_extension")]
    print(f"ID: {r['id']}, Time Value: {r.get('time_value')}, Week Count: {len(public_modules)}")

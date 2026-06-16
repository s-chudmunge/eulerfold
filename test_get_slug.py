import asyncio
from backend.app.routers.roadmaps import get_roadmap_by_slug
from backend.app.core.auth import User
from fastapi import BackgroundTasks

async def run():
    u = User(id=1, email="eulerfold@gmail.com", is_active=True, supabase_uid="123")
    res = await get_roadmap_by_slug("llm-fine-tuning-from-scratch", background_tasks=BackgroundTasks(), current_user=u)
    print("For eulerfold@gmail.com, roadmap ID returned is:", res["id"])
    
    u2 = User(id=2, email="jukeask1@gmail.com", is_active=True, supabase_uid="456")
    res2 = await get_roadmap_by_slug("llm-fine-tuning-from-scratch", background_tasks=BackgroundTasks(), current_user=u2)
    print("For jukeask1@gmail.com, roadmap ID returned is:", res2["id"])

asyncio.run(run())

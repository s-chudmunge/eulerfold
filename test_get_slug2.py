import asyncio
from backend.app.routers.roadmaps import get_roadmap_by_slug
from backend.app.core.auth import User
from fastapi import BackgroundTasks

async def run():
    u = User(id=1, email="eulerfold@gmail.com", is_active=True, supabase_uid="556fb0d1-1a4a-47e7-ac4c-b55d9ac2ab26")
    res = await get_roadmap_by_slug("llm-fine-tuning-from-scratch", background_tasks=BackgroundTasks(), current_user=u)
    print("For eulerfold@gmail.com, roadmap ID returned is:", res.id, "with email:", res.email)

asyncio.run(run())

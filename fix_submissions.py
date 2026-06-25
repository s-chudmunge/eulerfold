import sys, os, asyncio
sys.path.append(os.path.join(os.getcwd(), "backend"))
os.chdir("backend")
from app.core.supabase_client import get_admin_supabase_client
sb = get_admin_supabase_client()
# Make sure all submissions for this roadmap are Solid
sb.table("submissions").update({"evaluation_level": "Solid"}).eq("roadmap_id", 1358).execute()

# Trigger transition again to make sure it runs and updates the status to completed
from app.routers.roadmaps import transition_roadmap_status
async def main():
    await transition_roadmap_status(1358, "active", "jukeask@gmail.com", "b083da08-835f-458a-9b53-1ee01e3036ba")

asyncio.run(main())

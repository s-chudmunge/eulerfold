import asyncio
from app.core.supabase_client import get_supabase_client

async def main():
    sb = get_supabase_client()
    res = sb.table("roadmaps").select("id, skills_extracted").eq("id", 1337).execute()
    print("DB row:", res.data)

asyncio.run(main())

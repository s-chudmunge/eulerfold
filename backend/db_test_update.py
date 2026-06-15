import asyncio
from app.core.supabase_client import get_supabase_client

async def main():
    sb = get_supabase_client()
    res = sb.table("mcq_sessions").update({"status": "active"}).eq("id", "59267e1b-a839-468a-8604-961235532cdd").execute()
    print("Update result:", res.data)

asyncio.run(main())

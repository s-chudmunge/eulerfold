import asyncio
from backend.app.core.supabase_client import get_supabase_client

def test():
    sb = get_supabase_client()
    res = sb.table("roadmaps").select("id", count="exact").limit(1).execute()
    print("Count:", res.count)
    print("Data:", res.data)

test()

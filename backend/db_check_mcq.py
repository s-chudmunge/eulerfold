import asyncio
from app.core.supabase_client import get_supabase_client

async def main():
    sb = get_supabase_client()
    res = sb.table("mcq_sessions").select("id, status, user_answers, questions").eq("id", "59267e1b-a839-468a-8604-961235532cdd").execute()
    if res.data:
        data = res.data[0]
        print("Status:", data.get("status"))
        print("User Answers:", data.get("user_answers"))
        print("Num Questions:", len(data.get("questions", [])))
    else:
        print("Not found")

asyncio.run(main())

import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv("frontend/.env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
sb: Client = create_client(url, key)

res = sb.table("roadmaps").select("*").eq("slug", "llm-fine-tuning-from-scratch").execute()
print(f"Number of rows visible to ANON: {len(res.data)}")
for r in res.data:
    print(r["id"], r["is_public"])

import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv("frontend/.env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
sb: Client = create_client(url, key)

res = sb.table("roadmaps").select("*").eq("slug", "llm-fine-tuning-from-scratch").limit(1).execute()
if res.data:
    r = res.data[0]
    print(f"ID: {r['id']}, is_public: {r['is_public']}, email: {r.get('email')}")

import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
# Use the ANON key
key = os.environ.get("SUPABASE_ANON_KEY", os.environ.get("SUPABASE_KEY").replace("service_role", "anon"))
# Wait, I don't have SUPABASE_ANON_KEY in backend/.env, let's grab it from frontend/.env.local
load_dotenv("frontend/.env.local")
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
sb: Client = create_client(url, key)

res = sb.table("roadmaps").select("*").eq("slug", "llm-fine-tuning-from-scratch").execute()
print("Anon data length:", len(res.data))

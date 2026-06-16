import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
sb: Client = create_client(url, key)

res = sb.table("roadmaps").select("*").eq("id", 102).execute()
print(f"Roadmap 102 email: {res.data[0].get('email')}")

import asyncio
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
sb: Client = create_client(url, key)

res = sb.table("roadmaps").select("id, email").in_("id", [102, 80, 1340, 1323, 76]).execute()
for r in res.data:
    print(r["id"], r["email"])

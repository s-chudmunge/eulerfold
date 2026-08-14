import os
import asyncio
from supabase import create_client

from dotenv import load_dotenv
load_dotenv("backend/.env")
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

sb = create_client(supabase_url, supabase_key)

# Check if article-power-iteration exists
res = sb.table("content_embeddings").select("id, title, content_type").eq("id", "article-power-iteration").execute()
print("Exists:", res.data)


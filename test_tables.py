import os
from supabase import create_client

from dotenv import load_dotenv
load_dotenv("backend/.env")
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

sb = create_client(supabase_url, supabase_key)

try:
    res = sb.table("articles").select("*").limit(1).execute()
    print("Articles table exists:", res.data)
except Exception as e:
    print("No articles table:", e)

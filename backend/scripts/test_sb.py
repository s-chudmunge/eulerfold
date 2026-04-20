import os
from supabase import create_client
from dotenv import load_dotenv

# Load from backend/.env explicitly
load_dotenv("backend/.env")

url = os.getenv("SUPABASE_URL")
# Based on my investigation, SUPABASE_KEY is the service role key for this project
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print(f"Missing URL ({url}) or Key ({'set' if key else 'not set'})")
    exit(1)

try:
    sb = create_client(url, key)
    res = sb.table("canonical_skills").select("id, name").limit(1).execute()
    print("Success:", res.data)
except Exception as e:
    print("Error:", e)

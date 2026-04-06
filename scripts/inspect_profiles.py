import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("frontend/.env")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

# Select first row from profiles
res = supabase.table("profiles").select("*").limit(1).execute()
if res.data:
    print(f"Available columns in 'profiles': {list(res.data[0].keys())}")
else:
    print("No profiles found to inspect.")

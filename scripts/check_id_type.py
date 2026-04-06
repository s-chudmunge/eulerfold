import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("frontend/.env")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

res = supabase.table("profiles").select("id").limit(1).execute()
if res.data:
    print(f"Sample Profile ID: {res.data[0]['id']} (Type: {type(res.data[0]['id'])})")
else:
    print("No profiles found to check.")

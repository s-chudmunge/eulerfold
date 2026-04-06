import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("frontend/.env")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(url, key)

# Select first row to see keys
response = supabase.table("roadmaps").select("*").limit(1).execute()
if response.data:
    print(f"Columns in 'roadmaps' table: {list(response.data[0].keys())}")
else:
    print("Table is empty, checking profiles...")
    p_res = supabase.table("profiles").select("*").limit(1).execute()
    if p_res.data:
        print(f"Columns in 'profiles' table: {list(p_res.data[0].keys())}")

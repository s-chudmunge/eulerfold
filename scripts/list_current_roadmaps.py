import os
from supabase import create_client
from dotenv import load_dotenv

# Load frontend .env to get Supabase credentials
load_dotenv("frontend/.env")

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Supabase credentials not found in frontend/.env")
    exit(1)

supabase = create_client(url, key)

# Fetch roadmaps
response = supabase.table("roadmaps").select("title, subject").limit(100).execute()

if response.data:
    print(f"Found {len(response.data)} roadmaps:\n")
    for r in response.data:
        print(f"- {r.get('title')} ({r.get('subject')})")
else:
    print("No roadmaps found in database.")

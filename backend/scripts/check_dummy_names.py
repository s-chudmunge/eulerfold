import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def check_names():
    res = supabase.table("profiles")\
        .select("username, display_name")\
        .ilike("email", "%@dummy.eulerfold.com")\
        .limit(50)\
        .execute()
    
    if res.data:
        print(f"Sample of {len(res.data)} dummy user profiles:")
        for i, p in enumerate(res.data):
            print(f"{i+1}. {p['display_name']} (@{p['username']})")
    else:
        print("No dummy profiles found.")

if __name__ == "__main__":
    check_names()

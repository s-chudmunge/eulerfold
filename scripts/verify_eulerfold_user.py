import os
from supabase import create_client
from dotenv import load_dotenv

# Load backend .env for service role key
load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def verify():
    res = supabase.table("profiles").select("id, email, username").eq("username", "eulerfold").execute()
    if res.data:
        print(f"VERIFIED_USER_DATA: {res.data[0]}")
    else:
        print("USER_NOT_FOUND")

if __name__ == "__main__":
    verify()

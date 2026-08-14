import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

import sys
sys.path.append("backend")

from app.core.supabase_client import get_supabase_client

def list_all_users():
    supabase = get_supabase_client()
    response = supabase.table("profiles").select("email").execute()
    users = response.data
    
    emails = [u.get("email") for u in users if u.get("email")]
    
    for email in emails:
        print(f"User: {email}")

if __name__ == "__main__":
    list_all_users()

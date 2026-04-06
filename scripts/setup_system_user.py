import os
from supabase import create_client
from dotenv import load_dotenv

# Load backend .env for service role key
load_dotenv("backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

SYSTEM_ID = 999
SYSTEM_UID = "00000000-0000-0000-0000-000000000000"
SYSTEM_USERNAME = "eulerfold"
SYSTEM_EMAIL = "official@eulerfold.com"

def setup():
    # Check if exists
    res = supabase.table("profiles").select("id").eq("username", SYSTEM_USERNAME).execute()
    if res.data:
        print(f"System user '{SYSTEM_USERNAME}' already exists with ID: {res.data[0]['id']}")
        return res.data[0]['id']
    
    # Create with integer ID
    new_profile = {
        "id": SYSTEM_ID,
        "supabase_uid": SYSTEM_UID,
        "username": SYSTEM_USERNAME,
        "email": SYSTEM_EMAIL,
        "display_name": "EulerFold Official",
        "is_admin": True,
        "is_pro": True,
        "roadmap_credits": 9999
    }
    
    try:
        supabase.table("profiles").insert(new_profile).execute()
        print(f"Successfully created system user '{SYSTEM_USERNAME}' with ID {SYSTEM_ID}")
        return SYSTEM_ID
    except Exception as e:
        print(f"Error creating system user: {e}")
        return None

if __name__ == "__main__":
    setup()

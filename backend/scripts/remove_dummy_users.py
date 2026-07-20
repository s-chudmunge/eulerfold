import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="../.env")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Supabase credentials not found.")
    sys.exit(1)

supabase: Client = create_client(url, key)

dummy_emails = [
    "sharynn22@gmail.com",
    "pallaviasadi660@gmail.com",
    "lowkey.kappesberg@gmail.com"
]

def remove_users():
    for email in dummy_emails:
        print(f"Processing {email}...")
        res = supabase.table("profiles").select("supabase_uid").eq("email", email).execute()
        
        if not res.data:
            print(f"User with email {email} not found in profiles.")
            continue
            
        uid = res.data[0]["supabase_uid"]
        print(f"Found uid {uid} for {email}")
        
        try:
            supabase.auth.admin.delete_user(uid)
            print(f"Deleted user {uid} from auth.")
        except Exception as e:
            print(f"Error deleting user {uid} from auth: {e}")
            
        try:
            supabase.table("profiles").delete().eq("supabase_uid", uid).execute()
            print(f"Deleted profile for {uid}.")
        except Exception as e:
            print(f"Error deleting profile {uid}: {e}")

if __name__ == "__main__":
    remove_users()

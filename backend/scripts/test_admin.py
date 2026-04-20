import os
import uuid
import time
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_admin_create():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    
    try:
        res = sb.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": "Test User"}
        })
        uid = res.user.id
        print("Auth Admin Create Success:", uid)
        
        for i in range(5):
            time.sleep(1)
            p_res = sb.table("profiles").select("*").eq("supabase_uid", uid).execute()
            if p_res.data:
                print(f"Profile check (attempt {i+1}):", p_res.data)
                break
            else:
                print(f"Profile check (attempt {i+1}): Not found yet")
        
        # sb.auth.admin.delete_user(uid)
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_admin_create()

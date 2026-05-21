import os
import random
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
sb: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# --- Culturally Consistent Pools ---

POOLS = [
    {
        "name": "indian",
        "first": [
            "Aarav", "Arjun", "Vivaan", "Aditya", "Vihaan", "Pranav", "Aryan", "Reyansh", "Sai", "Ishaan",
            "Ananya", "Diya", "Ira", "Myra", "Saanvi", "Aadhya", "Pari", "Anvi", "Navya", "Zoya",
            "Advait", "Kabir", "Rohan", "Yuvraj", "Yash", "Hrithik", "Adi", "Karthik", "Abhishek", "Rahul",
            "Tanvi", "Neha", "Isha", "Yesha", "Sneha", "Riya", "Pooja", "Kiara", "Siddharth", "Ishita",
            "Aman", "Rishabh", "Tanya", "Kavya", "Sarthak", "Mehak", "Dev", "Aradhya"
        ],
        "last": [
            "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Singh", "Reddy", "Patel", "Iyer", "Nair",
            "Mehta", "Deshmukh", "Shah", "Tanwar", "Chowdhury", "Jain", "Bose", "Chatterjee", "Kulkarni", "Patil",
            "Aggarwal", "Bansal", "Goel", "Khanna", "Mishra", "Pandey", "Srivastava", "Yadav", "Tiwari", "Dubey"
        ]
    }
]

def generate_username(first, last):
    suffix = random.randint(10, 9999)
    return f"{first.lower()}_{last.lower()}_{suffix}"

def fix_profile_names():
    print("Fetching dummy profiles to rectify...")
    res = sb.table("profiles").select("id, email").ilike("email", "%@dummy.eulerfold.com").execute()
    profiles = res.data
    
    if not profiles:
        print("No dummy profiles found.")
        return

    print(f"Found {len(profiles)} profiles. Rectifying names...")
    
    updates_count = 0
    for p in profiles:
        # Pick a random cultural pool
        pool = random.choice(POOLS)
        first = random.choice(pool["first"])
        last = random.choice(pool["last"])
        
        display_name = f"{first} {last}"
        username = generate_username(first, last)
        
        # We also need to update the email to match the new username for consistency
        new_email = f"{username}@dummy.eulerfold.com"
        
        try:
            sb.table("profiles").update({
                "display_name": display_name,
                "username": username,
                "email": new_email
            }).eq("id", p["id"]).execute()
            
            updates_count += 1
            if updates_count % 20 == 0:
                print(f"Updated {updates_count} profiles...")
        except Exception as e:
            print(f"Error updating profile {p['id']}: {e}")

    print(f"Successfully rectified {updates_count} profile names.")

if __name__ == "__main__":
    fix_profile_names()

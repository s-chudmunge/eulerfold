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
        "name": "western",
        "first": ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Quinn", "Avery", "Parker", "Sam", "Charlie", "Robin", "Dakota", "Skyler", "Peyton", "Emerson", "Finley", "Sage", "River", "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore", "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn"],
        "last": ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "White", "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Hill"]
    },
    {
        "name": "indian",
        "first": ["Aarav", "Arjun", "Vivaan", "Aditya", "Vihaan", "Pranav", "Aryan", "Reyansh", "Sai", "Ishaan", "Ananya", "Diya", "Ira", "Myra", "Saanvi", "Aadhya", "Pari", "Anvi", "Navya", "Zoya"],
        "last": ["Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Singh", "Reddy", "Patel", "Iyer", "Nair"]
    },
    {
        "name": "japanese",
        "first": ["Yuki", "Haruto", "Sota", "Yuma", "Itsuki", "Riku", "Kaito", "Asahi", "Akira", "Ren", "Mei", "Aoi", "Yui", "Hina", "Himari", "Ichika", "Sara", "Rio", "Noa", "An"],
        "last": ["Tanaka", "Sato", "Suzuki", "Takahashi", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"]
    },
    {
        "name": "hispanic",
        "first": ["Mateo", "Santiago", "Matias", "Sebastian", "Lucas", "Iker", "Nicolas", "Alejandro", "Samuel", "Diego", "Sofia", "Isabella", "Camila", "Valentina", "Valeria", "Mariana", "Luciana", "Daniela", "Gabriela", "Victoria"],
        "last": ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores"]
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

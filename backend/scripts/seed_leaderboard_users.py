import os
import random
import uuid
import datetime
import time
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") # This is the service role key

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials missing.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Quinn", "Avery", "Parker",
    "Sam", "Charlie", "Robin", "Dakota", "Skyler", "Peyton", "Emerson", "Finley", "Sage", "River",
    "Liam", "Noah", "Oliver", "Elijah", "James", "William", "Benjamin", "Lucas", "Henry", "Theodore",
    "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn",
    "Aarav", "Arjun", "Vivaan", "Aditya", "Vihaan", "Pranav", "Aryan", "Reyansh", "Sai", "Ishaan",
    "Ananya", "Diya", "Ira", "Myra", "Saanvi", "Aadhya", "Pari", "Anvi", "Navya", "Zoya",
    "Yuki", "Haruto", "Sota", "Yuma", "Itsuki", "Riku", "Kaito", "Asahi", "Akira", "Ren",
    "Mei", "Aoi", "Yui", "Hina", "Himari", "Ichika", "Sara", "Rio", "Noa", "An"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Singh", "Reddy", "Patel", "Iyer", "Nair",
    "Tanaka", "Sato", "Suzuki", "Takahashi", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"
]

def generate_username(first, last):
    suffix = random.randint(10, 9999)
    return f"{first.lower()}_{last.lower()}_{suffix}"

def seed_leaderboard_users(count=150):
    print(f"Starting to seed {count} leaderboard users...")
    
    # 1. Fetch canonical skills
    cs_res = sb.table("canonical_skills").select("id, name").execute()
    if not cs_res.data:
        print("No canonical skills found. Please seed them first.")
        return
    
    skill_pool = cs_res.data
    print(f"Found {len(skill_pool)} canonical skills.")

    now = datetime.datetime.now(datetime.timezone.utc)
    
    users_created = 0
    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        username = generate_username(first, last)
        display_name = f"{first} {last}"
        email = f"{username}@dummy.eulerfold.com"
        
        try:
            # A. Create Auth User
            auth_res = sb.auth.admin.create_user({
                "email": email,
                "password": "password123",
                "email_confirm": True,
                "user_metadata": {"full_name": display_name}
            })
            
            # The library might return the user object directly or wrapped
            if hasattr(auth_res, "user"):
                supabase_uid = auth_res.user.id
            else:
                # Some versions return it differently
                supabase_uid = auth_res["id"] if isinstance(auth_res, dict) else auth_res.id

            # B. Create Profile (Manually, since trigger might be finicky)
            # We'll wait a split second to see if trigger worked, but then we'll upsert anyway
            # Actually, let's just upsert.
            
            profile_data = {
                "supabase_uid": supabase_uid,
                "email": email,
                "username": username,
                "display_name": display_name,
                "is_active": True,
                "profile_completed": True,
                "onboarding_completed": True,
                "current_streak": random.randint(0, 30),
                "eulercoins": random.randint(100, 5000),
                "last_active_date": (now - datetime.timedelta(days=random.randint(0, 7))).isoformat(),
                "created_at": (now - datetime.timedelta(days=random.randint(30, 180))).isoformat(),
                "is_pro": random.random() < 0.2,
                "roadmap_credits": 10.0 if random.random() < 0.2 else 1.0,
                "tos_version": "2026-03"
            }
            
            sb.table("profiles").upsert(profile_data, on_conflict="supabase_uid").execute()
            
            # C. Assign 1-3 random skills
            num_skills = random.randint(1, 3)
            user_skills = random.sample(skill_pool, num_skills)
            
            for skill in user_skills:
                score = round(random.uniform(60, 98), 1)
                tier = "strong" if score >= 80 else "developing"
                
                skill_data = {
                    "user_id": supabase_uid,
                    "canonical_skill_id": skill["id"],
                    "confidence_score": score,
                    "tier": tier,
                    "pow_score": score * 0.9,
                    "practice_score": score * 1.1 if score < 90 else 99.0,
                    "topic_completion": 100.0,
                    "depth_score": round(random.uniform(50, 95), 1),
                    "time_invested": random.randint(10, 100),
                    "last_updated": now.isoformat(),
                    "user_email": email
                }
                sb.table("user_skills").insert(skill_data).execute()
            
            # D. Add practice progress
            if random.random() < 0.6:
                num_practice = random.randint(3, 20)
                practice_rows = []
                session_id = str(uuid.uuid4())
                for _ in range(num_practice):
                    practice_rows.append({
                        "user_id": supabase_uid,
                        "session_id": session_id,
                        "resource_id": str(uuid.uuid4()),
                        "completed": True,
                        "updated_at": (now - datetime.timedelta(hours=random.randint(1, 72))).isoformat()
                    })
                try:
                    sb.table("practice_progress").insert(practice_rows).execute()
                except:
                    pass
            
            users_created += 1
            if users_created % 5 == 0:
                print(f"Created {users_created} users...")
                
            # Small delay to avoid hammering the API too hard
            time.sleep(0.1)
                
        except Exception as e:
            print(f"Error creating user {username}: {e}")

    print(f"Successfully seeded {users_created} users.")
    print("Leaderboard refresh will happen automatically via cron.")

if __name__ == "__main__":
    seed_leaderboard_users(150)

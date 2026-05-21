import os
import random
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
sb: Client = create_client(url, key)

# 150 Unique Indian Name Pairs
UNIQUE_NAMES = [
    ("Arnav", "Iyer"), ("Ishaan", "Chatterjee"), ("Advait", "Deshpande"), ("Siddharth", "Menon"),
    ("Kabir", "Mehta"), ("Rohan", "Srivastava"), ("Vihaan", "Kulkarni"), ("Aryan", "Mukherjee"),
    ("Aditya", "Reddy"), ("Reyansh", "Bansal"), ("Vivaan", "Gokhale"), ("Pranav", "Patil"),
    ("Abhishek", "Pandey"), ("Sarthak", "Hegde"), ("Dev", "Malhotra"), ("Hridaan", "Joshi"),
    ("Anay", "Gupta"), ("Atharv", "Dubey"), ("Darsh", "Choudhary"), ("Dhruv", "Verma"),
    ("Eshan", "Tiwari"), ("Gatik", "Pathak"), ("Jayan", "Bhatt"), ("Kanav", "Mittal"),
    ("Kiaan", "Aggarwal"), ("Madhav", "Tripathi"), ("Naksh", "Sawant"), ("Parth", "Deshmukh"),
    ("Ranveer", "Chavan"), ("Ritvik", "Shinde"), ("Rudra", "Gaikwad"), ("Sahil", "Pawar"),
    ("Samrat", "Mahadik"), ("Shaurya", "Thorat"), ("Shlok", "Jadhav"), ("Shreyas", "Mohite"),
    ("Tejas", "Shitole"), ("Utkarsh", "Ghatge"), ("Vedant", "Bhonsle"), ("Viraj", "Ghorpade"),
    ("Yash", "Katkar"), ("Zayan", "Kalbhor"), ("Amartya", "Tapkir"), ("Chaitanya", "Gole"),
    ("Divit", "Kunjir"), ("Fateh", "Lonkar"), ("Idhant", "Darekar"), ("Jeevansh", "Dhamale"),
    ("Kairav", "Hagawane"), ("Krishiv", "Kanade"), ("Manan", "Kudale"), ("Neevan", "Walhekar"),
    ("Nirvaan", "Zurange"), ("Onish", "Tupe"), ("Rahyl", "Kalate"), ("Ridhaan", "Barne"),
    ("Rishit", "Nakhate"), ("Rivaan", "Phuge"), ("Saativik", "Lande"), ("Shivansh", "Gawade"),
    ("Sparsh", "Chinchwade"), ("Taksh", "Jagtap"), ("Tanush", "Bhondve"), ("Tavish", "Kaspate"),
    ("Yuvaan", "Kalate"), ("Aavya", "Nair"), ("Bhavya", "Pillai"), ("Chhavi", "Kurian"),
    ("Drishya", "Joseph"), ("Eshani", "Fernandes"), ("Gunjan", "D'Souza"), ("Hiral", "Tilak"),
    ("Idhika", "Paranjpe"), ("Inaya", "Chavan"), ("Jivika", "Shinde"), ("Kashvi", "Gaikwad"),
    ("Lavanya", "Pawar"), ("Myra", "Mahadik"), ("Navika", "Thorat"), ("Nayantara", "Jadhav"),
    ("Neysa", "Mohite"), ("Nyra", "Shitole"), ("Pahal", "Ghatge"), ("Riddhima", "Bhonsle"),
    ("Saisha", "Ghorpade"), ("Shanaya", "Katkar"), ("Sharvi", "Kalbhor"), ("Shravya", "Tapkir"),
    ("Shreenika", "Gole"), ("Vritika", "Kunjir"), ("Yashvi", "Lonkar"), ("Aadhya", "Bose"),
    ("Aadya", "Chatterjee"), ("Aarna", "Mukherjee"), ("Aarohi", "Banerjee"), ("Advika", "Dutta"),
    ("Ahana", "Sarkar"), ("Akshara", "Ghosh"), ("Amaira", "Das"), ("Amoli", "Majumdar"),
    ("Ananya", "Roy"), ("Anaya", "Sen"), ("Anika", "Guha"), ("Anvi", "Chakraborty"),
    ("Anya", "Adhikari"), ("Avni", "Pal"), ("Diya", "Datta"), ("Gauri", "Ray"),
    ("Ira", "Mitra"), ("Ishani", "Basu"), ("Ishita", "Saha"), ("Jiya", "Bhowmick"),
    ("Kavya", "Nandi"), ("Keya", "Kundu"), ("Kiara", "Kashyap"), ("Kyra", "Goel"),
    ("Pari", "Khanna"), ("Pihu", "Mishra"), ("Prisha", "Pandey"), ("Rahi", "Srivastava"),
    ("Rashi", "Yadav"), ("Reet", "Tiwari"), ("Rhea", "Dubey"), ("Ritvi", "Pathak"),
    ("Riya", "Bhatt"), ("Saanvi", "Joshi"), ("Samaira", "Deshpande"), ("Sana", "Kulkarni"),
    ("Sara", "Deshmukh"), ("Sharvi", "Patil"), ("Siya", "Sawant"), ("Suhani", "Mehta"),
    ("Tanvi", "Aggarwal"), ("Trisha", "Bansal"), ("Urvi", "Mittal"), ("Vanya", "Verma"),
    ("Zoya", "Gupta"), ("Aaryan", "Sharma"), ("Agastya", "Vats"), ("Akshaj", "Tyagi"),
    ("Aniruddh", "Kaushik"), ("Arush", "Vashist"), ("Avyan", "Gautam"), ("Ayansh", "Bhardwaj"),
    ("Daksh", "Misra"), ("Devansh", "Shukla"), ("Fatehgopal", "Agnihotri"), ("Hridhaan", "Dwiwedi"),
    ("Ivyan", "Upadhyay"), ("Ibhan", "Bajpai"), ("Jace", "Malaviya")
]

def generate_username(first, last):
    suffix = random.randint(100, 999)
    return f"{first.lower()}_{last.lower()}_{suffix}"

def update_dummy_users_with_unique_names():
    print("Fetching dummy profiles...")
    res = sb.table("profiles")\
        .select("id, supabase_uid, email")\
        .ilike("email", "%@dummy.eulerfold.com")\
        .order("created_at", desc=False)\
        .execute()
    
    profiles = res.data
    
    if not profiles:
        print("No dummy profiles found.")
        return

    print(f"Found {len(profiles)} profiles. Applying unique Indian names to Auth and Profiles...")
    
    count = min(len(profiles), len(UNIQUE_NAMES))
    
    updates_count = 0
    for i in range(count):
        p = profiles[i]
        uid = p["supabase_uid"]
        first, last = UNIQUE_NAMES[i]
        
        display_name = f"{first} {last}"
        username = generate_username(first, last)
        new_email = f"{username}@dummy.eulerfold.com"
        
        try:
            # 1. Update Auth User (This reflects in Supabase Dashboard)
            sb.auth.admin.update_user_by_id(
                uid,
                {
                    "email": new_email,
                    "user_metadata": {"full_name": display_name},
                    "email_confirm": True
                }
            )

            # 2. Update Profile Table
            sb.table("profiles").update({
                "display_name": display_name,
                "username": username,
                "email": new_email
            }).eq("id", p["id"]).execute()
            
            updates_count += 1
            if updates_count % 10 == 0:
                print(f"Updated {updates_count} users in Auth and DB...")
        except Exception as e:
            print(f"Error updating user {uid}: {e}")

    print(f"Successfully updated {updates_count} users.")

if __name__ == "__main__":
    update_dummy_users_with_unique_names()

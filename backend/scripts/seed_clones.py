import os
import random
import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clone_roadmaps():
    print("Fetching dummy users...")
    users_res = sb.table("profiles").select("id, email").ilike("email", "%@dummy.eulerfold.com").limit(20).execute()
    users = users_res.data
    if not users:
        print("No dummy users found.")
        return
    
    print(f"Found {len(users)} dummy users.")

    print("Fetching public roadmaps...")
    # Fetch roadmaps that are public and not already clones (to clone originals mostly)
    rm_res = sb.table("roadmaps").select("*").eq("is_public", True).is_("cloned_from", "null").limit(20).execute()
    public_roadmaps = rm_res.data
    if not public_roadmaps:
        print("No public original roadmaps found to clone.")
        return
    
    print(f"Found {len(public_roadmaps)} public original roadmaps.")

    clones_created = 0
    
    # We want to create some clones
    # Pick a few roadmaps to be 'popular'
    popular_roadmaps = random.sample(public_roadmaps, min(5, len(public_roadmaps)))
    
    for original in popular_roadmaps:
        # Number of times this roadmap will be cloned
        num_clones = random.randint(2, 5)
        # Pick random dummy users to clone it
        cloners = random.sample(users, min(num_clones, len(users)))
        
        for cloner in cloners:
            # Check if already cloned by this user to avoid duplicates
            check = sb.table("roadmaps").select("id").eq("email", cloner["email"]).eq("cloned_from", original["id"]).execute()
            if check.data:
                continue
                
            # Prepare clone data
            clone_data = {
                "title": original["title"],
                "description": original["description"],
                "roadmap_plan": original["roadmap_plan"],
                "subject": original["subject"],
                "goal": original["goal"],
                "time_value": original["time_value"],
                "time_unit": original["time_unit"],
                "model": original["model"],
                "email": cloner["email"],
                "is_public": False, # Clones are usually private by default
                "cloned_from": original["id"],
                "slug": f"{original['slug']}-{uuid.uuid4().hex[:6]}",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Insert clone
            res = sb.table("roadmaps").insert(clone_data).execute()
            if res.data:
                clones_created += 1
                # Increment clone_count on original
                current_count = original.get("clone_count") or 0
                sb.table("roadmaps").update({"clone_count": current_count + 1}).eq("id", original["id"]).execute()
                # Update local original object for subsequent clones in this loop
                original["clone_count"] = current_count + 1

    print(f"Successfully created {clones_created} clones across {len(popular_roadmaps)} original roadmaps.")

if __name__ == "__main__":
    clone_roadmaps()

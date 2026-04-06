import os
import json
from supabase import create_client
from dotenv import load_dotenv

# Load credentials
load_dotenv("backend/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    load_dotenv("frontend/.env")
    url = url or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    if not url or not key:
        print("Error: Supabase credentials not found.")
        exit(1)

supabase = create_client(url, key)

REPLACEMENTS = {
    # Roadmap 108: Computational Neuroscience
    "https://ocw.mit.edu/courses/9-660-computational-cognitive-science-fall-2004/resources/lec10/": "https://ocw.mit.edu/courses/9-660-computational-cognitive-science-fall-2004/pages/lecture-notes/",
    
    # Roadmap 109: Bioinformatics
    "https://ocw.mit.edu/courses/7-01sc-introduction-to-biology-fall-2011/": "https://ocw.mit.edu/courses/7-01sc-fundamentals-of-biology-fall-2011/",
    "https://ocw.mit.edu/courses/7-81j-biological-and-macromolecular-chemistry-fall-2005/": "https://ocw.mit.edu/courses/7-08j-fundamentals-of-chemical-biology-fall-2007/",
    "https://www.rcsb.org/learn": "https://pdb101.rcsb.org/",
    "https://www.edx.org/course/introduction-to-r-for-life-sciences": "https://www.edx.org/certificates/professional-certificate/harvardx-data-analysis-for-life-sciences"
}

def fix_plan(plan):
    plan_str = json.dumps(plan)
    modified = False
    for old, new in REPLACEMENTS.items():
        if old in plan_str:
            print(f"  Replacing: {old} -> {new}")
            plan_str = plan_str.replace(old, new)
            modified = True
    return json.loads(plan_str) if modified else None

def run():
    for rid in [107, 108, 109]:
        res = supabase.table("roadmaps").select("id, title, roadmap_plan").eq("id", rid).execute()
        if not res.data:
            print(f"Roadmap {rid} not found.")
            continue
        
        roadmap = res.data[0]
        print(f"Analyzing roadmap {rid}: {roadmap['title']}")
        
        old_plan = roadmap['roadmap_plan']
        new_plan = fix_plan(old_plan)
        
        if new_plan is None:
            print(f"  No changes needed for roadmap {rid}.")
            continue
            
        update_res = supabase.table("roadmaps").update({"roadmap_plan": new_plan}).eq("id", rid).execute()
        if update_res.data:
            print(f"  Successfully updated roadmap {rid}.")
        else:
            print(f"  Failed to update roadmap {rid}. Response: {update_res}")

if __name__ == "__main__":
    run()

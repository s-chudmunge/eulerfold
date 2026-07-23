import os
import sys
import json
import csv
import uuid
import re
import random
import subprocess

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv('.env')

from app.core.supabase_client import get_supabase_client
from app.routers.roadmaps import _generate_plan_hash

def uid():
    return str(uuid.uuid4())

sb = get_supabase_client()

def generate_local_slug(title, email):
    base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    return f"{base_slug}-{uid()[:8]}"

def generate_generic_modules(title):
    num_modules = random.randint(3, 6)
    modules = []
    
    # 1. Basics
    modules.append({
        "title": f"Introduction to {title}",
        "outcome": f"Master the core concepts of {title}.",
        "timeline": "Module 1",
        "workspace_type": "research",
        "topics": [
            {"title": "Core Principles", "subtopics": [{"title": "History and Context"}, {"title": "Key Terminology"}, {"title": "High-level Architecture"}]},
            {"title": "Setting up the Environment", "subtopics": [{"title": "Installation"}, {"title": "Basic Configuration"}, {"title": "Hello World"}]},
            {"title": "Proof of Work: Basic Implementation", "subtopics": [{"title": "Write a basic script/setup"}, {"title": "Verify it works"}, {"title": "Explain what it does"}]}
        ]
    })
    
    # 2. Fundamentals
    modules.append({
        "title": "Fundamental Constructs",
        "outcome": "Gain hands-on experience with the basic building blocks.",
        "timeline": "Module 2",
        "workspace_type": "research",
        "topics": [
            {"title": "Primary Data Structures / Syntax", "subtopics": [{"title": "Basic usage"}, {"title": "Common patterns"}, {"title": "Best practices"}]},
            {"title": "Control Flow and Logic", "subtopics": [{"title": "Handling state/flow"}, {"title": "Error handling basics"}, {"title": "Debugging techniques"}]},
            {"title": "Proof of Work: Interactive Example", "subtopics": [{"title": "Build a small interactive component"}, {"title": "Handle edge cases"}, {"title": "Document the code"}]}
        ]
    })
    
    # Optional middle modules
    for i in range(num_modules - 3):
        modules.append({
            "title": f"Deep Dive: Concept {i+1}",
            "outcome": f"Explore the internal mechanics of advanced topics.",
            "timeline": f"Module {len(modules) + 1}",
            "workspace_type": "research",
            "topics": [
                {"title": "Advanced Concept A", "subtopics": [{"title": "Theory"}, {"title": "Application"}, {"title": "Optimization"}]},
                {"title": "Advanced Concept B", "subtopics": [{"title": "Integration"}, {"title": "Common Pitfalls"}, {"title": "Debugging"}]},
                {"title": f"Proof of Work: Milestone {i+1}", "subtopics": [{"title": "Build the feature"}, {"title": "Write tests"}, {"title": "Deploy locally"}]}
            ]
        })
        
    # Final Capstone
    modules.append({
        "title": "Real-World Application",
        "outcome": "Build real-world projects using the skills learned.",
        "timeline": f"Module {len(modules) + 1}",
        "workspace_type": "research",
        "topics": [
            {"title": "System Design", "subtopics": [{"title": "Structuring larger projects"}, {"title": "Design patterns"}, {"title": "Security best practices"}]},
            {"title": "Capstone Preparation", "subtopics": [{"title": "Planning the architecture"}, {"title": "Writing tests"}, {"title": "Final review"}]},
            {"title": "Proof of Work: Capstone Project", "subtopics": [{"title": "Build a complete mini-project"}, {"title": "Write a README"}, {"title": "Submit the repository link"}]}
        ]
    })
    
    return modules

def format_module(m, idx):
    formatted_topics = []
    for t_idx, t in enumerate(m["topics"]):
        formatted_subtopics = []
        for st in t["subtopics"]:
            formatted_subtopics.append({
                "id": uid(),
                "title": st["title"],
                "video_id": "",
                "video_title": "",
                "video_channel": "",
                "resources": []
            })
            
        formatted_topics.append({
            "id": f"topic_{idx+1}_{t_idx+1}",
            "uuid": uid(),
            "title": t["title"],
            "youtube_search_query": f"{t['title']} tutorial",
            "subtopics": formatted_subtopics
        })
        
    return {
        "id": uid(),
        "title": m["title"],
        "outcome": m["outcome"],
        "timeline": m["timeline"],
        "workspace_type": m.get("workspace_type", "research"),
        "optimal_search_query": m["title"],
        "proof_of_work_instructions": {
            "what_to_build": "A practical implementation.",
            "what_counts_as_evidence": "A working script or repo.",
            "eval_criteria": [
                "Does the code compile and run?",
                "Does it correctly implement the core concept?"
            ]
        },
        "resources": [],
        "topics": formatted_topics
    }

def main():
    csv_path = "/home/sankalp/Documents/projects/eulerfold/niche_courses.csv"
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)
        
    inserted_ids = []
    
    # Skip header
    for i in range(1, len(rows)):
        row = rows[i]
        if not row: continue
        
        name = row[0]
        if name.startswith("[DONE]"):
            continue
            
        desc = row[1]
        subject = row[2]
        
        print(f"Generating scaffolding for: {name}")
        slug = generate_local_slug(name, "eulerfold@gmail.com")
        
        raw_modules = generate_generic_modules(name)
        modules = [format_module(m, idx) for idx, m in enumerate(raw_modules)]
        
        roadmap_plan = {
            "modules": modules
        }
        
        res = sb.table("roadmaps").insert({
            "email": "eulerfold@gmail.com",
            "title": name,
            "description": desc,
            "slug": slug,
            "snapshot_hash": _generate_plan_hash(roadmap_plan),
            "is_public": True,
            "show_author": True,
            "roadmap_plan": roadmap_plan,
            "subject": subject,
            "status": "active",
            "version": 1
        }).execute()
        
        c_id = res.data[0]["id"]
        inserted_ids.append(c_id)
        
        # Mark as DONE in CSV
        rows[i][0] = f"[DONE] {name}"
        print(f"Inserted course {c_id} with {len(modules)} modules.")
        
    # Save CSV
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
        
    print(f"\nSeeded {len(inserted_ids)} foundational courses.")
    print("Launching enrichment pipeline...")
    
    for c_id in inserted_ids:
        print(f"Enriching videos for {c_id}...")
        subprocess.run(["python", "smart_video_enrich.py", str(c_id)])
        print(f"Enriching resources for {c_id}...")
        subprocess.run(["python", "smart_resource_enrich.py", str(c_id)])
        
    print("Updating cards...")
    subprocess.run(["python", "generate_course_cards_local.py"])
    print("All foundational courses fully seeded and enriched!")

if __name__ == "__main__":
    main()

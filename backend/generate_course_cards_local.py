import json
import csv
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from app.core.supabase_client import get_supabase_client

def get_audience_map():
    audience_map = {}
    csv_path = '/home/sankalp/Documents/projects/eulerfold/niche_courses.csv'
    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader, None)  # skip header
            for row in reader:
                if len(row) >= 3:
                    name = row[0].replace('[DONE]', '').strip()
                    audience_map[name.lower()] = row[2].strip()
    return audience_map

def infer_prerequisites(title, subject, desc):
    title_lower = title.lower()
    desc_lower = desc.lower()
    
    # Determine Level
    level = "intermediate"
    if any(w in title_lower for w in ["advanced", "deep dive", "internals", "expert", "at scale", "from scratch"]):
        level = "advanced"
    elif any(w in title_lower for w in ["getting started", "introduction", "basics", "fundamentals", "101", "beginner"]):
        level = "beginner"
        
    if "advanced" in desc_lower or "complex" in desc_lower:
        level = "advanced"
        
    # Determine Items with much more technical, concise language
    items = []
    
    # Language/Framework checks
    if any(x in title_lower for x in ["react", "next.js", "frontend", "css"]):
        items.append("JavaScript & DOM fundamentals")
        items.append("Familiarity with React components")
    elif any(x in title_lower for x in ["rust"]):
        items.append("Basic Rust syntax (ownership)")
        items.append("C/C++ memory concepts (pointers)")
    elif any(x in title_lower for x in ["go", "golang"]):
        items.append("Basic Go syntax & goroutines")
    elif any(x in title_lower for x in ["python", "fastapi", "django", "dsl"]):
        items.append("Python 3 & basic OOP")
    elif any(x in title_lower for x in ["c++", "c "]):
        items.append("C/C++ syntax & pointers")
        
    # Domain checks
    if any(x in title_lower for x in ["kubernetes", "docker", "container", "mesh"]):
        items.append("Linux CLI fundamentals")
        items.append("Basic Docker containerization")
    elif any(x in title_lower for x in ["machine learning", "llm", "ai", "rag", "vision", "diffusion"]):
        items.append("Python scripting")
        items.append("Basic linear algebra & tensors")
    elif any(x in title_lower for x in ["database", "sql", "postgres", "indexing", "iceberg"]):
        items.append("Relational database concepts")
        items.append("Basic SQL queries")
    elif any(x in title_lower for x in ["network", "tcp", "protocol", "webrtc", "socket", "grpc"]):
        items.append("TCP/UDP fundamentals")
        items.append("Socket programming basics")
    elif any(x in title_lower for x in ["security", "hack", "exploit", "reverse", "binary", "fuzz"]):
        items.append("Assembly (x86/ARM) basics")
        items.append("C programming & memory layout")
    elif any(x in title_lower for x in ["system", "os ", "kernel", "ebpf", "v8"]):
        items.append("Operating System fundamentals")
        items.append("C/Rust systems programming")
    elif any(x in title_lower for x in ["compiler", "interpreter", "language", "parser"]):
        items.append("Data structures (Trees, Graphs)")
        
    if level == "advanced" and len(items) < 2:
        items.append("Production engineering experience")
        
    if not items:
        if level == "advanced":
            items.append("Advanced programming experience")
        elif level == "intermediate":
            items.append("Familiarity with core concepts")
        else:
            items.append("No prior experience required")
            
    items = list(dict.fromkeys(items))[:3]
    
    # Description Text
    if level == "advanced":
        desc_text = "This is a rigorous course requiring prior technical background."
    elif level == "intermediate":
        desc_text = "Requires basic familiarity with the tech stack."
    else:
        desc_text = "Accessible to beginners with basic computer literacy."
    
    return {
        "level": level,
        "description": desc_text,
        "items": items
    }

def infer_who_is_this_for(title, subject, audience_map):
    title_lower = title.lower()
    
    # Try exact or partial match from CSV
    csv_audience = ""
    for csv_name, aud in audience_map.items():
        if csv_name in title_lower or title_lower in csv_name:
            csv_audience = aud
            break
            
    desc = csv_audience
    if not desc:
        if "engineer" in subject.lower() or "development" in subject.lower():
            desc = f"Software engineers and developers looking to master {title}."
        else:
            desc = f"Anyone interested in {subject} who wants to learn about {title}."
            
    # Generate Tags
    tags = []
    if "backend" in title_lower or "api" in title_lower or "database" in title_lower:
        tags.append("Backend Engineers")
    if "frontend" in title_lower or "react" in title_lower or "css" in title_lower:
        tags.append("Frontend Developers")
    if "ai" in title_lower or "llm" in title_lower or "machine learning" in title_lower:
        tags.append("AI/ML Engineers")
    if "data" in title_lower or "sql" in title_lower:
        tags.append("Data Engineers")
    if "security" in title_lower or "hack" in title_lower:
        tags.append("Security Researchers")
    if "system" in title_lower or "os " in title_lower or "kernel" in title_lower or "distributed" in title_lower:
        tags.append("Systems Engineers")
        
    if not tags:
        tags.append(f"{subject} Professionals")
        tags.append("Tech Enthusiasts")
        
    return {
        "description": desc,
        "tags": tags[:3]
    }

def main():
    sb = get_supabase_client()
    audience_map = get_audience_map()
    
    res = sb.table('roadmaps').select('id, title, description, subject, roadmap_plan').eq(
        'email', 'eulerfold@gmail.com'
    ).eq('is_public', True).gte('id', 1371).order('id', desc=False).execute()
    
    courses = res.data
    print(f"Total courses to process: {len(courses)}")
    
    processed = 0
    for course in courses:
        plan = course.get("roadmap_plan", {})
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        modules = plan.get("modules", [])
        
        # 1. What you will learn
        outcomes = []
        for m in modules:
            outcome = m.get("outcome", "").strip()
            if outcome:
                # Ensure it starts with a capital letter
                outcome = outcome[0].upper() + outcome[1:]
                outcomes.append(outcome)
        
        if not outcomes:
            outcomes = [f"Master the core concepts of {course['title']}"]
            
        # Limit to 4 bullets max for aesthetics
        what_you_will_learn = outcomes[:4]
        
        # 2. About
        desc = course.get("description", "").strip()
        if desc.endswith("."):
            desc = desc[:-1]
            
        about_paragraphs = []
        about_paragraphs.append(f"{desc}. This {course['subject']} curriculum is designed to give you hands-on experience and deep conceptual understanding.")
        about_paragraphs.append(f"Across {len(modules)} intensive modules, you'll tackle real-world challenges and build practical projects that reinforce your learning. By the end of this journey, you'll have the skills and proof of work to demonstrate your expertise.")
        
        about = "\n\n".join(about_paragraphs)
        
        # 3. Who is this for
        who_is_this_for = infer_who_is_this_for(course['title'], course.get('subject', ''), audience_map)
        
        # 4. Prerequisites
        prereqs = infer_prerequisites(course['title'], course.get('subject', ''), course.get('description', ''))
        
        plan["what_you_will_learn"] = what_you_will_learn
        plan["about"] = about
        plan["who_is_this_for"] = who_is_this_for
        plan["prerequisites"] = prereqs
        
        sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", course["id"]).execute()
        processed += 1
        print(f"Processed [{processed}/{len(courses)}] {course['id']} - {course['title']}")
        
    print(f"\nSuccessfully generated local cards for {processed} courses!")

if __name__ == "__main__":
    main()

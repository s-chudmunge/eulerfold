import asyncio
import os
import sys
import re

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

def clean_title(title):
    t = title
    
    # "Finance for Investing and Trading: A 2-Week Roadmap" -> "Finance for Investing and Trading"
    # "AWS for Developers: A Hands-on 4-Week Roadmap" -> "AWS for Developers"
    # "JEE Chemistry Full Syllabus Mastery: 6-Week Intensive Roadmap" -> "JEE Chemistry Full Syllabus Mastery"
    t = re.sub(r':\s*(A\s*)?(Hands-on\s*)?\d+-(Week|Month|Day)(\s*Intensive|\s*Technical)?\s*Roadmap', '', t, flags=re.IGNORECASE)
    
    # "Intensive 4-Week JEE Maths Syllabus Coverage" -> "JEE Maths Syllabus Coverage"
    t = re.sub(r'(?i)Intensive\s*\d+-(Week|Month|Day)\s*', '', t)
    
    # "MHTCET High-Rank Preparation Roadmap (2 Weeks)" -> "MHTCET High-Rank Preparation"
    t = re.sub(r'(?i)\s*Roadmap\s*\(\d+\s*(Weeks|Months|Days)\)', '', t)
    
    # "Python Data Visualization: 3-Week Technical Roadmap"
    t = re.sub(r':\s*\d+-(Week|Month|Day)\s*Technical\s*Roadmap', '', t, flags=re.IGNORECASE)
    
    # "Probability and Statistics: A Rigorous Roadmap"
    t = re.sub(r':\s*A\s*Rigorous\s*Roadmap', '', t, flags=re.IGNORECASE)
    
    # "Technical Roadmap: Understanding Backpropagation"
    t = re.sub(r'(?i)Technical\s*Roadmap:\s*', '', t)
    
    # "PhD-Track Learning Roadmap: Fluid Mechanics & Numerical Simulation"
    t = re.sub(r'(?i)Learning\s*Roadmap:', 'Learning:', t)
    
    # "Open Source Contribution Roadmap: From Zero to Recognized Contributor"
    t = re.sub(r'(?i)\s*Roadmap:', ':', t)
    
    # "Bioinformatics Learning Roadmap: From Sequences to Structures"
    # Covered by "Learning Roadmap:" above
    
    # "DevOps & CI/CD Learning Roadmap"
    t = re.sub(r'(?i)\s*Learning\s*Roadmap', '', t)
    
    # "Product-Led Growth Designer Roadmap"
    t = re.sub(r'(?i)\s*Roadmap$', '', t)
    
    # "JEE Physics: Comprehensive Syllabus Coverage and Preparation Roadmap"
    t = re.sub(r'(?i)\s*and\s*Preparation\s*Roadmap$', '', t)
    
    # "Python Data Science: Expert Level Roadmap"
    t = re.sub(r'(?i)\s*Roadmap$', '', t)

    return t.strip()

async def fix_titles():
    supabase = get_supabase_client()
    res = supabase.table("roadmaps").select("id, title, subject").eq("is_public", True).execute()
    
    if not res.data:
        print("No public roadmaps found.")
        return

    old_format_count = 0
    for r in res.data:
        title = r.get("title") or ""
        
        # Check if it looks like an old title
        if re.search(r'(?i)\b\d+-(week|month|day)\b', title) or "Roadmap" in title:
            new_title = clean_title(title)
            
            print(f"ID: {r['id']}")
            print(f"Old: {title}")
            print(f"New: {new_title}")
            print("-" * 30)
            
            # Update the DB
            supabase.table("roadmaps").update({"title": new_title}).eq("id", r['id']).execute()
            old_format_count += 1
            
    print(f"Total updated: {old_format_count}")

if __name__ == "__main__":
    asyncio.run(fix_titles())

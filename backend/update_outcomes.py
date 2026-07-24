import os
import json
import sys

# Ensure app is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from google import genai
from app.core.supabase_client import get_admin_supabase_client, get_supabase_client
from app.core.config import settings
import time

def generate_outcome(client: genai.Client, title: str, topics: list[str]) -> str:
    prompt = f"""
    You are a technical copywriter. Write a single, compelling, and specific 1-sentence description (outcome) for a course module.
    
    Module Title: {title}
    Topics: {', '.join(topics)}
    
    Rules:
    1. DO NOT start the sentence with "Master". Vary your verbs (e.g., "Build a solid mental model of...", "Explore the internals of...", "Implement practical solutions for...").
    2. Make it specific to the topics, not generic.
    3. COMPLETELY BAN the words "high" and "highly" (e.g. "high-quality", "highly-tailored").
    4. Use plain, simple English. NEVER use "fluffy" or marketing-focused language. Avoid buzzwords like "high-performance," "high-signal," "intelligence suite," "magic," or "superpowers." 
    5. Be direct and honest.
    
    Output ONLY the 1-sentence outcome. No quotes, no extra text.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Error generating outcome: {e}")
        return f"Gain practical experience with {title.lower()}."

def main():
    print("Initializing clients...")
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # Try admin client first, fallback to regular
    try:
        supabase = get_admin_supabase_client()
    except Exception:
        supabase = get_supabase_client()

    print("Fetching roadmaps...")
    response = supabase.table("roadmaps").select("id, roadmap_plan").gte("id", 1456).lte("id", 1490).execute()
    
    roadmaps = response.data
    print(f"Found {len(roadmaps)} roadmaps to process.")
    
    for r in roadmaps:
        rid = r["id"]
        plan = r["roadmap_plan"]
        
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        modules = plan.get("modules", [])
        if not modules:
            print(f"No modules for roadmap {rid}")
            continue
            
        updated = False
        for module in modules:
            title = module.get("title", "")
            
            # Extract topic names depending on structure
            topics_data = module.get("topics", [])
            topics = []
            for t in topics_data:
                if isinstance(t, dict):
                    topics.append(t.get("title", t.get("name", "")))
                elif isinstance(t, str):
                    topics.append(t)
                    
            old_outcome = module.get("outcome", "")
            
            new_outcome = generate_outcome(client, title, topics)
            module["outcome"] = new_outcome
            print(f"[{rid}] {title}")
            print(f"  Old: {old_outcome}")
            print(f"  New: {new_outcome}")
            updated = True
            time.sleep(1) # Simple rate limiting
            
        if updated:
            supabase.table("roadmaps").update({"roadmap_plan": plan}).eq("id", rid).execute()
            print(f"✅ Updated roadmap {rid} in db.\n")

if __name__ == "__main__":
    main()

"""
Generate and attach 'course_info' metadata for all 85 niche courses.
Fields added to roadmap_plan:
  - what_you_will_learn: list of 3-4 bullet points
  - about: 2-3 paragraph course description
  - who_is_this_for: { description: str, tags: [str] }
  - prerequisites: { level: "beginner"|"intermediate"|"advanced", description: str, items: [str] }
"""
import json
import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from google import genai
from google.genai import types
from app.core.supabase_client import get_supabase_client
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are a technical curriculum architect. Given a course title, description, subject, module titles, module outcomes, and topic titles, generate structured metadata.

Return a JSON object with exactly these keys:

{
  "what_you_will_learn": [
    "Bullet 1 — a specific, measurable learning outcome",
    "Bullet 2 — another outcome",
    "Bullet 3 — another outcome",
    "Bullet 4 — another outcome (optional)"
  ],
  "about": "A 2-3 paragraph description of what this course covers, who it's for, and what makes it unique. Write in plain, direct English. No buzzwords or marketing fluff. Speak to the learner directly.",
  "who_is_this_for": {
    "description": "1-2 sentences describing the ideal learner for this course.",
    "tags": ["Tag 1", "Tag 2", "Tag 3"]
  },
  "prerequisites": {
    "level": "beginner" or "intermediate" or "advanced",
    "description": "1-2 sentences about what foundational knowledge is needed.",
    "items": ["Prerequisite 1", "Prerequisite 2"]
  }
}

Rules:
- "what_you_will_learn" must be 3-4 concrete, specific bullets. Not generic. Reference actual technologies and techniques from the course.
- "about" should be plain English. No "high-quality", "highly", "powerful", or marketing language. Be honest and direct.
- "who_is_this_for" tags should be role-based (e.g. "Backend Engineers", "ML Engineers", "CS Students")
- "prerequisites.level" must be exactly one of: "beginner", "intermediate", "advanced"
- "prerequisites.items" should list 1-3 concrete skills needed (e.g. "Comfortable writing Python", "Basic understanding of HTTP")
- For beginner courses, items can be empty or very basic like ["Basic programming knowledge"]
- Return ONLY the JSON object, no markdown fences or explanation."""


def build_prompt(course):
    plan = course["roadmap_plan"]
    if isinstance(plan, str):
        plan = json.loads(plan)
    
    modules_info = []
    for m in plan.get("modules", []):
        topics = [t.get("title", "") for t in m.get("topics", [])]
        modules_info.append(f"  Module: {m.get('title', '')}\n    Outcome: {m.get('outcome', '')}\n    Topics: {', '.join(topics)}")
    
    return f"""Course: {course['title']}
Description: {course.get('description', '') or plan.get('description', '')}
Subject: {course.get('subject', '')}

Modules:
{chr(10).join(modules_info)}"""


def parse_json_response(text):
    # Strip markdown fences if present
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
    if text.startswith("json"):
        text = text[4:].strip()
    return json.loads(text)


def main():
    sb = get_supabase_client()
    
    res = sb.table('roadmaps').select('id, title, description, subject, roadmap_plan').eq(
        'email', 'eulerfold@gmail.com'
    ).eq('is_public', True).gte('id', 1371).order('id', desc=False).execute()
    
    courses = res.data
    print(f"Total courses to process: {len(courses)}")
    
    # Skip courses that already have the metadata
    to_process = []
    for c in courses:
        plan = c.get("roadmap_plan", {})
        if isinstance(plan, str):
            plan = json.loads(plan)
        if not plan.get("what_you_will_learn"):
            to_process.append(c)
    
    print(f"Courses needing metadata: {len(to_process)}")
    
    for i, course in enumerate(to_process):
        plan = course.get("roadmap_plan", {})
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        prompt = build_prompt(course)
        
        try:
            # Try with retries and model fallback
            metadata = None
            models = ["gemini-2.0-flash", "gemini-2.0-flash-lite"]
            
            for model_name in models:
                for attempt in range(5):
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                system_instruction=SYSTEM_PROMPT,
                                temperature=0.3,
                                max_output_tokens=1500,
                            )
                        )
                        metadata = parse_json_response(response.text)
                        break  # Success
                    except Exception as api_err:
                        err_str = str(api_err)
                        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                            wait = min(30 * (2 ** attempt), 120)
                            print(f"    Rate limited ({model_name}), waiting {wait}s (attempt {attempt+1}/5)...")
                            time.sleep(wait)
                        else:
                            raise api_err
                
                if metadata:
                    break
                else:
                    print(f"    Exhausted retries on {model_name}, trying next model...")
            
            if not metadata:
                print(f"  SKIPPED {course['id']} ({course['title']}): All models exhausted")
                continue
            
            # Validate structure
            assert "what_you_will_learn" in metadata
            assert "about" in metadata
            assert "who_is_this_for" in metadata
            assert "prerequisites" in metadata
            assert metadata["prerequisites"]["level"] in ("beginner", "intermediate", "advanced")
            
            # Merge into plan
            plan["what_you_will_learn"] = metadata["what_you_will_learn"]
            plan["about"] = metadata["about"]
            plan["who_is_this_for"] = metadata["who_is_this_for"]
            plan["prerequisites"] = metadata["prerequisites"]
            
            sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", course["id"]).execute()
            
            level = metadata["prerequisites"]["level"]
            bullets = len(metadata["what_you_will_learn"])
            tags = ", ".join(metadata["who_is_this_for"]["tags"])
            print(f"  [{i+1}/{len(to_process)}] {course['id']} | {level} | {bullets} bullets | {tags} | {course['title']}")
            
            # Rate limiting — Gemini Flash is generous but let's be safe
            if (i + 1) % 10 == 0:
                time.sleep(2)
            
        except Exception as e:
            print(f"  ERROR on {course['id']} ({course['title']}): {e}")
            time.sleep(3)
            continue
    
    print(f"\nDone! Processed {len(to_process)} courses.")


if __name__ == "__main__":
    main()

import asyncio
import logging
import os
import json
import time
from google import genai
from pydantic import BaseModel
from app.core.supabase_client import supabase
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

class ProofOfWork(BaseModel):
    what_to_build: str
    what_counts_as_evidence: str
    eval_criteria: list[str]

client = genai.Client()

def generate_pow(course_title: str, module_title: str) -> dict:
    prompt = f"""
    You are designing a rigorous, practical homework assignment (Proof of Work) for a module titled '{module_title}' in the course '{course_title}'.
    The assignment must be highly thoughtful, challenging, and strictly practical (e.g. write a script, build a mini-project, solve a mathematical proof with code).
    Do NOT use fluffy language. Be highly technical.
    Provide:
    1. what_to_build: A direct description of what the user must build or accomplish.
    2. what_counts_as_evidence: What they must submit (e.g. GitHub link to a script that does X, or a code snippet).
    3. eval_criteria: 2-3 strict criteria for evaluating the submission.
    """
    retries = 3
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': ProofOfWork,
                    'temperature': 0.7,
                },
            )
            return json.loads(response.text)
        except Exception as e:
            logging.error(f"Error generating POW for {module_title}: {e}")
            if "429" in str(e) or "Quota" in str(e):
                logging.info(f"Rate limited. Sleeping for 35 seconds (Attempt {attempt+1}/{retries})")
                time.sleep(35)
            else:
                return None
    return None

async def update_courses():
    logging.info("Starting missing module updates...")
    
    course_ids = list(range(1456, 1491))
    res = supabase.table('roadmaps').select('id, title, roadmap_plan').in_('id', course_ids).execute()
    courses = res.data
    
    for course in courses:
        course_id = course['id']
        title = course['title']
        plan = course.get('roadmap_plan')
        
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        updated = False
        if plan and 'modules' in plan:
            for mod in plan['modules']:
                mod_title = mod.get('title', 'Unknown Module')
                pow_current = mod.get('proof_of_work_instructions')
                
                # Check if it already has the proper schema
                needs_update = True
                if isinstance(pow_current, dict):
                    if 'what_to_build' in pow_current and 'what_counts_as_evidence' in pow_current:
                        needs_update = False
                
                if needs_update:
                    logging.info(f"Course {course_id} - Generating POW for: {mod_title}")
                    time.sleep(2) # Prevent rapid fire requests
                    pow_data = generate_pow(title, mod_title)
                    if pow_data:
                        mod['proof_of_work_instructions'] = pow_data
                        updated = True
        
        if updated:
            try:
                update_res = supabase.table('roadmaps').update({'roadmap_plan': plan}).eq('id', course_id).execute()
                if update_res.data:
                    logging.info(f"Successfully updated course {course_id}")
                else:
                    logging.warning(f"Failed to update course {course_id} in DB")
            except Exception as e:
                logging.error(f"Supabase update error for {course_id}: {e}")

if __name__ == "__main__":
    asyncio.run(update_courses())

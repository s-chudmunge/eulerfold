import json
import random
from dotenv import load_dotenv
load_dotenv('.env')
from app.core.supabase_client import get_supabase_client

sb = get_supabase_client()

PREFIXES = [
    "Master the core concepts of",
    "Gain hands-on experience with",
    "Understand the architecture behind",
    "Implement production-grade",
    "Explore the internal mechanics of",
    "Build real-world projects using",
    "Optimize and debug",
    "Design and deploy"
]

def clean_concept(concept):
    c = concept.strip().lower()
    if c.endswith('.'):
        c = c[:-1]
    if c.endswith('deep dive'):
        c = c.replace('deep dive', '').strip()
    return c

def main():
    res = sb.table('roadmaps').select('id, title, roadmap_plan').eq('email', 'eulerfold@gmail.com').execute()
    
    updated_count = 0
    for c in res.data:
        plan = c.get('roadmap_plan', {})
        if isinstance(plan, str):
            plan = json.loads(plan)
            
        mods = plan.get('modules', [])
        changed = False
        
        for idx, m in enumerate(mods):
            outcome = m.get('outcome', '')
            if outcome.lower().startswith('deep dive into'):
                concept = clean_concept(outcome[len('deep dive into'):])
                # Ensure no empty concepts
                if not concept:
                    concept = clean_concept(m.get('title', ''))
                
                # Assign a deterministic but varied prefix based on module index
                prefix = PREFIXES[idx % len(PREFIXES)]
                new_outcome = f"{prefix} {concept}."
                
                m['outcome'] = new_outcome
                changed = True
                
        if changed:
            plan['modules'] = mods
            sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', c['id']).execute()
            updated_count += 1
            print(f"Fixed outcomes for Course {c['id']}")

    print(f"Total courses fixed: {updated_count}")

if __name__ == "__main__":
    main()

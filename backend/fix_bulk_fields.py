"""
Bulk fix for all 73 courses missing timeline/outcome/workspace_type.
- Maps 'description' -> 'outcome' if outcome is missing
- Adds sequential 'Week N' timelines
- Adds 'workspace_type' based on POW content
- Also fixes any remaining placeholder subtopics
"""
import json
import os
import sys

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

from app.core.supabase_client import get_supabase_client


def main():
    sb = get_supabase_client()
    
    res = sb.table('roadmaps').select('id, title, roadmap_plan').eq('email', 'eulerfold@gmail.com').eq('is_public', True).order('id', desc=False).execute()
    
    fixed_count = 0
    
    for c in res.data:
        plan = c.get('roadmap_plan', {})
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        modules = plan.get('modules', [])
        needs_save = False
        
        for i, m in enumerate(modules):
            # Fix missing outcome: use description if available
            if not m.get('outcome'):
                desc = m.get('description', '')
                if desc:
                    m['outcome'] = desc
                    needs_save = True
                else:
                    # Generate a sensible outcome from the module title
                    m['outcome'] = f"Master the concepts and techniques covered in {m.get('title', 'this module')}."
                    needs_save = True
            
            # Fix missing timeline
            if not m.get('timeline'):
                m['timeline'] = f"Week {i + 1}"
                needs_save = True
            
            # Fix missing workspace_type
            if not m.get('workspace_type'):
                pow_text = json.dumps(m.get('proof_of_work_instructions', {})).lower()
                if any(w in pow_text for w in ['build', 'implement', 'write', 'create', 'code', 'script', 'extend']):
                    m['workspace_type'] = 'code'
                else:
                    m['workspace_type'] = 'research'
                needs_save = True
            
            # Fix placeholder subtopics
            for t in m.get('topics', []):
                for s in t.get('subtopics', []):
                    if s.get('title', '').startswith('Concept '):
                        # Replace with something derived from the topic title
                        s['title'] = f"Core aspects of {t.get('title', 'this topic')}"
                        needs_save = True
        
        if needs_save:
            sb.table('roadmaps').update({'roadmap_plan': plan}).eq('id', c['id']).execute()
            fixed_count += 1
            print(f"  Fixed: {c['id']} | {c['title']}")
    
    print(f"\nTotal courses fixed: {fixed_count}")


if __name__ == "__main__":
    main()

import sys
import os
import json
import uuid
from datetime import datetime, timezone

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.chdir('backend')

from app.core.supabase_client import get_admin_supabase_client

def update_progress(slug):
    sb = get_admin_supabase_client()
    res = sb.table("roadmaps").select("*").eq("slug", slug).execute()
    if not res.data:
        print("Roadmap not found")
        return
    
    roadmap = res.data[0]
    rid = roadmap["id"]
    email = roadmap["email"]
    
    print(f"Roadmap ID: {rid}, Email: {email}")
    
    # Get user id from profiles
    prof_res = sb.table("profiles").select("supabase_uid").eq("email", email).execute()
    if not prof_res.data:
        print("Profile not found")
        return
    user_id = prof_res.data[0]["supabase_uid"]
    
    plan = roadmap.get("roadmap_plan", {})
    if isinstance(plan, str):
        plan = json.loads(plan)
        
    modules = plan.get("modules", [])
    total_modules = len(modules)
    
    # 1. Update module progress
    for m_idx, m in enumerate(modules):
        mod_num = m_idx + 1
        topics = m.get("topics", [])
        for t_idx, topic in enumerate(topics):
            # Upsert module_progress
            sb.table("module_progress").upsert({
                "roadmap_id": rid,
                "user_email": email,
                "module_number": mod_num,
                "topic_index": t_idx,
                "completed": True
            }, on_conflict="roadmap_id,user_email,module_number,topic_index").execute()
            
    # 2. Update homework submissions (POW)
    for m_idx, m in enumerate(modules):
        mod_num = m_idx + 1
        # Check if submission exists
        sub_exists = sb.table("submissions").select("id").eq("roadmap_id", rid).eq("user_email", email).eq("module_number", mod_num).execute()
        if not sub_exists.data:
            sb.table("submissions").insert({
                "roadmap_id": rid,
                "user_email": email,
                "module_number": mod_num,
                "description": "Completed manually via script",
                "evaluation": "Excellent work. You have mastered the concepts.",
                "senate_summary": "Excellent work. You have mastered the concepts.",
                "senate_reasoning": "Completed via script.",
                "is_senate_eval": True,
                "evaluation_level": "Solid",
                "submitted_at": datetime.now(timezone.utc).isoformat()
            }).execute()
        
    # 3. Create mock practice sessions to fulfill the practice requirement (1 per topic)
    for m in modules:
        for t in m.get("topics", []):
            t_id = t["uuid"]
            session_id = str(uuid.uuid4())
            res_id = str(uuid.uuid4())
            
            # Upsert session (since unique constraint on user_id, subtopic_id)
            sb.table("practice_sessions").upsert({
                "id": session_id,
                "user_id": user_id,
                "roadmap_id": rid,
                "subtopic_id": t_id,
                "resources": [{"id": res_id}],
                "has_more": False
            }, on_conflict="user_id,subtopic_id").execute()
            
            # Create progress
            sb.table("practice_progress").upsert({
                "session_id": session_id,
                "user_id": user_id,
                "resource_id": res_id,
                "completed": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).execute()

    print("Progress updated successfully. Check the UI to see 100% completion.")

if __name__ == "__main__":
    update_progress("csir-net-physical-sciences-atomic-molecular-physics-efficient-study-plan")

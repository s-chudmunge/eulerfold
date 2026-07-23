import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import asyncio

from app.core.supabase_client import get_supabase_client, get_admin_supabase_client
from app.utils.ai_client import generate_text, clean_json_string, robust_json_loads, log_backend_ai_usage
from app.core.config import settings
from app.utils.scoring import calculate_confidence_score_formula, get_letter_grade

logger = logging.getLogger(__name__)

async def extract_skills_from_roadmap(roadmap_id: int, user_id: str):
    """
    Maps roadmap topics to canonical skills and stores granular mappings + skill-specific depth.
    """
    sb = get_supabase_client()
    
    r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not r_res.data: return
    roadmap = r_res.data[0]
    email = roadmap.get("email")
    
    plan = roadmap.get("roadmap_plan", {})
    if isinstance(plan, str): plan = json.loads(plan)
    
    modules = plan.get("modules", [])
    flat_topics = []
    for m_idx, m in enumerate(modules):
        mod_num = m_idx + 1
        for t_idx, t in enumerate(m.get("topics", [])):
            title = t.get("title") if isinstance(t, dict) else t
            flat_topics.append({"id": f"{mod_num}-{t_idx}", "title": title})

    # Fetch user's existing technical inventory to ensure consistency and prevent duplicates
    inventory_res = sb.table("user_skills").select("canonical_skills(name, category)").eq("user_id", user_id).execute()
    user_inventory = []
    if inventory_res.data:
        for item in inventory_res.data:
            cs = item.get("canonical_skills")
            if cs:
                user_inventory.append(f"{cs['name']} ({cs['category']})")
    
    inventory_text = ", ".join(user_inventory) if user_inventory else "None (New User)"

    prompt = f"""You are a senior technical architect. Your task is to map roadmap topics to technical skills.

USER'S EXISTING TECHNICAL INVENTORY:
[{inventory_text}]

MISSIONS:
1. Map each topic below to exactly ONE canonical skill name (e.g., 'Game Physics', 'Python', 'React').
2. **IMPORTANT:** If a topic genuinely belongs to a skill already in the user's inventory, use that EXACT name and category.
3. **CRITICAL:** DO NOT force a topic into an existing skill if the domain is fundamentally different. Create a NEW, highly accurate skill name instead.
4. Assign a 'depth' score (1.0 to 5.0) for each skill based on the topics in THIS roadmap.

DEPTH SCORING RULES:
- 1.0 to 1.5: Fundamentals, syntax, basic concepts.
- 2.0 to 3.0: Standard professional usage and patterns.
- 4.0 to 5.0: Expert level, architecture, and complex optimization.

Return ONLY valid JSON:
{{
  "mappings": [
    {{ "topic_id": "1-0", "canonical_skill": "Skill Name", "category": "Category" }}
  ],
  "skill_depths": {{
    "Skill Name": 2.5
  }}
}}

Topics:
{json.dumps(flat_topics)}
"""

    try:
        gen_raw, usage = await generate_text(prompt, model=settings.DEFAULT_FEEDBACK_MODEL, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, user_id, f"Skill Extraction (Cost: 0 Credits)", usage, source="backend")
        data = robust_json_loads(gen_raw)
        await process_extracted_skills(roadmap_id, user_id, data)
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        sb.table("roadmaps").update({"skills_extracted": False, "skills_extraction_error": str(e)}).eq("id", roadmap_id).execute()

async def process_extracted_skills(roadmap_id: int, user_id: str, data: dict):
    sb = get_supabase_client()
    
    r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not r_res.data: return
    roadmap = r_res.data[0]
    email = roadmap.get("email")

    mappings = data.get("mappings", [])
    depths = data.get("skill_depths", {})
    
    skill_topic_map = {}
    skill_category_map = {}
    for m in mappings:
        s_name = m["canonical_skill"]
        if s_name not in skill_topic_map: 
            skill_topic_map[s_name] = []
            skill_category_map[s_name] = m["category"]
        skill_topic_map[s_name].append(m["topic_id"])
        
    for s_name, topic_ids in skill_topic_map.items():
        cs_upsert = sb.table("canonical_skills").upsert({
            "name": s_name, "category": skill_category_map[s_name]
        }, on_conflict="name").execute()
        
        if cs_upsert.data:
            cs_id = cs_upsert.data[0]["id"]
            skill_depth = float(depths.get(s_name, roadmap.get("depth_score", 1.0)))
            
            us_res = sb.table("user_skills").select("*").eq("user_id", user_id).eq("canonical_skill_id", cs_id).execute()
            
            if us_res.data:
                us = us_res.data[0]
                r_ids = set(us.get("contributing_roadmap_ids", []))
                r_ids.add(roadmap_id)
                
                t_maps = us.get("topic_mappings", {}) or {}
                t_maps[str(roadmap_id)] = {
                    "topics": topic_ids,
                    "depth": skill_depth
                }
                
                sb.table("user_skills").update({
                    "contributing_roadmap_ids": list(r_ids),
                    "topic_mappings": t_maps,
                    "user_email": email,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }).eq("id", us["id"]).execute()
            else:
                score = calculate_confidence_score_formula(0, 0, 0, skill_depth, 0, 10.0)
                sb.table("user_skills").insert({
                    "user_id": user_id,
                    "user_email": email,
                    "canonical_skill_id": cs_id,
                    "contributing_roadmap_ids": [roadmap_id],
                    "confidence_score": score,
                    "tier": get_letter_grade(score),
                    "pow_score": 0, "practice_score": 0,
                    "topic_completion": 0, "depth_score": skill_depth / 5.0,
                    "time_invested": 0,
                    "topic_mappings": {str(roadmap_id): {"topics": topic_ids, "depth": skill_depth}}
                }).execute()
            
            await calculate_user_skill_score(user_id, cs_id)
    
    admin_sb = get_admin_supabase_client()
    admin_sb.table("roadmaps").update({"skills_extracted": True, "skills_extraction_error": None}).eq("id", roadmap_id).execute()


async def calculate_user_skill_score(user_id: str, canonical_skill_id: str):
    sb = get_supabase_client()
    
    us_res = sb.table("user_skills").select("*").eq("user_id", user_id).eq("canonical_skill_id", canonical_skill_id).execute()
    if not us_res.data: return
    us = us_res.data[0]
    email = us.get("user_email")
    roadmap_ids = us.get("contributing_roadmap_ids", [])
    t_maps = us.get("topic_mappings", {}) or {}
    if not roadmap_ids: return

    r_res = sb.table("roadmaps").select("*").in_("id", roadmap_ids).execute()
    roadmaps = r_res.data
    
    total_pow_sum = 0.0
    max_depth = 0.0
    total_practice_sum = 0.0
    total_topic_comp_sum = 0.0
    total_weight = 0.0
    total_time = 0.0
    
    all_subs = sb.table("submissions").select("*").eq("user_email", email).in_("roadmap_id", roadmap_ids).execute().data
    all_mp = sb.table("module_progress").select("*").eq("user_email", email).in_("roadmap_id", roadmap_ids).execute().data
    all_pp = sb.table("practice_progress").select("*").eq("user_id", user_id).execute().data
    
    for r in roadmaps:
        rid_str = str(r["id"])
        mapping = t_maps.get(rid_str, {})
        if isinstance(mapping, list): mapping = {"topics": mapping, "depth": r.get("depth_score", 1.0)}
        
        mapped_topics = mapping.get("topics", [])
        if not mapped_topics: continue
        
        # Unit weight based on number of topics
        weight = len(mapped_topics)
        total_weight += weight

        # A. Depth (Max Depth represents peak expertise)
        raw_d = mapping.get("depth", r.get("depth_score", 1.0))
        norm_depth = min(max(raw_d / 5.0, 0.0), 1.0)
        if norm_depth > max_depth:
            max_depth = norm_depth
        
        # B. POW (Weighted by number of topics in this roadmap)
        # We now weight Solid as 1.0 and Developing as 0.7
        relevant_mod_nums = {int(tid.split('-')[0]) for tid in mapped_topics}
        
        pow_val_roadmap = 0.0
        for mod_num in relevant_mod_nums:
            mod_subs = [s for s in all_subs if s["roadmap_id"] == r["id"] and s["module_number"] == mod_num]
            if not mod_subs: continue
            
            # Get latest valid evaluation for this module
            latest_sub = sorted(mod_subs, key=lambda x: x["submitted_at"], reverse=True)[0]
            level = latest_sub.get("evaluation_level")
            
            if level == "Solid":
                pow_val_roadmap += 1.0
            elif level == "Developing":
                pow_val_roadmap += 0.7
        
        pow_r = (pow_val_roadmap / len(relevant_mod_nums)) if relevant_mod_nums else 0.0
        total_pow_sum += (min(pow_r, 1.0) * weight)
        
        # C. Topic Comp (Weighted)
        completed_mapped = [mp for mp in all_mp 
                           if mp["roadmap_id"] == r["id"] 
                           and f"{mp['module_number']}-{mp['topic_index']}" in mapped_topics
                           and mp["completed"]]
        
        comp_r = (len(completed_mapped) / len(mapped_topics)) if mapped_topics else 0.0
        total_topic_comp_sum += (min(comp_r, 1.0) * weight)
        
        # D. Practice (Real practice progress + MCQ sessions)
        ps_res = sb.table("practice_sessions").select("id, subtopic_id").eq("user_id", user_id).eq("roadmap_id", r["id"]).execute()
        relevant_sessions = ps_res.data or []
        
        # Determine number of modules in this roadmap
        raw_plan = r.get("roadmap_plan")
        plan = json.loads(raw_plan) if isinstance(raw_plan, str) else (raw_plan if isinstance(raw_plan, dict) else {})
        module_count = len(plan.get("modules", []))
        max_practice_resources = module_count * 3  # 1 session (3 resources) per module
        
        # MCQ Sessions
        mcq_res = sb.table("mcq_sessions").select("score, subtopic_id").eq("user_id", user_id).eq("roadmap_id", r["id"]).eq("status", "completed").execute()
        relevant_mcqs = mcq_res.data or []
        
        total_possible_practice = max_practice_resources
        completed_practice = 0

        # Standard Practice Sessions
        # Count practice progress, but cap at one session per module
        if relevant_sessions:
            for ps in relevant_sessions:
                session_progress = [pp for pp in all_pp if pp["session_id"] == ps["id"] and pp["completed"]]
                completed_practice += len(session_progress)
        
        # MCQ Sessions (contribute proportionally, also capped by max resources)
        if relevant_mcqs:
            for mcq in relevant_mcqs:
                score = mcq.get("score", 0.0)
                completed_practice += (score * 3)
        
        # Ensure completed practice does not exceed the allowed maximum
        completed_practice = min(completed_practice, max_practice_resources)

        if total_possible_practice > 0:
            practice_r = min(completed_practice / total_possible_practice, 1.0)
            # Boost if they also have POW proof
            practice_r = max(practice_r, pow_r * 0.5)
        else:
            practice_r = pow_r * 0.95
        
        total_practice_sum += (min(max(practice_r, 0.0), 1.0) * weight)
        
        total_time += ((r.get("time_value") or 1) * 5.0)

    # Calculate final weighted metrics
    final_pow = (total_pow_sum / total_weight) if total_weight > 0 else 0.0
    final_practice = (total_practice_sum / total_weight) if total_weight > 0 else 0.0
    final_topics = (total_topic_comp_sum / total_weight) if total_weight > 0 else 0.0
    final_depth = max_depth # peak mastery
    
    old_score = us.get("confidence_score", 0.0)
    score = calculate_confidence_score_formula(
        final_pow, final_practice, final_topics, final_depth, total_time, 10.0
    )
    
    cs_res = sb.table("canonical_skills").select("name").eq("id", canonical_skill_id).execute()
    skill_name = cs_res.data[0]["name"] if cs_res.data else canonical_skill_id
    
    if abs(old_score - score) > 0.01:
        logger.info(f"Skill Updated: {skill_name} | Old Score: {old_score:.1f} -> New Score: {score:.1f}")
    
    sb.table("user_skills").update({
        "confidence_score": score,
        "tier": get_letter_grade(score),
        "pow_score": final_pow, "practice_score": final_practice,
        "topic_completion": final_topics, "depth_score": final_depth,
        "time_invested": total_time, "last_updated": datetime.now(timezone.utc).isoformat()
    }).eq("id", us["id"]).execute()

async def calculate_user_skill_scores_for_roadmap(roadmap_id: int, user_id: str):
    sb = get_supabase_client()
    
    # 1. Check if skills have been extracted for this roadmap OR if any skills actually exist for it
    r_res = sb.table("roadmaps").select("skills_extracted").eq("id", roadmap_id).single().execute()
    us_check = sb.table("user_skills").select("id").eq("user_id", user_id).filter("contributing_roadmap_ids", "cs", f"{{{roadmap_id}}}").limit(1).execute()
    
    # If not extracted OR if extraction flag is set but no skills are linked (recovery case)
    if (r_res.data and not r_res.data.get("skills_extracted")) or (not us_check.data):
        # Trigger extraction if not already done or if no skills linked
        await extract_skills_from_roadmap(roadmap_id, user_id)
    
    # 2. Recalculate scores for all skills this roadmap contributes to
    us_res = sb.table("user_skills").select("canonical_skill_id").eq("user_id", user_id).filter("contributing_roadmap_ids", "cs", f"{{{roadmap_id}}}").execute()
    for us in us_res.data:
        await calculate_user_skill_score(user_id, us["canonical_skill_id"])

async def cleanup_skills_after_roadmap_deletion(roadmap_id: int, user_id: str):
    """
    Called BEFORE a roadmap is deleted. 
    Removes the roadmap from all user_skills and recalculates or deletes the skill.
    """
    sb = get_supabase_client()
    
    # 1. Find all skills that this roadmap contributed to
    us_res = sb.table("user_skills").select("*").eq("user_id", user_id).filter("contributing_roadmap_ids", "cs", f"{{{roadmap_id}}}").execute()
    
    for us in us_res.data:
        # Remove this roadmap from the list
        r_ids = set(us.get("contributing_roadmap_ids", []))
        r_ids.discard(roadmap_id)
        
        if not r_ids:
            # If no roadmaps left for this skill, delete the skill card
            sb.table("user_skills").delete().eq("id", us["id"]).execute()
        else:
            # Update the list and recalculate
            sb.table("user_skills").update({
                "contributing_roadmap_ids": list(r_ids)
            }).eq("id", us["id"]).execute()
            await calculate_user_skill_score(user_id, us["canonical_skill_id"])

import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import asyncio

from app.core.supabase_client import get_supabase_client
from app.utils.gemini_client import generate_text, clean_json_string
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

MISSION:
1. Map each topic below to exactly ONE canonical skill name (e.g., 'Python', 'FastAPI', 'React').
2. **CRITICAL:** If a topic fits into a skill already in the user's inventory, you MUST use that EXACT name and category.
3. Assign a 'depth' score (1.0 to 5.0) for each skill based on the topics in THIS roadmap.

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
        gen_raw = await generate_text(prompt, model=settings.GEMINI_MODEL, response_mime_type="application/json")
        data = json.loads(clean_json_string(gen_raw))
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
                        "depth": skill_depth # Store depth at the mapping level
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
        
        sb.table("roadmaps").update({"skills_extracted": True}).eq("id", roadmap_id).execute()
                
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        sb.table("roadmaps").update({"skills_extracted": False, "skills_extraction_error": str(e)}).eq("id", roadmap_id).execute()

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
        relevant_mod_nums = {int(tid.split('-')[0]) for tid in mapped_topics}
        r_verified_mods = {s["module_number"] for s in all_subs 
                           if s["roadmap_id"] == r["id"] 
                           and s["module_number"] in relevant_mod_nums 
                           and s["evaluation_level"] in ["Solid", "Developing"]}
        
        pow_r = (len(r_verified_mods) / len(relevant_mod_nums)) if relevant_mod_nums else 0.0
        total_pow_sum += (min(pow_r, 1.0) * weight)
        
        # C. Topic Comp (Weighted)
        completed_mapped = [mp for mp in all_mp 
                           if mp["roadmap_id"] == r["id"] 
                           and f"{mp['module_number']}-{mp['topic_index']}" in mapped_topics
                           and mp["completed"]]
        
        comp_r = (len(completed_mapped) / len(mapped_topics)) if mapped_topics else 0.0
        total_topic_comp_sum += (min(comp_r, 1.0) * weight)
        
        # D. Practice (Weighted proxy)
        total_practice_sum += (min(max(pow_r * 0.95, 0.0), 1.0) * weight)
        
        total_time += (r.get("time_value", 1) * 5.0)

    # Calculate final weighted metrics
    final_pow = (total_pow_sum / total_weight) if total_weight > 0 else 0.0
    final_practice = (total_practice_sum / total_weight) if total_weight > 0 else 0.0
    final_topics = (total_topic_comp_sum / total_weight) if total_weight > 0 else 0.0
    final_depth = max_depth # peak mastery
    
    score = calculate_confidence_score_formula(
        final_pow, final_practice, final_topics, final_depth, total_time, 10.0
    )
    
    sb.table("user_skills").update({
        "confidence_score": score,
        "tier": get_letter_grade(score),
        "pow_score": final_pow, "practice_score": final_practice,
        "topic_completion": final_topics, "depth_score": final_depth,
        "time_invested": total_time, "last_updated": datetime.now(timezone.utc).isoformat()
    }).eq("id", us["id"]).execute()

async def calculate_user_skill_scores_for_roadmap(roadmap_id: int, user_id: str):
    sb = get_supabase_client()
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

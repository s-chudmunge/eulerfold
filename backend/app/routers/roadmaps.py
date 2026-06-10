import json
import os
import random
import re
import uuid
import logging
import asyncio
import hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict



from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks

from app.core.config import settings
from app.core.supabase_client import supabase, get_supabase_client
from app.schemas import RoadmapCreate, RoadmapMe, RoadmapRead, RoadmapSave, User, ProgressUpdate, RoadmapExtend, RoadmapStatusUpdate, ManualBuildRequest, JobRoadmapCreate, ExternalRoadmapCreate
from app.utils.gemini_client import generate_text, clean_json_string, robust_json_loads
from app.utils.resend_client import send_onboarding_email
from app.utils.youtube_client import search_youtube_videos
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.auth import get_current_user
from app.routers.optional_auth import get_optional_current_user
from app.services.skills_service import extract_skills_from_roadmap, calculate_user_skill_scores_for_roadmap, cleanup_skills_after_roadmap_deletion

from app.database.monitor import monitor_query

logger = logging.getLogger(__name__)
router = APIRouter()

async def transition_roadmap_status(roadmap_id: int, new_status: str, user_email: str, user_uid: Optional[str] = None):
    """
    Centralized status transition logic. 
    Handles database updates and side effects (Coins, Skill Extraction).
    """
    try:
        sb = get_supabase_client()
        
        # 1. Fetch current state for idempotency and side-effect checks
        r_res = sb.table("roadmaps").select("status, title, skills_extracted, skills_extraction_error").eq("id", roadmap_id).execute()
        if not r_res.data:
            return
        
        roadmap = r_res.data[0]
        old_status = roadmap.get("status", "active")
        
        if old_status == new_status:
            return # No transition needed

        # 2. Update Database
        sb.table("roadmaps").update({
            "status": new_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", roadmap_id).execute()
        
        logger.info(f"Roadmap {roadmap_id} transitioned: {old_status} -> {new_status}")

        # 3. Handle Side Effects for COMPLETION
        if new_status == "completed" and old_status == "active":
            # A. Award Coins (50) - award_coins has its own internal idempotency check as well
            await award_coins(
                user_email, 
                EulerCoins.ROADMAP_COMPLETED, 
                f"Completed roadmap: {roadmap.get('title')}", 
                roadmap_id=roadmap_id
            )
            
            # B. Trigger Skill Extraction
            if user_uid and (not roadmap.get("skills_extracted") or roadmap.get("skills_extraction_error")):
                # Since we are already in an async function (possibly background), we can call it directly
                # but to be safe and consistent with other triggers, we keep it as a clean call
                try:
                    await extract_skills_from_roadmap(roadmap_id, user_uid)
                except Exception as e:
                    logger.error(f"Skill extraction failed during transition: {e}")

    except Exception as e:
        logger.error(f"Failed to transition roadmap status for {roadmap_id}: {e}")

def _parse_roadmap_dict(roadmap_val: Any) -> Dict[str, Any]:
    if isinstance(roadmap_val, str):
        try:
            return json.loads(roadmap_val)
        except json.JSONDecodeError:
            return {}
    if isinstance(roadmap_val, dict):
        return roadmap_val
    return {}

def _generate_plan_hash(plan: Dict[str, Any]) -> str:
    """Generate a stable hash for a roadmap plan."""
    plan_str = json.dumps(plan, sort_keys=True)
    return hashlib.sha256(plan_str.encode()).hexdigest()

async def _enrich_roadmap_progress(roadmaps: List[Dict], email: str, uid: str, sb, background_tasks: Optional[BackgroundTasks] = None):
    if not email or not uid:
        return roadmaps

    # Fetch data in bulk
    roadmap_ids = [r["id"] for r in roadmaps]
    if not roadmap_ids:
        return roadmaps

    # 1. Fetch module_progress (completed topics)
    mp_res = sb.table("module_progress").select("roadmap_id, module_number, topic_index, completed").eq("user_email", email).in_("roadmap_id", roadmap_ids).eq("completed", True).execute()
    
    # 2. Fetch submissions (ordered by latest first)
    sub_res = sb.table("submissions").select("roadmap_id, module_number, evaluation_level").eq("user_email", email).in_("roadmap_id", roadmap_ids).order("submitted_at", desc=True).execute()
    
    # 3. Fetch practice sessions & progress
    ps_res = sb.table("practice_sessions").select("id, roadmap_id, resources").eq("user_id", uid).in_("roadmap_id", roadmap_ids).execute()
    pp_res = sb.table("practice_progress").select("session_id, resource_id, completed").eq("user_id", uid).eq("completed", True).execute()

    # Organize data for quick lookup
    mp_map = {} # roadmap_id -> set of (module_number, topic_index)
    for mp in mp_res.data:
        rid = mp["roadmap_id"]
        if rid not in mp_map: mp_map[rid] = set()
        mp_map[rid].add((mp["module_number"], mp["topic_index"]))
    
    sub_map = {} # roadmap_id -> {module_number: evaluation_level}
    for sub in sub_res.data:
        rid = sub["roadmap_id"]
        m_num = sub["module_number"]
        if rid not in sub_map: sub_map[rid] = {}
        # Only take the most recent evaluation for each module
        if m_num not in sub_map[rid]:
            sub_map[rid][m_num] = sub["evaluation_level"]
        
    ps_map = {} # roadmap_id -> list of sessions
    for ps in ps_res.data:
        rid = ps["roadmap_id"]
        if rid not in ps_map: ps_map[rid] = []
        ps_map[rid].append(ps)
        
    pp_set = set() # (session_id, resource_id)
    for pp in pp_res.data:
        pp_set.add((str(pp["session_id"]), str(pp["resource_id"])))

    for r in roadmaps:
        rid = r["id"]
        plan = _parse_roadmap_dict(r["roadmap_plan"])
        modules = plan.get("modules", [])
        total_modules = len(modules)
        
        module_scores = []
        db_status = r.get("status", "active")
        roadmap_status = db_status
        bottleneck_module = None
        
        # Track counts for the summary object
        total_topics_all = 0
        completed_topics_all = 0
        total_subs_all = total_modules
        completed_subs_all = 0
        total_practice_all = 0
        completed_practice_all = 0

        # Calculate scores per module
        for module in modules:
            m_num = int(module.get("id", "module_0").split("_")[1])
            m_topics = module.get("topics", [])
            m_topic_count = len(m_topics)
            total_topics_all += m_topic_count
            
            # 1. Topic Completion Score
            completed_topics_in_module = 0
            for t_idx, topic in enumerate(m_topics):
                if (m_num, t_idx) in mp_map.get(rid, set()):
                    completed_topics_in_module += 1
            completed_topics_all += completed_topics_in_module
            
            # 2. Submission Score (Technician Evaluation)
            eval_level = sub_map.get(rid, {}).get(m_num)
            if eval_level:
                completed_subs_all += 1
            
            # 3. Practice Score
            m_sessions = [ps for ps in ps_map.get(rid, []) if any(topic.get("id") == ps.get("subtopic_id") for topic in m_topics)]
            m_total_res = 0
            m_completed_res = 0
            for ps in m_sessions:
                resources = ps.get("resources", [])
                m_total_res += len(resources)
                for res in resources:
                    if (str(ps["id"]), str(res["id"])) in pp_set:
                        m_completed_res += 1
            total_practice_all += m_total_res
            completed_practice_all += m_completed_res

            # Status determination logic: 
            # If a module is completed (all topics + solid/developing submission), we move on.
            # If not, it's the bottleneck.
            if bottleneck_module is None:
                if completed_topics_in_module < m_topic_count or not eval_level:
                    bottleneck_module = m_num
                    if eval_level == "Beginner":
                        # Calculated status can be resubmit_required, but if DB is 'completed' or 'archived', we might want to respect that?
                        # Actually 'resubmit_required' is a temporary active state.
                        if roadmap_status == "active":
                            roadmap_status = "resubmit_required"
                    elif eval_level == "Developing" and completed_topics_in_module == m_topic_count:
                         # Good enough to proceed, but not Solid. 
                         # Actually we allow Developing to pass but label as "Needs Improvement"
                         if roadmap_status == "active":
                            roadmap_status = "needs_improvement"

        # Overall Percent Calculation
        # Weights: 40% PoW (Submissions) + 30% Topics + 30% Practice
        pow_weight = (completed_subs_all / total_subs_all) * 40 if total_subs_all > 0 else 40
        topic_weight = (completed_topics_all / total_topics_all) * 30 if total_topics_all > 0 else 30
        practice_weight = (completed_practice_all / total_practice_all) * 30 if total_practice_all > 0 else 30
        
        percent = round(pow_weight + topic_weight + practice_weight)

        # Final Completion Check
        if percent >= 100 and roadmap_status not in ["resubmit_required", "needs_improvement"]:
            if db_status == "active":
                roadmap_status = "completed"
                # Persist completion status to DB in background
                if background_tasks:
                    background_tasks.add_task(transition_roadmap_status, rid, "completed", email, uid)
            
            # Note: Skill extraction is now handled inside transition_roadmap_status if it's the first time
            # However, if it was ALREADY completed but skills haven't been extracted, we still want this trigger:
            elif background_tasks and uid and (not r.get("skills_extracted") or r.get("skills_extraction_error")):
                background_tasks.add_task(extract_skills_from_roadmap, rid, uid)
            
        r["calculated_progress"] = {
            "percent": percent,
            "completed_topics": completed_topics_all,
            "total_topics": total_topics_all,
            "completed_submissions": completed_subs_all,
            "total_submissions": total_subs_all,
            "completed_resources": completed_practice_all,
            "total_resources": total_practice_all,
            "bottleneck_module": bottleneck_module
        }
        # If DB status is terminal (archived, quit), keep it. 
        # Otherwise use calculated (active, completed, resubmit_required, etc.)
        if db_status in ["archived", "quit", "completed"]:
            r["calculated_status"] = db_status
        else:
            r["calculated_status"] = roadmap_status
    
    return roadmaps

@router.get("/roadmaps/me", response_model=List[RoadmapMe])
async def get_my_roadmaps(background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user)):
    email = current_user.email
    uid = current_user.supabase_uid

    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    # Fetch roadmaps
    response = sb.table("roadmaps").select("*").eq("email", email).order("updated_at", desc=True).execute()
    
    enriched_data = await _enrich_roadmap_progress(response.data, email, uid, sb, background_tasks)
    
    results = []
    for r in enriched_data:
        results.append(RoadmapMe(
            id=r["id"],
            slug=r.get("slug", ""),
            title=r["title"],
            description=r["description"],
            roadmap_plan=_parse_roadmap_dict(r["roadmap_plan"]),
            subject=r["subject"],
            goal=r["goal"],
            time_value=r["time_value"],
            time_unit=r["time_unit"],
            model=r["model"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            last_position=r.get("last_position", {"mIdx": 0, "tIdx": 0}),
            is_public=r.get("is_public", False),
            show_author=r.get("show_author", True),
            clone_count=r.get("clone_count", 0),
            report_count=r.get("report_count", 0),
            average_rating=float(r.get("average_rating") or 0.0),
            rating_count=r.get("rating_count", 0),
            cloned_from=r.get("cloned_from"),
            is_cloned=bool(r.get("cloned_from")),
            progress=r.get("calculated_progress"),
            status=r.get("calculated_status", "active"),
            extension_count=r.get("extension_count", 0)
        ))

    return results


@router.get("/roadmaps/by-slug/{slug}", response_model=RoadmapMe)
async def get_roadmap_by_slug(slug: str, background_tasks: BackgroundTasks, current_user: Optional[User] = Depends(get_optional_current_user)):
    sb = get_supabase_client()
    email = current_user.email if current_user else None
    uid = current_user.supabase_uid if current_user else None

    # Fetch all roadmaps matching this slug
    response = sb.table("roadmaps").select("*, email").eq("slug", slug).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # 1. If logged in, find the user's own version first
    r = None
    if email:
        user_version = next((item for item in response.data if item.get("email", "").lower() == email.lower()), None)
        if user_version:
            r = user_version

    # 2. Fallback: Find the original public version (the one that is public and NOT a clone, or just the first public one)
    if not r:
        public_version = next((item for item in response.data if item.get("is_public")), None)
        if public_version:
            r = public_version

    # 3. Last fallback: just take the first one if we really have to (e.g. searching private by slug while logged in)
    if not r:
        r = response.data[0]

    # Ownership or Public check
    is_owner = email and r["email"].lower() == email.lower()
    is_public = r.get("is_public", False)

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")

    # If it's public view by non-owner, filter out extensions from roadmap_plan
    if not is_owner and is_public:
        plan = _parse_roadmap_dict(r["roadmap_plan"])
        if "modules" in plan:
            original_count = len(plan["modules"])
            # Only keep modules that are NOT marked as extensions
            plan["modules"] = [m for m in plan["modules"] if not m.get("is_extension")]
            filtered_count = len(plan["modules"])
            
            # Adjust time_value if we removed modules
            if filtered_count < original_count:
                removed_count = original_count - filtered_count
                r["time_value"] = max(1, (r.get("time_value", 0) or 0) - removed_count)
            
            r["roadmap_plan"] = plan

    # Fetch author information
    r_email = r.get("email")
    author = "Anonymous"
    username = None
    if r_email:
        profile_res = sb.table("profiles").select("username").eq("email", r_email).execute()
        if profile_res.data and profile_res.data[0].get("username"):
            username = profile_res.data[0]["username"]
            author = username
        elif r.get("show_author", True):
            email_part = r_email.split("@")[0]
            raw_name = email_part.split(".")[0]
            if len(raw_name) >= 2:
                author = raw_name.capitalize()
            else:
                author = "EulerFold User"

    # Reuse enrichment logic if needed, but for a single roadmap we can simplify
    if uid:
        enriched = await _enrich_roadmap_progress([r], email, uid, sb, background_tasks)
        r = enriched[0]
    else:
        # For public view by crawlers/unauthenticated users, no progress enrichment needed
        pass

    # 4. Check if already cloned by this user
    is_cloned = False
    cloned_id = None
    user_rating = None
    if uid:
        if not is_owner:
            clone_check = sb.table("roadmaps").select("id").eq("email", email).eq("cloned_from", r["id"]).execute()
            if clone_check.data:
                is_cloned = True
                cloned_id = clone_check.data[0]["id"]
        
        # Fetch user's rating
        rating_res = sb.table("roadmap_ratings").select("rating").eq("roadmap_id", r["id"]).eq("user_id", uid).execute()
        if rating_res.data:
            user_rating = rating_res.data[0]["rating"]

    return RoadmapMe(
        id=r["id"],
        user_id=r.get("user_id"),
        title=r["title"],
        slug=r["slug"],
        description=r["description"],
        roadmap_plan=r["roadmap_plan"],
        subject=r.get("subject"),
        goal=r.get("goal"),
        time_value=r.get("time_value"),
        time_unit=r.get("time_unit"),
        model=r.get("model"),
        created_at=r["created_at"],
        updated_at=r["updated_at"],
        last_position=r.get("last_position") or {"mIdx": 0, "tIdx": 0},
        is_public=r.get("is_public", False),
        show_author=r.get("show_author", True),
        clone_count=r.get("clone_count", 0),
        report_count=r.get("report_count", 0),
        average_rating=float(r.get("average_rating") or 0.0),
        rating_count=r.get("rating_count", 0),
        cloned_from=r.get("cloned_from"),
        progress=r.get("calculated_progress"),
        status=r.get("calculated_status", "active"),
        email=r.get("email"),
        is_cloned=is_cloned,
        cloned_id=cloned_id,
        extension_count=r.get("extension_count", 0),
        user_rating=user_rating,
        author=author,
        username=username
    )

@router.post("/roadmaps/{roadmap_id}/extend", response_model=RoadmapRead)
async def extend_roadmap(
    roadmap_id: int,
    payload: RoadmapExtend,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Extend an existing roadmap for Pro users only after completing all current modules."""
    email = current_user.email
    uid = current_user.supabase_uid
    sb = get_supabase_client()

    # 1. Eligibility Check: Roadmap Existence & Ownership
    r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not r_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    roadmap = r_res.data[0]
    if roadmap.get("email", "").lower() != email.lower():
        raise HTTPException(status_code=403, detail="Not authorized to extend this roadmap")

    # 2. Eligibility Check: Pro User
    profile_res = sb.table("profiles").select("is_pro").eq("email", email).execute()
    if not profile_res.data or not profile_res.data[0].get("is_pro"):
        raise HTTPException(status_code=402, detail="Roadmap extension is a Pro feature. Please upgrade to Pro.")

    # 3. Eligibility Check: Extension Count
    extension_count = roadmap.get("extension_count", 0)
    if extension_count >= 5:
        raise HTTPException(status_code=400, detail="Maximum of 5 extensions reached for this roadmap.")

    # 4. Eligibility Check: Learning Progress (All topics completed)
    # Use _enrich_roadmap_progress logic to check completion
    enriched = await _enrich_roadmap_progress([roadmap], email, uid, sb)
    roadmap = enriched[0]
    progress = roadmap.get("calculated_progress", {})
    if progress.get("completed_topics", 0) < progress.get("total_topics", 1):
         raise HTTPException(status_code=400, detail="You must complete all existing learning material before extending the roadmap.")

    # 5. Generation with Gemini
    plan = _parse_roadmap_dict(roadmap.get("roadmap_plan", {}))
    existing_modules = plan.get("modules", [])
    last_module_title = existing_modules[-1].get("title") if existing_modules else "the beginning"
    
    prompt = f"""
You are extending an existing curriculum. The user has already finished a roadmap on "{roadmap.get('subject')}".
Their original goal was: "{roadmap.get('goal')}"

They now want to EXTEND this roadmap for {payload.weeks} more week(s) to learn: "{payload.extension_goal}"

**Instructions:**
1. Generate {payload.weeks} new modules that logically follow the existing curriculum.
2. **Output JSON ONLY** in the following schema:
   {{
     "modules": [
       {{
         "title": "string",
         "outcome": "string",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {{
           "what_to_build": "string",
           "what_counts_as_evidence": "string",
           "eval_criteria": ["string", "string"]
         }},
         "topics": [
           {{
             "title": "string",
             "subtopics": [ {{ "title": "string" }} ]
           }}
         ],
         "resources": [
           {{ "title": "string", "url": "string", "type": "docs|article" }}
         ]
       }}
     ]
   }}
3. **Crucial:** In the "resources" array, provide ONLY high-quality documentation, articles, or books (non-YouTube links).
4. For each module, ensure a concrete "outcome" string starting with "By the end of this module you will be able to...".
5. The extensions should build upon the last module which was about "{last_module_title}".
6. **Workspace Selection:** 
   - Set "workspace_type" to "code" for implementation, algorithms, or scripting tasks.
   - Set "workspace_type" to "design" for system architecture, distributed systems, infrastructure, or UI/UX.
   - Set "workspace_type" to "research" for theoretical science, mathematics, or technical writing.

Begin the JSON output immediately.
"""
    try:
        model_to_use = "models/gemini-2.5-pro" # Pro users get Pro model
        generated_text = await generate_text(prompt, model=model_to_use, response_mime_type="application/json")
        extension_data = robust_json_loads(generated_text)
        new_modules = extension_data.get("modules", [])

        # Inject IDs and mark as extension
        existing_module_count = len(existing_modules)
        for i, module in enumerate(new_modules):
            m_idx = existing_module_count + i
            module["id"] = f"module_{m_idx + 1}"
            module["is_extension"] = True # Mark as private extension
            if not module.get("outcome"):
                module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            for t_idx, topic in enumerate(module.get("topics", [])):
                topic["id"] = f"topic_{m_idx + 1}_{t_idx + 1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    subtopic["id"] = str(uuid.uuid4())

        # YouTube enrichment for new modules (even though user asked for study material links, we still provide videos)
        if settings.YOUTUBE_API_KEY:
            try:
                for module in new_modules:
                    for topic in module.get("topics", []):
                        search_query = f"{roadmap.get('subject')} {topic['title']} {payload.extension_goal} tutorial"
                        results = await search_youtube_videos(search_query, max_results=1)
                        if results:
                            topic["youtube_video_id"] = results[0]["video_id"]
                            topic["youtube_video_title"] = results[0]["video_title"]
                            topic["duration"] = results[0]["duration_minutes"]
                        await asyncio.sleep(0.1)
            except Exception as e:
                logger.error(f"Failed to enrich extension with YouTube videos: {e}")

        # Update Roadmap
        updated_modules = existing_modules + new_modules
        plan["modules"] = updated_modules
        
        current_ext_count = roadmap.get("extension_count", 0)
        if current_ext_count is None: current_ext_count = 0
        
        new_time_value = (roadmap.get("time_value", 0) or 0) + payload.weeks
        current_version = roadmap.get("version", 1) or 1
        
        update_res = sb.table("roadmaps").update({
            "roadmap_plan": plan,
            "time_value": new_time_value,
            "extension_count": current_ext_count + 1,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "version": current_version + 1,
            "snapshot_hash": _generate_plan_hash(plan)
        }).eq("id", roadmap_id).execute()

        if not update_res.data:
            raise HTTPException(status_code=500, detail="Failed to update roadmap with extension.")

        # Trigger skill extraction for the entire (now extended) roadmap
        if uid:
            background_tasks.add_task(extract_skills_from_roadmap, roadmap_id, uid)

        return RoadmapRead(**update_res.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Extension generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap extension.")

@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapMe)
async def get_roadmap_by_id(roadmap_id: int, background_tasks: BackgroundTasks, current_user: Optional[User] = Depends(get_optional_current_user)):

    email = current_user.email if current_user else None
    uid = current_user.supabase_uid if current_user else None

    sb = get_supabase_client()
    response = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    r = response.data[0]
    
    # Ownership or Public check
    is_owner = email and r["email"].lower() == email.lower()
    is_public = r.get("is_public", False)

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized to view this roadmap")

    # If it's public view by non-owner, filter out extensions from roadmap_plan
    if not is_owner and is_public:
        plan = _parse_roadmap_dict(r["roadmap_plan"])
        if "modules" in plan:
            original_count = len(plan["modules"])
            # Only keep modules that are NOT marked as extensions
            plan["modules"] = [m for m in plan["modules"] if not m.get("is_extension")]
            filtered_count = len(plan["modules"])
            
            # Adjust time_value if we removed modules
            if filtered_count < original_count:
                removed_count = original_count - filtered_count
                r["time_value"] = max(1, (r.get("time_value", 0) or 0) - removed_count)
            
            r["roadmap_plan"] = plan

    enriched_data = await _enrich_roadmap_progress([r], email, uid, sb, background_tasks)
    r = enriched_data[0]

    # Fetch user's rating
    user_rating = None
    if uid:
        rating_res = sb.table("roadmap_ratings").select("rating").eq("roadmap_id", roadmap_id).eq("user_id", uid).execute()
        if rating_res.data:
            user_rating = rating_res.data[0]["rating"]

    return RoadmapMe(
        id=r["id"],
        slug=r.get("slug", ""),
        title=r["title"],
        description=r["description"],
        roadmap_plan=_parse_roadmap_dict(r["roadmap_plan"]),
        subject=r["subject"],
        goal=r["goal"],
        time_value=r["time_value"],
        time_unit=r["time_unit"],
        model=r["model"],
        created_at=r["created_at"],
        updated_at=r["updated_at"],
        last_position=r.get("last_position", {"mIdx": 0, "tIdx": 0}),
        is_public=r.get("is_public", False),
        show_author=r.get("show_author", True),
        clone_count=r.get("clone_count", 0),
        report_count=r.get("report_count", 0),
        average_rating=float(r.get("average_rating") or 0.0),
        rating_count=r.get("rating_count", 0),
        cloned_from=r.get("cloned_from"),
        progress=r.get("calculated_progress"),
        status=r.get("calculated_status", "active"),
        extension_count=r.get("extension_count", 0),
        user_rating=user_rating
    )

@router.post("/roadmaps/save", response_model=RoadmapRead)
async def save_roadmap(
    roadmap_save: RoadmapSave,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Save a generated roadmap to the database."""
    email = current_user.email
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    
    # 1. Generate unique slug
    slug = await _generate_unique_slug(roadmap_save.title, email, sb)
    
    # 2. Insert into roadmaps table
    roadmap_data = roadmap_save.dict()
    roadmap_data["slug"] = slug
    roadmap_data["email"] = email
    roadmap_data["status"] = "active"
    roadmap_data["version"] = 1
    
    # Ensure all modules have IDs and Topics have UUIDs for the learning app
    plan = roadmap_data.get("roadmap_plan", {})
    for i, module in enumerate(plan.get("modules", [])):
        if not module.get("id"):
            module["id"] = f"module_{i+1}"
        for t_idx, topic in enumerate(module.get("topics", [])):
            if not topic.get("id"):
                topic["id"] = f"topic_{i+1}_{t_idx+1}"
            if not topic.get("uuid"):
                topic["uuid"] = str(uuid.uuid4())
            for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                if not subtopic.get("id"):
                    subtopic["id"] = str(uuid.uuid4())
    
    roadmap_data["roadmap_plan"] = plan
    roadmap_data["snapshot_hash"] = _generate_plan_hash(plan)

    response = sb.table("roadmaps").insert(roadmap_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to save roadmap")
        
    return RoadmapRead(**response.data[0])


@router.post("/roadmaps/generate", response_model=RoadmapRead)
@monitor_query(query_type="generate_roadmap", table="roadmaps")
async def generate_roadmap(
    roadmap_create: RoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Generate a full roadmap using Gemini AI and save it."""
    email = current_user.email
    uid = current_user.supabase_uid
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    # Roadmap Credit Check (Standard: 5 roadmaps total)
    sb = get_supabase_client()
    
    # Get user profile
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", email).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    is_pro = profile_res.data[0].get("is_pro", False)
    credits = profile_res.data[0].get("roadmap_credits", 0)
    
    if credits < 1:
        if is_pro:
            raise HTTPException(status_code=402, detail="You have run out of roadmap credits. Please top up to continue.")
        else:
            raise HTTPException(status_code=402, detail="No roadmap credits left. Please upgrade to Pro.")

    # 1. Generate Roadmap Structure with Gemini
    context_str = f"The learner is currently a {roadmap_create.current_role or 'student/professional'} but is aspiring to become a {roadmap_create.target_role or 'expert in this field'}."
    context_str += f" They have {roadmap_create.experience_level or 'some'} experience level in the subject area."
    if roadmap_create.prior_experience:
        context_str += f" Additional context on their background: {roadmap_create.prior_experience}"

    prompt = f"""
You are a technical lead.
Generate a rigorous technical learning roadmap for the subject: "{roadmap_create.subject}".
The learner's specific goal is: "{roadmap_create.goal}".
{context_str}
Estimated duration: {roadmap_create.time_value} {roadmap_create.time_unit}.

**Rules:**
1. **Technical Rigor:** Focus on depth and verifiable technical skills. Avoid introductory fluff.
2. **Logical Progression:** Structure the path into modules that build upon each other logically.
3. **Specific Topics:** Each module must have 3-5 specific topics. Use industry-standard technical terms.
4. **Practical Outcomes:** For each module, include a "proof_of_work_instructions" object that details a realistic technical task the user must solve to demonstrate mastery.
5. **Applied Mastery:** Ensure each module leads to a specific competency string starting with "By the end of this module you will be able to...".
6. **Output JSON ONLY** matching this schema:
   {{
     "title": "string",
     "description": "Concise technical overview of the learning path (max 2 sentences).",
     "modules": [
       {{
         "title": "string",
         "outcome": "string",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {{
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         }},
         "topics": [
           {{
             "title": "string",
             "subtopics": [ {{ "title": "string" }} ]
           }}
         ],
         "resources": [
            {{ "title": "string", "url": "string", "type": "docs|article" }}
         ]
       }}
     ]
   }}
7. **Quality Resources:** In the "resources" array, provide ONLY high-quality documentation, articles, or books (non-YouTube links).
8. **Workspace Selection:** 
   - Set "workspace_type" to "code" for implementation, algorithms, or scripting tasks.
   - Set "workspace_type" to "design" for system architecture, distributed systems, infrastructure, or UI/UX.
   - Set "workspace_type" to "research" for theoretical science, mathematics, or technical writing.
"""
    try:
        model_to_use = settings.GEMINI_MODEL
        if is_pro:
            model_to_use = "models/gemini-2.5-pro"
            
        generated_text = await generate_text(prompt, model=model_to_use, response_mime_type="application/json")
        roadmap_plan = robust_json_loads(generated_text)

        # 2. Add IDs and YouTube Videos
        for i, module in enumerate(roadmap_plan.get("modules", [])):
            module["id"] = f"module_{i+1}"
            if not module.get("outcome"):
                 module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            for t_idx, topic in enumerate(module.get("topics", [])):
                topic["id"] = f"topic_{i+1}_{t_idx+1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    subtopic["id"] = str(uuid.uuid4())
                
                # YouTube Enrichment
                if settings.YOUTUBE_API_KEY:
                    try:
                        search_query = f"{roadmap_create.subject} {topic['title']} tutorial"
                        results = await search_youtube_videos(search_query, max_results=1)
                        if results:
                            topic["youtube_video_id"] = results[0]["video_id"]
                            topic["youtube_video_title"] = results[0]["video_title"]
                            topic["duration"] = results[0]["duration_minutes"]
                        # Throttle a bit
                        await asyncio.sleep(0.1)
                    except Exception as yt_err:
                        logger.error(f"YouTube enrichment failed for topic {topic['title']}: {yt_err}")

        # 3. Save to DB
        slug = await _generate_unique_slug(roadmap_plan["title"], email, sb)
        
        db_data = {
            "title": roadmap_plan["title"],
            "description": roadmap_plan["description"],
            "roadmap_plan": roadmap_plan,
            "subject": roadmap_create.subject,
            "goal": roadmap_create.goal,
            "time_value": roadmap_create.time_value,
            "time_unit": roadmap_create.time_unit,
            "model": model_to_use,
            "email": email,
            "slug": slug,
            "status": "active",
            "version": 1,
            "snapshot_hash": _generate_plan_hash(roadmap_plan)
        }
        
        response = sb.table("roadmaps").insert(db_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save generated roadmap")
            
        # 4. Deduct credit
        sb.table("profiles").update({"roadmap_credits": credits - 1}).eq("email", email).execute()
        
        # 5. Background task to extract skills
        if uid:
            background_tasks.add_task(extract_skills_from_roadmap, response.data[0]["id"], uid)

        return RoadmapRead(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Roadmap generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@router.post("/roadmaps/save-external", response_model=RoadmapRead)
@monitor_query(query_type="save_external_roadmap", table="roadmaps")
async def save_external_roadmap(
    roadmap_create: ExternalRoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Save a roadmap generated externally (e.g., via OpenRouter on frontend)."""
    email = current_user.email
    uid = current_user.supabase_uid
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    roadmap_plan = roadmap_create.roadmap_plan
    
    # 1. Add IDs and YouTube Videos
    for i, module in enumerate(roadmap_plan.get("modules", [])):
        module["id"] = f"module_{i+1}"
        if not module.get("outcome"):
             module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
        for t_idx, topic in enumerate(module.get("topics", [])):
            topic["id"] = f"topic_{i+1}_{t_idx+1}"
            topic["uuid"] = str(uuid.uuid4())
            for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                subtopic["id"] = str(uuid.uuid4())
            
            # YouTube Enrichment
            if settings.YOUTUBE_API_KEY:
                try:
                    search_query = f"{roadmap_create.subject} {topic['title']} tutorial"
                    results = await search_youtube_videos(search_query, max_results=1)
                    if results:
                        topic["youtube_video_id"] = results[0]["video_id"]
                        topic["youtube_video_title"] = results[0]["video_title"]
                        topic["duration"] = results[0]["duration_minutes"]
                    # Throttle a bit
                    await asyncio.sleep(0.1)
                except Exception as yt_err:
                    logger.error(f"YouTube enrichment failed for topic {topic['title']}: {yt_err}")

    # 2. Save to DB
    slug = await _generate_unique_slug(roadmap_plan.get("title", roadmap_create.subject), email, sb)
    
    db_data = {
        "title": roadmap_plan.get("title", roadmap_create.subject),
        "description": roadmap_plan.get("description", "A custom generated learning path."),
        "roadmap_plan": roadmap_plan,
        "subject": roadmap_create.subject,
        "goal": roadmap_create.goal,
        "time_value": roadmap_create.time_value,
        "time_unit": roadmap_create.time_unit,
        "model": roadmap_create.model,
        "email": email,
        "slug": slug,
        "status": "active",
        "version": 1,
        "snapshot_hash": _generate_plan_hash(roadmap_plan)
    }
    
    try:
        response = sb.table("roadmaps").insert(db_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save external roadmap")
            
        # 3. Background task to extract skills
        if uid:
            background_tasks.add_task(extract_skills_from_roadmap, response.data[0]["id"], uid)

        return RoadmapRead(**response.data[0])
    except Exception as e:
        logger.error(f"External Roadmap save failed: {e}")
        raise HTTPException(status_code=500, detail=f"Save error: {str(e)}")

@router.post("/roadmaps/generate-from-jd", response_model=RoadmapRead)
@monitor_query(query_type="generate_from_jd", table="roadmaps")
async def generate_from_jd(
    payload: JobRoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Job Decoded: Generate a roadmap from a Job Description."""
    email = current_user.email
    uid = current_user.supabase_uid
    if not email:
        raise HTTPException(status_code=401, detail="Could not determine user email")

    sb = get_supabase_client()
    profile_res = sb.table("profiles").select("roadmap_credits, is_pro").eq("email", email).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    is_pro = profile_res.data[0].get("is_pro", False)
    credits = profile_res.data[0].get("roadmap_credits", 0)
    
    if credits < 1:
        if is_pro:
            raise HTTPException(status_code=402, detail="You have run out of roadmap credits. Please top up to continue.")
        else:
            raise HTTPException(status_code=402, detail="No roadmap credits left. Please upgrade to Pro.")

    # Validate Duration Constraints
    allowed_weeks_pro = [2, 3, 4, 6, 10, 12]
    if not is_pro:
        if payload.time_value > 4:
            raise HTTPException(status_code=403, detail="Free users are limited to a maximum of 4 weeks.")
    else:
        if payload.time_value not in allowed_weeks_pro:
             # If not in the list, we cap it or pick the nearest? Let's be strict for now.
             raise HTTPException(status_code=400, detail=f"Invalid duration. Pro users can select: {allowed_weeks_pro} weeks.")

    generation_strategy = f"""
**STRATEGY:**
Generate a comprehensive technical learning path for this role over {payload.time_value} weeks.
Analyze the user's current experience against the Job Description and identify precise technical gaps.
The roadmap must bridge these gaps with rigorous modules that lead to demonstrable mastery.
"""

    prompt = f"""
You are a technical lead.
Your task is to convert a Job Description into a rigorous learning roadmap.

**JOB DESCRIPTION:**
{payload.job_description}

**USER'S CURRENT EXPERIENCE:**
{payload.current_experience}

**CONSTRAINTS:**
Duration: {payload.time_value} {payload.time_unit}.
{generation_strategy}

**RULES:**
1. **Logical Progression:** Structure modules from foundational technical gaps to advanced implementation.
2. **Technical Rigor:** Prioritize hard skills, tools, and theoretical knowledge required for the role.
3. **Specific Topics:** Each module must have 3-5 specific topics. Avoid generic titles like "Introduction to X". Use industry-standard technical terms (e.g., "Memory-Mapped I/O" or "Asynchronous Event Loops").
4. **Practical Outcomes:** The `proof_of_work_instructions` must describe a realistic technical task or project that demonstrates competency in that module's specific skills.
5. **Applied Knowledge:** Ensure the user learns not just what a tool is, but how to apply it to solve role-specific problems.
6. **Conciseness:** Roadmap description must be max 2 sentences. Each module 'outcome' must be max 1 sentence.
7. **Output JSON ONLY** matching this schema:
   {{
     "title": "string", (e.g., Senior Analyst @ Goldman Sachs or Lead Designer @ Nike)
     "description": "Concise analysis of the chosen learning strategy (max 2 sentences).",
     "modules": [
       {{
         "title": "string",
         "outcome": "One punchy sentence on the specific technical competency achieved.",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {{
            "what_to_build": "string",
            "what_counts_as_evidence": "string",
            "eval_criteria": ["string", "string"]
         }},
         "topics": [
           {{ "title": "string", "subtopics": [ {{ "title": "string" }} ] }}
         ],
         "resources": [
            {{ "title": "string", "url": "string", "type": "docs|article" }}
         ]
       }}
     ]
   }}
"""

    try:
        model_to_use = settings.GEMINI_MODEL
        if is_pro:
            model_to_use = "models/gemini-2.5-pro"
            
        generated_text = await generate_text(prompt, model=model_to_use, response_mime_type="application/json")
        roadmap_plan = robust_json_loads(generated_text)

        # Enrichment logic (IDs, YouTube) - Shared with standard generator
        for i, module in enumerate(roadmap_plan.get("modules", [])):
            module["id"] = f"module_{i+1}"
            if not module.get("outcome"):
                 module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
            
            for t_idx, topic in enumerate(module.get("topics", [])):
                topic["id"] = f"topic_{i+1}_{t_idx+1}"
                topic["uuid"] = str(uuid.uuid4())
                for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                    subtopic["id"] = str(uuid.uuid4())
                
                if settings.YOUTUBE_API_KEY:
                    try:
                        # Clean search query: Field/Role + Topic for high signal
                        clean_title = roadmap_plan['title'].replace("Job Decoded: ", "").split("@")[0].strip()
                        search_query = f"{clean_title} {topic['title']} tutorial"
                        results = await search_youtube_videos(search_query, max_results=1)
                        if results:
                            topic["youtube_video_id"] = results[0]["video_id"]
                            topic["youtube_video_title"] = results[0]["video_title"]
                            topic["duration"] = results[0]["duration_minutes"]
                        await asyncio.sleep(0.1)
                    except: pass

        slug = await _generate_unique_slug(roadmap_plan["title"], email, sb)
        
        db_data = {
            "title": roadmap_plan["title"],
            "description": roadmap_plan["description"],
            "roadmap_plan": roadmap_plan,
            "subject": f"JD: {roadmap_plan['title']}",
            "goal": "Job Readiness",
            "time_value": payload.time_value,
            "time_unit": payload.time_unit,
            "model": model_to_use,
            "email": email,
            "slug": slug,
            "status": "active",
            "version": 1,
            "snapshot_hash": _generate_plan_hash(roadmap_plan)
        }
        
        response = sb.table("roadmaps").insert(db_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save roadmap")
            
        sb.table("profiles").update({"roadmap_credits": credits - 1}).eq("email", email).execute()
        
        if uid:
            background_tasks.add_task(extract_skills_from_roadmap, response.data[0]["id"], uid)

        return RoadmapRead(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job Decoded generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_unique_slug(title: str, email: str, sb) -> str:
    base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    
    # Check if this user already has this slug
    existing = sb.table("roadmaps").select("id").eq("email", email).eq("slug", base_slug).execute()
    if not existing.data:
        return base_slug
        
    # If exists, append random suffix
    return f"{base_slug}-{uuid.uuid4().hex[:6]}"


@router.post("/roadmaps/{roadmap_id}/progress")
async def update_learning_progress(
    roadmap_id: int, 
    update: ProgressUpdate, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Mark a topic as completed and update last position."""
    email = current_user.email
    uid = current_user.supabase_uid
    sb = get_supabase_client()
    
    # 1. Update module_progress table
    if update.completed:
        # Check if already exists to avoid unique constraint error
        check = sb.table("module_progress").select("id").eq("roadmap_id", roadmap_id).eq("user_email", email).eq("module_number", update.module_number).eq("topic_index", update.topic_index).execute()
        
        if not check.data:
            sb.table("module_progress").insert({
                "roadmap_id": roadmap_id,
                "user_email": email,
                "module_number": update.module_number,
                "topic_index": update.topic_index,
                "completed": True,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }).execute()
            
            # Track activity for streaks in background
            background_tasks.add_task(track_activity, email)
    else:
        sb.table("module_progress").delete().eq("roadmap_id", roadmap_id).eq("user_email", email).eq("module_number", update.module_number).eq("topic_index", update.topic_index).execute()

    # 2. Update last_position in roadmaps table if owner
    roadmap_res = sb.table("roadmaps").select("email").eq("id", roadmap_id).execute()
    if roadmap_res.data and roadmap_res.data[0]["email"].lower() == email.lower():
        sb.table("roadmaps").update({
            "last_position": {"mIdx": update.module_number - 1, "tIdx": update.topic_index}
        }).eq("id", roadmap_id).execute()

    # 3. Recalculate skill scores in background
    if uid:
        background_tasks.add_task(calculate_user_skill_scores_for_roadmap, roadmap_id, uid)

    return {"status": "ok"}


@router.get("/roadmaps/{roadmap_id}/progress")
async def get_roadmap_progress(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Get all completed topics for this roadmap for the current user."""
    sb = get_supabase_client()
    res = sb.table("module_progress").select("module_number, topic_index").eq("roadmap_id", roadmap_id).eq("user_email", current_user.email).eq("completed", True).execute()
    return {"completed_topics": res.data}


@router.post("/roadmaps/{roadmap_id}/progress/reset")
async def reset_learning_progress(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Reset position and all topic completions for this roadmap."""
    email = current_user.email
    sb = get_supabase_client()
    
    # Verify ownership or public access
    r_res = sb.table("roadmaps").select("email, is_public").eq("id", roadmap_id).execute()
    if not r_res.data or len(r_res.data) == 0:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap_data = r_res.data[0]
    roadmap_owner_email = roadmap_data.get("email") or ""
    is_public = roadmap_data.get("is_public", False)
    is_owner = roadmap_owner_email.lower() == email.lower()

    if not is_owner and not is_public:
        raise HTTPException(status_code=403, detail="Not authorized")

    if is_owner:
        # 1. Reset position in roadmaps
        sb.table("roadmaps").update({
            "last_position": {"mIdx": 0, "tIdx": 0}
        }).eq("id", roadmap_id).execute()

    # 3. Clear module_progress for this user for this roadmap (always done if we allowed them in)
    sb.table("module_progress").delete().eq("roadmap_id", roadmap_id).eq("user_email", email).execute()
    return {"status": "ok"}


@router.post("/roadmaps/{roadmap_id}/delete-extension", response_model=RoadmapRead)
async def delete_roadmap_extension(
    roadmap_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete the last extended module from a roadmap."""
    email = current_user.email
    sb = get_supabase_client()

    # 1. Fetch Roadmap
    r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
    if not r_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    roadmap = r_res.data[0]
    
    if roadmap.get("email", "").lower() != email.lower():
        raise HTTPException(status_code=403, detail="Not authorized to modify this roadmap")

    # 2. Check if there are extensions to delete
    plan = _parse_roadmap_dict(roadmap.get("roadmap_plan", {}))
    modules = plan.get("modules", [])
    if not modules:
        raise HTTPException(status_code=400, detail="No modules found in this roadmap.")

    last_module = modules[-1]
    if not last_module.get("is_extension"):
        raise HTTPException(status_code=400, detail="The last module is not an extension and cannot be deleted.")

    # 3. Perform Deletion
    # Remove the last module
    modules.pop()
    plan["modules"] = modules
    
    # Decrement extension_count and update time_value
    current_ext_count = roadmap.get("extension_count", 0)
    new_ext_count = max(0, (current_ext_count or 1) - 1)
    current_version = roadmap.get("version", 1) or 1
    
    update_res = sb.table("roadmaps").update({
        "roadmap_plan": plan,
        "extension_count": new_ext_count,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "version": current_version + 1,
        "snapshot_hash": _generate_plan_hash(plan)
    }).eq("id", roadmap_id).execute()

    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update roadmap after extension deletion.")

    return RoadmapRead(**update_res.data[0])


@router.patch("/roadmaps/{roadmap_id}/status")
async def update_roadmap_status(
    roadmap_id: int,
    payload: RoadmapStatusUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Update the status of a roadmap (active, completed, archived, quit)."""
    email = current_user.email
    uid = current_user.supabase_uid
    sb = get_supabase_client()
    
    # 1. Verify ownership (Synchronous check before background task)
    r_res = sb.table("roadmaps").select("email").eq("id", roadmap_id).execute()
    if not r_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    if r_res.data[0].get("email", "").lower() != email.lower():
        raise HTTPException(status_code=403, detail="Not authorized to update this roadmap status")

    # 2. Trigger transition with side effects
    background_tasks.add_task(transition_roadmap_status, roadmap_id, payload.status, email, uid)
    
    return {"status": "ok", "new_status": payload.status}


@router.delete("/roadmaps/{roadmap_id}")
async def delete_roadmap(roadmap_id: int, current_user: User = Depends(get_current_user)):
    """Delete a roadmap (only the owner can delete)."""
    email = current_user.email
    sb = get_supabase_client()
    
    # Verify roadmap exists and user owns it
    try:
        r_res = sb.table("roadmaps").select("*").eq("id", roadmap_id).execute()
        if not r_res.data or len(r_res.data) == 0:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        
        roadmap = r_res.data[0]
        if roadmap.get("email", "").lower() != email.lower():
            raise HTTPException(status_code=403, detail="Not authorized to delete this roadmap")
        
        # 1. Cleanup technical identity (recalculate/delete skills) before the cascade wipes the data
        if current_user.supabase_uid:
            await cleanup_skills_after_roadmap_deletion(roadmap_id, current_user.supabase_uid)

        # 2. Delete roadmap (cascade will delete submissions, module_progress, personal_notes)
        sb.table("roadmaps").delete().eq("id", roadmap_id).execute()
        
        return {"status": "ok", "message": "Roadmap deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete roadmap")

from app.routers.roadmaps import _generate_unique_slug
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



from fastapi import APIRouter, HTTPException, Request, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import RoadmapCreate, RoadmapMe, RoadmapRead, RoadmapSave, User, ProgressUpdate, RoadmapExtend, RoadmapStatusUpdate, ManualBuildRequest, JobRoadmapCreate, ExternalRoadmapCreate, SyncSkillsRequest, UrlRoadmapCreate, SyllabusRoadmapCreate, SkillGapRoadmapCreate, DiagnosticQuizCreate, DiagnosticQuizEvaluate, UnlockModuleRequest
from app.utils.ai_client import generate_text, generate_text_stream, clean_json_string, robust_json_loads, log_backend_ai_usage
from app.utils.resend_client import send_onboarding_email
from app.utils.youtube_client import search_youtube_videos, find_module_playlist, match_playlist_video_to_topic
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.utils.streaks import track_activity
from app.core.auth import get_current_user
from app.routers.certificates import generate_and_store_certificate
from app.routers.optional_auth import get_optional_current_user
from app.services.skills_service import extract_skills_from_roadmap, calculate_user_skill_scores_for_roadmap, cleanup_skills_after_roadmap_deletion, process_extracted_skills
from app.routers.payments import check_and_revoke_pro_if_no_credits

from app.database.monitor import monitor_query

logger = logging.getLogger(__name__)
router = APIRouter(tags=['roadmaps-generate'])

def extract_core_subject(title: str) -> str:
    """Extract a concise subject from a potentially long generated title for search queries."""
    fluff_patterns = [
        r"(?i)^the complete guide to\s+",
        r"(?i)^mastering\s+",
        r"(?i)^advanced\s+",
        r"(?i)^basics of\s+",
        r"(?i)^introduction to\s+",
        r"(?i)^become a\s+",
        r"(?i)^how to become an?\s+",
        r"(?i)^comprehensive guide to\s+"
    ]
    core = title
    for p in fluff_patterns:
        core = re.sub(p, "", core)
    
    # Take up to the first colon or dash
    core = re.split(r'[:\-]', core)[0].strip()
    
    words = core.split()
    if len(words) > 4:
        core = " ".join(words[:4])
        
    return core

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
                    
            # C. Generate Certificate if User is Pro
            if user_uid:
                try:
                    prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", user_uid).single().execute()
                    if prof_res.data and prof_res.data.get("is_pro"):
                        # Run the sync function in a threadpool to avoid blocking the event loop
                        asyncio.create_task(asyncio.to_thread(generate_and_store_certificate, user_uid, roadmap_id))
                except Exception as e:
                    logger.error(f"Certificate generation trigger failed: {e}")

    except Exception as e:
        logger.error(f"Failed to transition roadmap status for {roadmap_id}: {e}")

def _parse_roadmap_dict(roadmap_val: Any) -> Dict[str, Any]:
    parsed = {}
    if isinstance(roadmap_val, str):
        try:
            parsed = json.loads(roadmap_val)
        except json.JSONDecodeError:
            pass
    elif isinstance(roadmap_val, dict):
        # Create a shallow copy so we don't accidentally modify an in-memory dict
        parsed = roadmap_val.copy()
        
    if "modules" in parsed and isinstance(parsed["modules"], list):
        parsed["modules"] = [m for m in parsed["modules"] if isinstance(m, dict)]
        
    return parsed

def _generate_plan_hash(plan: Dict[str, Any]) -> str:
    """Generate a stable hash for a roadmap plan."""
    plan_str = json.dumps(plan, sort_keys=True)
    return hashlib.sha256(plan_str.encode()).hexdigest()

async def _enrich_roadmap_progress(roadmaps: List[Dict], email: str, uid: str, sb, background_tasks: Optional[BackgroundTasks] = None):
    if not email or not uid:
        return roadmaps

    # Fetch data in bulk in parallel using threads
    import asyncio
    
    roadmap_ids = [r["id"] for r in roadmaps]
    if not roadmap_ids:
        return roadmaps
    
    def fetch_mp():
        return sb.table("module_progress").select("roadmap_id, module_number, topic_index, completed").eq("user_email", email).in_("roadmap_id", roadmap_ids).eq("completed", True).execute()
        
    def fetch_sub():
        return sb.table("submissions").select("roadmap_id, module_number, evaluation_level").eq("user_email", email).in_("roadmap_id", roadmap_ids).order("submitted_at", desc=True).execute()
        
    def fetch_ps():
        return sb.table("practice_sessions").select("id, roadmap_id, resources").eq("user_id", uid).in_("roadmap_id", roadmap_ids).execute()
        
    def fetch_pp():
        return sb.table("practice_progress").select("session_id, resource_id, completed").eq("user_id", uid).eq("completed", True).execute()
        
    def fetch_mcq():
        return sb.table("mcq_sessions").select("id, roadmap_id, subtopic_id").eq("user_id", uid).eq("status", "completed").in_("roadmap_id", roadmap_ids).execute()

    mp_res, sub_res, ps_res, pp_res, mcq_res = await asyncio.gather(
        asyncio.to_thread(fetch_mp),
        asyncio.to_thread(fetch_sub),
        asyncio.to_thread(fetch_ps),
        asyncio.to_thread(fetch_pp),
        asyncio.to_thread(fetch_mcq)
    )

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

    mcq_map = {} # roadmap_id -> list of sessions
    for mcq in mcq_res.data:
        rid = mcq["roadmap_id"]
        if rid not in mcq_map: mcq_map[rid] = []
        mcq_map[rid].append(mcq)

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
        completed_practice_sessions = 0

        # Calculate scores per module
        valid_modules = [m for m in modules if isinstance(m, dict)]
        for m_idx, module in enumerate(valid_modules):
            m_num = m_idx + 1
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
            
            # 3. Practice Score — count fully completed sessions
            m_sessions = [ps for ps in ps_map.get(rid, []) if any(str(topic.get("uuid")) == str(ps.get("subtopic_id")) for topic in m_topics)]
            m_completed_practice = 0
            for ps in m_sessions:
                resources = ps.get("resources", [])
                if not resources:
                    continue
                all_done = all(
                    (str(ps["id"]), str(res["id"])) in pp_set
                    for res in resources
                )
                if all_done:
                    m_completed_practice += 1
                    
            m_mcqs = [mcq for mcq in mcq_map.get(rid, []) if any(str(topic.get("uuid")) == str(mcq.get("subtopic_id")) for topic in m_topics)]
            m_completed_practice += len(m_mcqs)

            if m_completed_practice > 0:
                completed_practice_sessions += 1

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
        # Practice: one completed session per module
        min_expected_sessions = total_modules
        pow_weight = (completed_subs_all / total_subs_all) * 40 if total_subs_all > 0 else 0
        topic_weight = (completed_topics_all / total_topics_all) * 30 if total_topics_all > 0 else 0
        practice_weight = min(1.0, completed_practice_sessions / min_expected_sessions) * 30 if min_expected_sessions > 0 else 0
        
        percent = round(pow_weight + topic_weight + practice_weight)

        # Final Completion Check
        if percent >= 98 and roadmap_status not in ["resubmit_required", "needs_improvement"]:
            if db_status == "active":
                roadmap_status = "completed"
                # Persist completion status to DB in background
                if background_tasks:
                    background_tasks.add_task(transition_roadmap_status, rid, "completed", email, uid)
            
            # Note: Skill extraction is now handled inside transition_roadmap_status if it's the first time
            # However, if it was ALREADY completed but skills haven't been extracted, we still want this trigger:
            elif background_tasks and uid and (not r.get("skills_extracted") or r.get("skills_extraction_error")):
                background_tasks.add_task(extract_skills_from_roadmap, rid, uid)
            
            # Idempotently trigger certificate generation in case it failed previously
            if background_tasks and uid:
                try:
                    prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", uid).single().execute()
                    if prof_res.data and prof_res.data.get("is_pro"):
                        background_tasks.add_task(generate_and_store_certificate, uid, rid)
                except Exception as e:
                    logger.error(f"Failed to queue certificate generation: {e}")
            
        r["calculated_progress"] = {
            "percent": percent,
            "completed_topics": completed_topics_all,
            "total_topics": total_topics_all,
            "completed_submissions": completed_subs_all,
            "total_submissions": total_subs_all,
            "completed_practice_sessions": completed_practice_sessions,
            "required_practice_sessions": min_expected_sessions,
            "bottleneck_module": bottleneck_module
        }
        # If DB status is terminal (archived, quit), keep it. 
        # Otherwise use calculated (active, completed, resubmit_required, etc.)
        if db_status in ["archived", "quit", "completed"]:
            r["calculated_status"] = db_status
        else:
            r["calculated_status"] = roadmap_status
    
    return roadmaps



@router.post("/roadmaps/generate")
@monitor_query(query_type="generate_roadmap", table="roadmaps")

async def generate_roadmap(
    roadmap_create: RoadmapCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    async def event_generator():
        yield json.dumps({"status": "Firing up the engine... 🚀"}) + "\n"
    
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
        if roadmap_create.diagnostic_prompt_context:
            context_str += f"\n\n{roadmap_create.diagnostic_prompt_context}"
    
        prompt = f"""
You are a master educator and curriculum designer. Your job is to build a structured learning course that genuinely teaches a beginner.

Subject: "{roadmap_create.subject}"
Learner's goal: "{roadmap_create.goal}"
{context_str}
Estimated duration: {roadmap_create.time_value} {roadmap_create.time_unit}.

**Pedagogical Principles (MUST follow):**
1. **Teach, don't list.** Every topic must be a genuine teachable unit — something a student can sit down and learn from a video or tutorial. NOT a label like "Advanced Concepts" or "Deep Dive". Ask: "Can I find a 10-minute YouTube video explaining exactly this?" If yes, it's a good topic. If no, split it further.
2. **Build up from zero.** Structure modules in a strict dependency order. Earlier modules must not assume knowledge that comes later. A beginner reading module 1 should be able to follow it without googling anything from module 2+.
3. **One concept per topic:** Each topic title must name ONE specific, focused concept cleanly as a natural chapter heading. Do NOT start topic titles with "How" or "How to". Broad topic titles produce useless YouTube searches.
4. **Practical outcomes.** Every module ends with a concrete task the learner must build or do — not a reflection exercise.
5. **No fluff modules.** Do not create a "Introduction to the Course" or "What We'll Learn" module. Every module must teach real content.

**Formatting Rules:**
6. **Short, Clean Title:** The roadmap "title" must be concise and direct (3 to 6 words maximum). NEVER use dramatic colon subtitles. NEVER use marketing buzzwords like "Mastery", "Lightning-Fast", "Chaos to Clarity", or "Supercharged". Do NOT include the time duration in the title.
7. **SEO-Friendly Description:** One punchy, clear sentence. Not a paragraph.
8. **Just-In-Time Milestone Architecture:** 
   - Generate exactly {roadmap_create.time_value} milestone module(s) for a '{roadmap_create.time_value} {roadmap_create.time_unit}' course.
   - **CRITICAL: ONLY MODULE 1 is detailed at this initial stage.** Provide 4-5 concrete, teachable topics, subtopics, and 2-3 reading resources for Module 1.
   - **Modules 2 through {roadmap_create.time_value} (the future milestones):** Provide ONLY the milestone "title", "timeline", "outcome", and "workspace_type". For these later modules, set "topics": [] and "recommended_resources": []. Do NOT generate detailed topics or video queries for later modules upfront—they will adaptively unfold as the learner advances.
9. **Module 1 Topics:** 4-5 focused topics for Module 1 only.
10. **Output JSON ONLY** matching this schema:
   {{
     "title": "string",
     "description": "string",
     "modules": [
       {{
         "title": "string",
         "outcome": "string starting with: By the end of this module you will be able to...",
         "timeline": "string",
         "workspace_type": "code|research|design",
         "proof_of_work_instructions": {{
            "what_to_build": "string (Max 1 line, concrete and specific)",
            "what_counts_as_evidence": "string (Max 1 line, specific and verifiable)",
            "eval_criteria": ["string", "string"]
         }},
         "recommended_resources": [
            {{
              "title": "string (A specific TEXT-BASED technical reading resource: documentation, notes, or textbook chapter)",
              "search_query": "string (search query for the resource)"
            }}
          ],
         "topics": [
             {{
               "title": "string (ONE focused concept in Module 1)",
               "youtube_search_query": "A precise 3-6 word search query describing ONLY the exact technical topic and subject (e.g. 'Python variables data types', 'Python basic operators')",
               "subtopics": [ {{ "title": "string" }} ]
             }}
          ]
       }}
     ]
   }}
11. **Workspace Selection:**
   - "code" for implementation, algorithms, scripting
   - "design" for system architecture, distributed systems, infrastructure, UI/UX
   - "research" for theoretical science, mathematics, technical writing
"""
        try:
            model_to_use = roadmap_create.model or settings.DEFAULT_ROADMAP_MODEL
            yield json.dumps({"status": "Structuring learning path..."}) + "\n"
            generated_text, usage = await generate_text(prompt, model=model_to_use, response_mime_type="application/json", return_usage=True)
            log_backend_ai_usage(sb, uid, f"{roadmap_create.subject} (Cost: 1.0 Credits)", usage, source="backend")
            roadmap_plan = robust_json_loads(generated_text)
    
            yield json.dumps({"status": "Curating Module 1 lessons..."}) + "\n"
            # 2. Add IDs, lock states, and curate ONLY Module 1
            used_video_ids = set()
            for i, module in enumerate(roadmap_plan.get("modules", [])):
                if not isinstance(module, dict): continue
                module["id"] = f"module_{i+1}"
                module["locked"] = (i > 0)
                if not module.get("outcome"):
                     module["outcome"] = "By the end of this module you will be able to apply the listed topics and solve basic related problems."
                
                for t_idx, topic in enumerate(module.get("topics", [])):
                    if not isinstance(topic, dict): continue
                    topic["id"] = f"topic_{i+1}_{t_idx+1}"
                    topic["uuid"] = str(uuid.uuid4())
                    for s_idx, subtopic in enumerate(topic.get("subtopics", [])):
                        if not isinstance(subtopic, dict): continue
                        subtopic["id"] = str(uuid.uuid4())

                # ONLY curate resources for Module 1 at initial creation!
                if i == 0:
                    for t_idx, topic in enumerate(module.get("topics", [])):
                        topic_title = topic.get("title", "")
                        if topic_title:
                            yield json.dumps({"status": f"Matching lesson: {topic_title}..."}) + "\n"

                        # YouTube Enrichment for Module 1
                        if settings.YOUTUBE_API_KEY:
                            try:
                                core_subj = extract_core_subject(roadmap_plan.get("title", roadmap_create.subject))
                                raw_query = topic.get("youtube_search_query") or f"{topic['title']}"
                                if core_subj and core_subj.lower() not in raw_query.lower():
                                    search_query = f"{core_subj} {raw_query}"
                                else:
                                    search_query = raw_query

                                results = await search_youtube_videos(
                                    search_query,
                                    max_results=3,
                                    topic_title=topic['title'],
                                    strict_official_sources=getattr(roadmap_create, 'strict_official_sources', False),
                                    subject_context=core_subj or roadmap_plan.get("title", ""),
                                    exclude_video_ids=used_video_ids
                                )
                                for result in results:
                                    if result["video_id"] not in used_video_ids:
                                        topic["youtube_video_id"] = result["video_id"]
                                        topic["youtube_video_title"] = result["video_title"]
                                        topic["duration"] = result["duration_minutes"]
                                        used_video_ids.add(result["video_id"])
                                        break
                                await asyncio.sleep(0.1)
                            except Exception as yt_err:
                                logger.error(f"YouTube enrichment failed for topic {topic['title']}: {yt_err}")
        
                    yield json.dumps({"status": "Finding reading notes for Module 1..."}) + "\n"
                    recommended = module.get("recommended_resources", [])
                    if recommended:
                        def fetch_ddg():
                            found = []
                            try:
                                from ddgs import DDGS
                                with DDGS() as ddgs:
                                    for rec in recommended[:3]:
                                        if isinstance(rec, dict):
                                            search_q = rec.get("search_query", rec.get("title", ""))
                                            display_title = rec.get("title", search_q)
                                        else:
                                            search_q = str(rec)
                                            display_title = str(rec)
                                        
                                        clean_search_q = f"{search_q} -site:youtube.com -site:youtu.be -site:vimeo.com -site:tiktok.com -site:dailymotion.com"
                                        results = list(ddgs.text(clean_search_q, max_results=3))
                                        
                                        valid_result = None
                                        for res in results:
                                            href = res.get("href", "").lower()
                                            if not any(v in href for v in ["youtube.com", "youtu.be", "vimeo.com", "tiktok.com", "dailymotion.com"]):
                                                valid_result = res
                                                break

                                        if valid_result:
                                            res_url = valid_result["href"]
                                            res_type = "pdf" if res_url.lower().endswith(".pdf") else "article"
                                            found.append({
                                                "title": display_title,
                                                "url": res_url,
                                                "type": res_type
                                            })
                            except Exception as e:
                                logger.error(f"DDG search failed for Module 1 resources: {e}")
                            return found
                        
                        ddg_results = await asyncio.to_thread(fetch_ddg)
                        module["resources"] = ddg_results
                else:
                    # Later modules have no resources pre-fetched yet
                    module["resources"] = []
    
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
            new_credits = credits - 1
            sb.table("profiles").update({"roadmap_credits": new_credits}).eq("email", email).execute()
            if new_credits <= 0:
                await check_and_revoke_pro_if_no_credits(email, sb)
            
            # 5. Background task to extract skills
            if uid:
                background_tasks.add_task(extract_skills_from_roadmap, response.data[0]["id"], uid)
    
            yield json.dumps({"result": RoadmapRead(**response.data[0]).model_dump()}) + "\n"
            return
    
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Roadmap generation failed: {e}")
            yield json.dumps({"error": f"AI Engine Error: {str(e)}. Please try again."}) + "\n"
            return
    
    
    
    
        
    return StreamingResponse(event_generator(), media_type="application/x-ndjson")


@router.post("/roadmaps/unlock-module")
async def unlock_module(
    req: UnlockModuleRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Adaptive Just-In-Time Module Unlocking.
    Gathers user's past module performance (checkpoints, submissions, quizzes)
    and uses the free OpenRouter waterfall cascade to synthesize 4-5 focused topics for the next milestone.
    Streams real-time generation and curation status chunks via NDJSON.
    """
    async def event_stream():
        yield json.dumps({"status": "Analyzing your performance and progress... 📊"}) + "\n"

        email = current_user.email
        uid = current_user.supabase_uid
        if not email:
            yield json.dumps({"error": "Unauthorized user session"}) + "\n"
            return

        sb = get_supabase_client()

        # 1. Fetch roadmap
        r_res = sb.table("roadmaps").select("*").eq("id", req.roadmap_id).execute()
        if not r_res.data:
            yield json.dumps({"error": "Roadmap not found"}) + "\n"
            return

        roadmap = r_res.data[0]
        plan = _parse_roadmap_dict(roadmap.get("roadmap_plan", {}))
        modules = plan.get("modules", [])

        target_m_idx = req.target_module_number - 1
        if target_m_idx < 0 or target_m_idx >= len(modules):
            yield json.dumps({"error": f"Invalid module number {req.target_module_number}"}) + "\n"
            return

        target_module = modules[target_m_idx]
        prev_m_idx = target_m_idx - 1
        prev_module = modules[prev_m_idx] if prev_m_idx >= 0 else None

        # 2. Gather learner performance from previous module
        checkpoint_summary = "No checkpoint history recorded."
        submission_summary = "No homework submission yet."

        try:
            # Checkpoint attempts
            cp_res = sb.table("topic_checkpoints").select("topic_title, archetype, is_correct, attempts_count, difficulty_level").eq("roadmap_id", req.roadmap_id).eq("user_id", uid).execute()
            if cp_res.data:
                total_cp = len(cp_res.data)
                correct_first = sum(1 for c in cp_res.data if c.get("is_correct") and c.get("attempts_count", 1) <= 1)
                struggled_topics = [c.get("topic_title") for c in cp_res.data if not c.get("is_correct") or c.get("attempts_count", 1) > 1]
                
                checkpoint_summary = f"Passed {correct_first}/{total_cp} concept checks on first try."
                if struggled_topics:
                    checkpoint_summary += f" Encountered friction or needed remedial review on: {', '.join(struggled_topics[:3])}."
                else:
                    checkpoint_summary += " Demonstrated swift mastery on all concept checkpoints."

            # Submissions for previous module
            if prev_module:
                sub_res = sb.table("submissions").select("evaluation_level, evaluation_feedback").eq("roadmap_id", req.roadmap_id).eq("module_number", prev_m_idx + 1).order("submitted_at", desc=True).limit(1).execute()
                if sub_res.data:
                    ev = sub_res.data[0]
                    submission_summary = f"Evaluation Level: {ev.get('evaluation_level', 'Developing')}. Feedback: {ev.get('evaluation_feedback', '')[:200]}"
        except Exception as data_err:
            logger.warning(f"Could not load full performance metrics for module unlock: {data_err}")

        # Extract topics already covered in prior modules to prevent repetition and build progression
        covered_topics_summary = []
        for p_idx in range(target_m_idx):
            mod = modules[p_idx]
            mod_title = mod.get("title", f"Module {p_idx + 1}")
            top_titles = [t.get("title") for t in mod.get("topics", []) if isinstance(t, dict) and t.get("title")]
            if top_titles:
                covered_topics_summary.append(f"- {mod_title}: {', '.join(top_titles)}")
            else:
                covered_topics_summary.append(f"- {mod_title}")
        covered_topics_str = "\n".join(covered_topics_summary) if covered_topics_summary else "None (Module 1)"

        # 3. Formulate Master Educator Prompt
        prompt = f"""You are a master educator and curriculum designer.
The learner has completed Module {req.target_module_number - 1} and is now ready to unlock Module {req.target_module_number}.

Course Subject: "{roadmap.get('subject') or roadmap.get('title')}"
Learner's Ultimate Goal: "{roadmap.get('goal', 'Master this subject')}"

Topics Already Covered in Previous Modules (DO NOT duplicate these; build directly upon them):
{covered_topics_str}

Learner Performance in Previous Module:
- Checkpoints: {checkpoint_summary}
- Proof of Work Homework: {submission_summary}

Upcoming Module to Populate:
- Milestone Title: "{target_module.get('title', f'Module {req.target_module_number}')}"
- Target Outcome: "{target_module.get('outcome', '')}"
- Workspace Type: "{target_module.get('workspace_type', 'code')}"

Pedagogical Principles (MUST follow):
1. **Teach, don't list.** Each topic must be a concrete, bite-sized teachable concept a learner can learn in 10-20 minutes.
2. **Zero duplication & logical progression:** Do NOT re-teach concepts covered in previous modules. Advance naturally to the next stage of the curriculum.
3. **One concept per topic:** Clean, focused natural chapter titles. Do NOT start titles with "How" or "How to".
4. **Adaptive bridge:** If the learner struggled in earlier topics, ensure the initial topic smoothly bridges the gap into this module's objectives.
5. **Generate 4 to 5 topics:** For each topic, provide a precise `youtube_search_query` (3-6 words, concise technical keywords) and 2-3 subtopics.
6. **Practical Homework Task:** Refine `proof_of_work_instructions` to give a specific, real-world task testing this module's topics.
7. **2-3 Text Resources:** Specific technical reading guides, official docs, or textbook chapter references.

Output JSON ONLY matching this exact schema:
{{
  "topics": [
    {{
      "title": "string (ONE focused concept)",
      "youtube_search_query": "3-6 word search query describing the technical topic",
      "subtopics": [ {{ "title": "string" }} ]
    }}
  ],
  "proof_of_work_instructions": {{
    "what_to_build": "string (Max 1 line, concrete and specific)",
    "what_counts_as_evidence": "string (Max 1 line, specific and verifiable)",
    "eval_criteria": ["string", "string"]
  }},
  "recommended_resources": [
    {{
      "title": "string (Text-based documentation or guide)",
      "search_query": "string (search query for the resource)"
    }}
  ]
}}"""

        # 4. Generate with OpenRouter/free and universal waterfall
        generated_json = None
        usage = None
        used_model = "openrouter/free"
        try:
            model_to_use = "openrouter/free"
            text_result, usage, used_model = await _call_openrouter(prompt, model=model_to_use, response_mime_type="application/json")
            generated_json = robust_json_loads(text_result)
        except Exception as e:
            logger.warning(f"OpenRouter primary unlock failed: {e}. Cascading through fallback providers...")
            try:
                text_result, usage = await generate_text(prompt, model="openrouter/free", response_mime_type="application/json", return_usage=True)
                generated_json = robust_json_loads(text_result)
            except Exception as fb_err:
                logger.error(f"Universal AI cascade failed for unlock module: {fb_err}")
                yield json.dumps({"error": f"AI Engine Error: {str(fb_err)}. Please try again."}) + "\n"
                return

        if uid and usage:
            if isinstance(usage, dict) and "model_name" not in usage:
                usage["model_name"] = used_model
            log_backend_ai_usage(
                sb,
                uid,
                f"Module {req.target_module_number} Unlock: {target_module.get('title', '')} (Cost: 0 Credits)",
                usage,
                source="backend"
            )

        if not generated_json or "topics" not in generated_json:
            yield json.dumps({"error": "Failed to synthesize module topics. Please retry."}) + "\n"
            return

        yield json.dumps({"status": f"Curating lessons for {target_module.get('title')}... 🎥"}) + "\n"

        # 5. Format topics and curate YouTube videos
        used_video_ids = set()
        # Collect already used video IDs across existing modules
        for mod in modules:
            for top in mod.get("topics", []):
                if isinstance(top, dict) and top.get("youtube_video_id"):
                    used_video_ids.add(top["youtube_video_id"])

        curated_topics = []
        raw_topics = generated_json.get("topics", [])
        core_subj = extract_core_subject(roadmap.get("title", roadmap.get("subject", "")))

        for t_idx, topic in enumerate(raw_topics):
            topic_title = topic.get("title", f"Topic {t_idx + 1}")
            subtopics = []
            for st in topic.get("subtopics", []):
                if isinstance(st, dict) and st.get("title"):
                    subtopics.append({"id": str(uuid.uuid4()), "title": st["title"]})
                elif isinstance(st, str):
                    subtopics.append({"id": str(uuid.uuid4()), "title": st})

            topic_item = {
                "id": f"topic_{req.target_module_number}_{t_idx + 1}",
                "uuid": str(uuid.uuid4()),
                "title": topic_title,
                "youtube_search_query": topic.get("youtube_search_query", topic_title),
                "subtopics": subtopics
            }

            yield json.dumps({"status": f"Matching lesson: {topic_title}..."}) + "\n"

            if settings.YOUTUBE_API_KEY:
                try:
                    raw_query = topic.get("youtube_search_query") or topic_title
                    if core_subj and core_subj.lower() not in raw_query.lower():
                        search_query = f"{core_subj} {raw_query}"
                    else:
                        search_query = raw_query

                    results = await search_youtube_videos(
                        search_query,
                        max_results=3,
                        topic_title=topic_title,
                        subject_context=core_subj,
                        exclude_video_ids=used_video_ids
                    )
                    for res in results:
                        if res["video_id"] not in used_video_ids:
                            topic_item["youtube_video_id"] = res["video_id"]
                            topic_item["youtube_video_title"] = res["video_title"]
                            topic_item["duration"] = res["duration_minutes"]
                            used_video_ids.add(res["video_id"])
                            break
                    await asyncio.sleep(0.05)
                except Exception as yt_err:
                    logger.warning(f"YouTube match error for '{topic_title}': {yt_err}")

            curated_topics.append(topic_item)

        yield json.dumps({"status": "Curating documentation and reference guides... 📖"}) + "\n"

        # 6. Technical reading resources search via DuckDuckGo
        rec_resources = generated_json.get("recommended_resources", [])
        reading_materials = []
        if rec_resources:
            def fetch_ddg_resources():
                found = []
                try:
                    from ddgs import DDGS
                    with DDGS() as ddgs:
                        for rec in rec_resources[:3]:
                            search_q = rec.get("search_query", rec.get("title", "")) if isinstance(rec, dict) else str(rec)
                            display_title = rec.get("title", search_q) if isinstance(rec, dict) else str(rec)
                            clean_q = f"{search_q} -site:youtube.com -site:youtu.be -site:vimeo.com -site:tiktok.com"
                            results = list(ddgs.text(clean_q, max_results=2))
                            for r in results:
                                href = r.get("href", "").lower()
                                if not any(v in href for v in ["youtube.com", "youtu.be", "vimeo.com"]):
                                    found.append({
                                        "title": display_title,
                                        "url": r["href"],
                                        "type": "pdf" if href.endswith(".pdf") else "article"
                                    })
                                    break
                except Exception as ddg_err:
                    logger.warning(f"DDG search error: {ddg_err}")
                return found

            reading_materials = await asyncio.to_thread(fetch_ddg_resources)

        # 7. Update module in roadmap_plan
        target_module["locked"] = False
        target_module["topics"] = curated_topics
        target_module["resources"] = reading_materials
        if generated_json.get("proof_of_work_instructions"):
            target_module["proof_of_work_instructions"] = generated_json["proof_of_work_instructions"]

        modules[target_m_idx] = target_module
        plan["modules"] = modules

        # 8. Save updated roadmap plan to Supabase
        sb.table("roadmaps").update({
            "roadmap_plan": plan,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", req.roadmap_id).execute()

        yield json.dumps({"status": f"Module {req.target_module_number} ready! 🚀"}) + "\n"
        yield json.dumps({"result": plan}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")

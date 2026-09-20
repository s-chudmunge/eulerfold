import asyncio
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from app.schemas import User
from app.services.lessons_service import generate_topic_lesson, generate_topic_lesson_stream, build_lesson_prompt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lessons", tags=["lessons"])

class LessonRequest(BaseModel):
    roadmap_id: int
    module_number: int
    topic_index: int
    subject: str
    topic_title: str
    subtopics: List[str] = []
    goal: str = ""
    model: Optional[str] = "cloud"
    force_regenerate: bool = False

class LessonPromptRequest(BaseModel):
    subject: str
    topic_title: str
    subtopics: List[str] = []
    goal: str = ""

class LessonSaveRequest(BaseModel):
    roadmap_id: int
    module_number: int
    topic_index: int
    lesson_content: str

_lesson_locks = {}
_lesson_dict_lock = asyncio.Lock()

@router.post("/generate")
async def generate_lesson(
    req: LessonRequest, 
    background_tasks: BackgroundTasks, 
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    uid = current_user.supabase_uid or str(current_user.id)

    # Pro gating: Goldfish AI Overview is strictly a Pro feature
    is_pro = bool(current_user.is_pro)
    if not is_pro and current_user.supabase_uid:
        prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", current_user.supabase_uid).execute()
        if prof_res.data and prof_res.data[0].get("is_pro"):
            is_pro = True
    elif not is_pro and current_user.email:
        prof_res = sb.table("profiles").select("is_pro").eq("email", current_user.email).execute()
        if prof_res.data and prof_res.data[0].get("is_pro"):
            is_pro = True

    if not is_pro:
        raise HTTPException(status_code=403, detail="Goldfish AI Overview is a Pro feature. Upgrade to Pro to unlock.")
    
    lock_key = f"{req.roadmap_id}:{req.module_number}:{req.topic_index}"
    async with _lesson_dict_lock:
        if lock_key not in _lesson_locks:
            _lesson_locks[lock_key] = asyncio.Lock()
        lock = _lesson_locks[lock_key]
        
    async with lock:
        try:
            roadmap_res = sb.table("roadmaps").select("roadmap_plan").eq("id", req.roadmap_id).execute()
            if not roadmap_res.data:
                raise HTTPException(status_code=404, detail="Roadmap not found")
                
            plan = roadmap_res.data[0].get("roadmap_plan")
            if not plan:
                raise HTTPException(status_code=404, detail="Roadmap plan not found")
                
            # Parse if string
            if isinstance(plan, str):
                import json
                plan = json.loads(plan)
                
            modules = plan.get("modules", [])
            if req.module_number < 1 or req.module_number > len(modules):
                raise HTTPException(status_code=400, detail="Invalid module number")
                
            mod = modules[req.module_number - 1]
            topics = mod.get("topics", [])
            
            if req.topic_index < 0 or req.topic_index >= len(topics):
                raise HTTPException(status_code=400, detail="Invalid topic index")
                
            topic = topics[req.topic_index]
            existing_lesson = topic.get("lesson_content")
            
            if existing_lesson and not req.force_regenerate:
                return {"lesson_content": existing_lesson}
                
            lesson_content = await generate_topic_lesson(
                sb=sb,
                uid=current_user.supabase_uid or str(current_user.id),
                roadmap_id=req.roadmap_id,
                module_number=req.module_number,
                topic_index=req.topic_index,
                subject=req.subject,
                topic_title=req.topic_title,
                subtopics=req.subtopics,
                goal=req.goal
            )
            
            topic["lesson_content"] = lesson_content
            
            # Update DB safely
            try:
                sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", req.roadmap_id).execute()
            except Exception as db_err:
                logger.warning(f"Could not persist lesson_content to roadmap: {db_err}")
            
            return {"lesson_content": lesson_content}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in generate_lesson: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-stream")
async def generate_lesson_stream(
    req: LessonRequest,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    uid = current_user.supabase_uid or str(current_user.id)

    # Pro gating: Goldfish AI Overview is strictly a Pro feature
    is_pro = bool(current_user.is_pro)
    if not is_pro and uid:
        prof_res = sb.table("profiles").select("is_pro").eq("supabase_uid", uid).execute()
        if prof_res.data and prof_res.data[0].get("is_pro"):
            is_pro = True
    elif not is_pro and current_user.email:
        prof_res = sb.table("profiles").select("is_pro").eq("email", current_user.email).execute()
        if prof_res.data and prof_res.data[0].get("is_pro"):
            is_pro = True

    if not is_pro:
        async def denied_stream():
            yield "Error: Goldfish AI Overview is a Pro feature. Upgrade to Pro to unlock."
        return StreamingResponse(denied_stream(), media_type="text/plain", status_code=403)

    # Global per-roadmap lock: strictly enforce only ONE topic stream at a time per roadmap
    lock_key = f"roadmap:{req.roadmap_id}"
    async with _lesson_dict_lock:
        if lock_key not in _lesson_locks:
            _lesson_locks[lock_key] = asyncio.Lock()
        lock = _lesson_locks[lock_key]

    async def stream_generator():
        # Abort immediately if client already disconnected
        if await request.is_disconnected():
            return

        async with lock:
            if await request.is_disconnected():
                return

            roadmap_res = sb.table("roadmaps").select("roadmap_plan").eq("id", req.roadmap_id).execute()
            if not roadmap_res.data:
                yield "Error: Roadmap not found"
                return
                
            plan = roadmap_res.data[0].get("roadmap_plan")
            if not plan:
                yield "Error: Roadmap plan not found"
                return
                
            if isinstance(plan, str):
                import json
                try:
                    plan = json.loads(plan)
                except Exception:
                    yield "Error: Invalid roadmap plan"
                    return
                    
            modules = plan.get("modules", [])
            if req.module_number < 1 or req.module_number > len(modules):
                yield "Error: Invalid module number"
                return
                
            mod = modules[req.module_number - 1]
            topics = mod.get("topics", [])
            
            if req.topic_index < 0 or req.topic_index >= len(topics):
                yield "Error: Invalid topic index"
                return
                
            topic = topics[req.topic_index]
            existing_lesson = topic.get("lesson_content")
            
            if existing_lesson and not req.force_regenerate:
                yield existing_lesson
                return

            accumulated = []
            try:
                async for chunk in generate_topic_lesson_stream(
                    sb=sb,
                    uid=uid,
                    roadmap_id=req.roadmap_id,
                    module_number=req.module_number,
                    topic_index=req.topic_index,
                    subject=req.subject,
                    topic_title=req.topic_title,
                    subtopics=req.subtopics,
                    goal=req.goal
                ):
                    if await request.is_disconnected():
                        logger.info(f"Client disconnected from lesson stream for topic '{req.topic_title}'. Aborting.")
                        break
                    accumulated.append(chunk)
                    yield chunk
            except Exception as stream_err:
                logger.error(f"Error during streaming lesson: {stream_err}")
                yield f"\n\n[Generation Error: {stream_err}]"
                return

            full_lesson = "".join(accumulated).strip()
            if full_lesson:
                from app.utils.ai_client import strip_thinking_process, log_backend_ai_usage
                clean_lesson = strip_thinking_process(full_lesson)
                topic["lesson_content"] = clean_lesson
                try:
                    sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", req.roadmap_id).execute()
                except Exception as db_err:
                    logger.warning(f"Could not persist streamed lesson_content to roadmap: {db_err}")

                if uid:
                    try:
                        prompt_est = len(req.topic_title + req.subject + req.goal) // 4
                        comp_est = len(clean_lesson) // 4
                        log_backend_ai_usage(
                            sb,
                            uid,
                            f"Micro-Lesson (Stream): {req.topic_title} (Cost: 0 Credits)",
                            {"prompt_tokens": prompt_est, "completion_tokens": comp_est, "total_tokens": prompt_est + comp_est},
                            source="backend"
                        )
                    except Exception as log_err:
                        logger.warning(f"Could not log micro-lesson AI usage: {log_err}")

    return StreamingResponse(stream_generator(), media_type="text/plain; charset=utf-8")

@router.post("/get-prompt")
async def get_lesson_prompt_endpoint(req: LessonPromptRequest):
    prompt = build_lesson_prompt(
        subject=req.subject,
        topic_title=req.topic_title,
        subtopics=req.subtopics,
        goal=req.goal
    )
    return {"prompt": prompt}

@router.post("/save")
async def save_lesson_content_endpoint(
    req: LessonSaveRequest,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    try:
        roadmap_res = sb.table("roadmaps").select("roadmap_plan").eq("id", req.roadmap_id).execute()
        if not roadmap_res.data:
            raise HTTPException(status_code=404, detail="Roadmap not found")
            
        plan = roadmap_res.data[0].get("roadmap_plan")
        if not plan:
            raise HTTPException(status_code=404, detail="Roadmap plan not found")
            
        if isinstance(plan, str):
            import json
            plan = json.loads(plan)
            
        modules = plan.get("modules", [])
        if 1 <= req.module_number <= len(modules):
            topics = modules[req.module_number - 1].get("topics", [])
            if 0 <= req.topic_index < len(topics):
                topics[req.topic_index]["lesson_content"] = req.lesson_content
                try:
                    sb.table("roadmaps").update({"roadmap_plan": plan}).eq("id", req.roadmap_id).execute()
                except Exception as db_err:
                    logger.warning(f"Could not persist lesson_content to roadmap: {db_err}")
                return {"status": "saved"}
        raise HTTPException(status_code=400, detail="Invalid module or topic index")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving lesson content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


import asyncio
import logging
from typing import List

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from app.schemas import User
from app.services.lessons_service import generate_topic_lesson, build_lesson_prompt

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
    model: str = "cloud" # "cloud" or "local"
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
                
            target_model = "local" if req.model == "local" else None
            lesson_content = await generate_topic_lesson(
                sb=sb,
                uid=current_user.supabase_uid or str(current_user.id),
                roadmap_id=req.roadmap_id,
                module_number=req.module_number,
                topic_index=req.topic_index,
                subject=req.subject,
                topic_title=req.topic_title,
                subtopics=req.subtopics,
                goal=req.goal,
                model=target_model
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


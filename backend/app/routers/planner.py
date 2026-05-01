import logging
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime
import uuid

from fastapi import APIRouter, HTTPException, Depends, Body, Query
from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from app.schemas import User, StudyTaskRead, StudyTaskCreate, StudyTaskUpdate, PlannerGenerateRequest

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/tasks", response_model=List[StudyTaskRead])
async def get_study_tasks(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    query = sb.table("study_tasks").select("*").eq("user_email", current_user.email)
    
    if start_date:
        query = query.gte("scheduled_date", start_date.isoformat())
    if end_date:
        query = query.lte("scheduled_date", end_date.isoformat())
        
    res = query.order("scheduled_date").execute()
    return res.data or []

@router.post("/tasks", response_model=StudyTaskRead)
async def create_study_task(
    payload: StudyTaskCreate,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    task_data = payload.model_dump()
    task_data["user_email"] = current_user.email
    task_data["scheduled_date"] = task_data["scheduled_date"].isoformat()
    
    res = sb.table("study_tasks").insert(task_data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return res.data[0]

@router.patch("/tasks/{task_id}", response_model=StudyTaskRead)
async def update_study_task(
    task_id: uuid.UUID,
    payload: StudyTaskUpdate,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    update_data = payload.model_dump(exclude_unset=True)
    if "scheduled_date" in update_data:
        update_data["scheduled_date"] = update_data["scheduled_date"].isoformat()
        
    res = sb.table("study_tasks").update(update_data).eq("id", str(task_id)).eq("user_email", current_user.email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return res.data[0]

@router.delete("/tasks/{task_id}")
async def delete_study_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    res = sb.table("study_tasks").delete().eq("id", str(task_id)).eq("user_email", current_user.email).execute()
    return {"status": "ok"}

@router.delete("/tasks-range")
async def delete_study_tasks_range(
    start_date: date,
    end_date: date,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    res = sb.table("study_tasks").delete() \
        .eq("user_email", current_user.email) \
        .gte("scheduled_date", start_date.isoformat()) \
        .lte("scheduled_date", end_date.isoformat()) \
        .execute()
    return {"status": "ok", "count": len(res.data) if res.data else 0}

@router.post("/generate")
async def generate_study_plan(
    payload: PlannerGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    sb = get_supabase_client()
    
    # 1. Fetch the roadmaps to see module counts
    roadmaps_res = sb.table("roadmaps").select("id, title, roadmap_plan").in_("id", payload.roadmap_ids).execute()
    if not roadmaps_res.data:
        raise HTTPException(status_code=404, detail="Roadmaps not found")
        
    # 2. Determine distribution logic based on intensity
    # casual: 1 module/week + 1 practice
    # balanced: 2 modules/week + 2 practices
    # intense: 3 modules/week + daily practice
    
    tasks_to_create = []
    current_date = payload.start_date
    
    for roadmap in roadmaps_res.data:
        plan = roadmap.get("roadmap_plan") or {}
        modules = plan.get("modules", [])
        
        for i, mod in enumerate(modules):
            module_num = i + 1
            # Add Module Task
            tasks_to_create.append({
                "user_email": current_user.email,
                "roadmap_id": roadmap["id"],
                "module_number": module_num,
                "task_type": "module",
                "title": f"Study: {mod.get('title', f'Module {module_num}')}",
                "scheduled_date": current_date.isoformat(),
                "metadata": {"roadmap_title": roadmap["title"]}
            })
            
            # Add Practice Task (next day)
            practice_date = current_date + timedelta(days=1)
            tasks_to_create.append({
                "user_email": current_user.email,
                "roadmap_id": roadmap["id"],
                "module_number": module_num,
                "task_type": "practice",
                "title": f"Practice: {mod.get('title')}",
                "scheduled_date": practice_date.isoformat(),
                "metadata": {"roadmap_title": roadmap["title"]}
            })
            
            # Add PoW Task (2 days later)
            pow_date = current_date + timedelta(days=2)
            tasks_to_create.append({
                "user_email": current_user.email,
                "roadmap_id": roadmap["id"],
                "module_number": module_num,
                "task_type": "pow",
                "title": f"Proof of Work: {mod.get('title')}",
                "scheduled_date": pow_date.isoformat(),
                "metadata": {"roadmap_title": roadmap["title"]}
            })
            
            # Increment date based on intensity
            if payload.intensity == 'casual':
                current_date += timedelta(days=7)
            elif payload.intensity == 'balanced':
                current_date += timedelta(days=4)
            else: # intense
                current_date += timedelta(days=3)
                
            if current_date > payload.target_date:
                break

    # 3. Batch insert
    if tasks_to_create:
        sb.table("study_tasks").insert(tasks_to_create).execute()
        
    return {"status": "ok", "count": len(tasks_to_create)}

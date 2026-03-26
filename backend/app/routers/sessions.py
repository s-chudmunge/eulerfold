from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from ..schemas import LearningSession, LearningSessionCreate, User
from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from datetime import datetime, timezone

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/log")
async def log_session(
    session_data: LearningSessionCreate,
    current_user: User = Depends(get_current_user)
):
    """Log a learning session duration (in seconds)"""
    if session_data.duration_seconds <= 0:
        return {"status": "ignored", "reason": "duration_too_short"}
    
    # Ignore unrealistically long sessions (e.g., > 24 hours in one go)
    if session_data.duration_seconds > 86400:
        return {"status": "ignored", "reason": "duration_too_long"}

    sb = get_supabase_client()
    
    # Insert session
    res = sb.table("learning_sessions").insert({
        "user_id": current_user.supabase_uid,
        "duration_seconds": session_data.duration_seconds
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to log session")
        
    return {"status": "success", "session_id": res.data[0]["id"]}

@router.get("/total")
async def get_total_time(current_user: User = Depends(get_current_user)):
    """Get total learning time in seconds and distinct active days for the current user"""
    sb = get_supabase_client()
    res = sb.table("learning_sessions").select("duration_seconds, created_at").eq("user_id", current_user.supabase_uid).execute()
    
    total_seconds = sum(row["duration_seconds"] for row in res.data)
    
    # Calculate distinct days from created_at timestamps
    try:
        # Supabase returns ISO strings. We extract just the date part for uniqueness.
        distinct_days = {row["created_at"].split("T")[0] for row in res.data}
        active_days = len(distinct_days)
    except Exception:
        active_days = 0
        
    return {
        "total_seconds": total_seconds,
        "active_days": active_days
    }

@router.get("/weekly-stats")
async def get_weekly_stats(current_user: User = Depends(get_current_user)):
    """Get daily learning duration in seconds for the last 7 days"""
    sb = get_supabase_client()
    
    # Simple query for the last 100 sessions (usually covers a week)
    # For a real production app, we'd use a date filter in the SQL query
    res = sb.table("learning_sessions") \
        .select("duration_seconds, created_at") \
        .eq("user_id", current_user.supabase_uid) \
        .order("created_at", desc=True) \
        .limit(200) \
        .execute()
    
    return res.data

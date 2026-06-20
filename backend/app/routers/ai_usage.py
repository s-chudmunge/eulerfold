import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User, AIUsageLogCreate, AIUsageLogRead

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai-usage", tags=["AI Usage"])

@router.post("", response_model=AIUsageLogRead)
async def log_ai_usage(log_data: AIUsageLogCreate, current_user: User = Depends(get_current_user)):
    """Log an AI generation event."""
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    if not uid:
        raise HTTPException(status_code=400, detail="User UID not found")

    insert_data = {
        "user_id": uid,
        "model_name": log_data.model_name,
        "subject": log_data.subject,
        "prompt_tokens": log_data.prompt_tokens,
        "completion_tokens": log_data.completion_tokens,
        "total_tokens": log_data.total_tokens,
        "status": log_data.status,
        "source": log_data.source,
        "error_message": log_data.error_message
    }

    res = sb.table("ai_usage_logs").insert(insert_data).execute()
    
    if not res or not res.data:
        raise HTTPException(status_code=500, detail="Failed to log AI usage")

    return res.data[0]

@router.get("", response_model=List[AIUsageLogRead])
async def get_ai_usage_logs(limit: int = 50, offset: int = 0, current_user: User = Depends(get_current_user)):
    """Fetch usage history for the current user."""
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    if not uid:
        raise HTTPException(status_code=400, detail="User UID not found")

    res = sb.table("ai_usage_logs") \
            .select("*") \
            .eq("user_id", uid) \
            .order("created_at", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()

    if not res:
        return []
        
    return res.data

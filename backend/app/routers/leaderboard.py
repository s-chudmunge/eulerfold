from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Any, Optional
from app.core.auth import get_current_user
from app.schemas import User
from app.core.supabase_client import get_supabase_client

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("")
async def get_leaderboard(limit: int = Query(50, le=100), offset: int = Query(0, ge=0)):
    """
    Get the top users from the leaderboard using the Supabase Materialized View.
    """
    sb = get_supabase_client()
    res = sb.table("leaderboard_rankings") \
        .select("rank, username, display_name, composite_score") \
        .order("rank") \
        .range(offset, offset + limit - 1) \
        .execute()
    
    return res.data

@router.get("/me")
async def get_my_rank(current_user: User = Depends(get_current_user)):
    """
    Get the current user's rank on the leaderboard from the Materialized View.
    """
    sb = get_supabase_client()
    uid = current_user.supabase_uid
    
    res = sb.table("leaderboard_rankings") \
        .select("rank, username, display_name, composite_score") \
        .eq("id", uid) \
        .maybe_single() \
        .execute()
    
    if res.data:
        return res.data
            
    return {"message": "User not on leaderboard yet", "rank": None, "composite_score": 0}

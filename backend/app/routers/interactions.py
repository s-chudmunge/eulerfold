from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import uuid

from app.core.auth import get_optional_user
from app.core.supabase_client import get_admin_supabase_client
from app.schemas import User, LikeRead, LikeToggle

router = APIRouter(prefix="/interactions", tags=["interactions"])

@router.get("/likes/{context_type}/{context_id}", response_model=LikeRead)
async def get_likes(
    context_type: str,
    context_id: str,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Fetch the like count for a specific context and check if the current user has liked it.
    """
    supabase = get_admin_supabase_client()
    
    # 1. Get total count
    count_res = supabase.table("content_likes").select("*", count="exact").eq("context_type", context_type).eq("context_id", context_id).execute()
    count = count_res.count if count_res.count is not None else 0
    
    # 2. Check if current user liked it
    user_liked = False
    if current_user:
        # Get profile ID
        profile_res = supabase.table("profiles").select("id").eq("supabase_uid", current_user.supabase_uid).maybe_single().execute()
        if profile_res.data:
            profile_id = profile_res.data["id"]
            like_check = supabase.table("content_likes").select("id").eq("context_type", context_type).eq("context_id", context_id).eq("user_id", profile_id).maybe_single().execute()
            if like_check.data:
                user_liked = True
                
    return LikeRead(count=count, user_liked=user_liked)

@router.post("/likes/toggle", response_model=LikeRead)
async def toggle_like(
    payload: LikeToggle,
    current_user: User = Depends(get_optional_user) # We need user for toggle, but get_optional_user handles error if not present?
):
    """
    Toggle a like for a specific context.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You must be signed in to like content."
        )
        
    supabase = get_admin_supabase_client()
    
    # 1. Get profile ID
    profile_res = supabase.table("profiles").select("id").eq("supabase_uid", current_user.supabase_uid).maybe_single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
        
    profile_id = profile_res.data["id"]
    
    # 2. Check if exists
    like_check = supabase.table("content_likes").select("id").eq("context_type", payload.context_type).eq("context_id", payload.context_id).eq("user_id", profile_id).maybe_single().execute()
    
    if like_check.data:
        # Remove like
        supabase.table("content_likes").delete().eq("id", like_check.data["id"]).execute()
    else:
        # Add like
        supabase.table("content_likes").insert({
            "context_type": payload.context_type,
            "context_id": payload.context_id,
            "user_id": profile_id
        }).execute()
        
    # 3. Return updated state
    return await get_likes(payload.context_type, payload.context_id, current_user)

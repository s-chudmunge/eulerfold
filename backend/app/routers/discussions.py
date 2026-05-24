from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.auth import get_current_user
from app.core.supabase_client import get_admin_supabase_client
from app.schemas import (
    User, 
    DiscussionCreate, 
    DiscussionRead, 
    DiscussionReportCreate,
    DiscussionReportRead
)

router = APIRouter(prefix="/discussions", tags=["discussions"])

@router.get("/{context_type}/{context_id}", response_model=List[DiscussionRead])
async def get_discussions(
    context_type: str,
    context_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Fetch discussions for a specific context.
    Returns a flattened list of comments with author details.
    Soft-deleted comments have their content nulled server-side.
    """
    supabase = get_admin_supabase_client()
    
    # Fetch threads with author profile details using a join
    query = supabase.table("discussion_threads").select(
        "*, profiles:author_id(username, display_name)"
    ).eq("context_type", context_type).eq("context_id", context_id).order("created_at", desc=False).range(offset, offset + limit - 1)
    
    response = query.execute()
    
    if not response.data:
        return []

    discussions = []
    for item in response.data:
        profile = item.get("profiles", {})
        
        # Server-side content nulling for soft deletes
        content = item.get("content")
        if item.get("is_deleted"):
            content = None
            
        discussions.append(DiscussionRead(
            id=item["id"],
            context_type=item["context_type"],
            context_id=item["context_id"],
            author_id=item["author_id"],
            author_name=profile.get("display_name") or profile.get("username") or "Unknown User",
            author_avatar=profile.get("avatar_url"),
            parent_id=item["parent_id"],
            content=content,
            is_pinned=item["is_pinned"],
            is_deleted=item["is_deleted"],
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        ))
        
    return discussions

@router.get("/user/{username}", response_model=List[DiscussionRead])
async def get_user_discussions(
    username: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Fetch all discussions/comments made by a specific user.
    """
    supabase = get_admin_supabase_client()
    
    # 1. Get profile ID
    profile_res = supabase.table("profiles").select("id, display_name, avatar_url").eq("username", username).maybe_single().execute()
    if not profile_res or not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    profile = profile_res.data
    author_id = profile["id"]
    
    # 2. Fetch comments
    query = supabase.table("discussion_threads").select("*").eq("author_id", author_id).order("created_at", desc=True).range(offset, offset + limit - 1)
    response = query.execute()
    
    if not response.data:
        return []

    discussions = []
    for item in response.data:
        # Server-side content nulling for soft deletes
        content = item.get("content")
        if item.get("is_deleted"):
            content = None
            
        discussions.append(DiscussionRead(
            id=item["id"],
            context_type=item["context_type"],
            context_id=item["context_id"],
            author_id=item["author_id"],
            author_name=profile.get("display_name") or username,
            author_avatar=profile.get("avatar_url"),
            parent_id=item["parent_id"],
            content=content,
            is_pinned=item["is_pinned"],
            is_deleted=item["is_deleted"],
            created_at=item["created_at"],
            updated_at=item["updated_at"]
        ))
        
    return discussions

@router.post("", response_model=DiscussionRead, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion: DiscussionCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new discussion thread or reply.
    Enforces 1-level nesting cap.
    """
    supabase = get_admin_supabase_client()
    
    # 1. Enforce 1-level nesting cap
    if discussion.parent_id:
        parent_res = supabase.table("discussion_threads").select("parent_id").eq("id", str(discussion.parent_id)).execute()
        if not parent_res.data:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        
        if parent_res.data[0]["parent_id"] is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Replies are capped at one level deep."
            )

    # 2. Insert the comment
    # Note: current_user.id in the codebase is often an integer mapping to profiles.id
    # We need the UUID from profiles table that matches the supabase_uid
    profile_res = supabase.table("profiles").select("id, username, display_name").eq("supabase_uid", current_user.supabase_uid).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    author_profile = profile_res.data[0]
    author_id = author_profile["id"]

    # TODO: Future AI Moderation hook point here

    insert_data = {
        "context_type": discussion.context_type,
        "context_id": discussion.context_id,
        "author_id": author_id,
        "parent_id": str(discussion.parent_id) if discussion.parent_id else None,
        "content": discussion.content
    }
    
    response = supabase.table("discussion_threads").insert(insert_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create comment")
    
    new_item = response.data[0]
    
    return DiscussionRead(
        id=new_item["id"],
        context_type=new_item["context_type"],
        context_id=new_item["context_id"],
        author_id=new_item["author_id"],
        author_name=author_profile.get("display_name") or author_profile.get("username"),
        author_avatar=author_profile.get("avatar_url"),
        parent_id=new_item["parent_id"],
        content=new_item["content"],
        is_pinned=new_item["is_pinned"],
        is_deleted=new_item["is_deleted"],
        created_at=new_item["created_at"],
        updated_at=new_item["updated_at"]
    )

@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: uuid.UUID,
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete a comment. Only the author or an admin can delete.
    """
    supabase = get_admin_supabase_client()
    
    # 1. Check ownership
    disc_res = supabase.table("discussion_threads").select("author_id").eq("id", str(discussion_id)).execute()
    if not disc_res.data:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    author_id = disc_res.data[0]["author_id"]
    
    profile_res = supabase.table("profiles").select("id").eq("supabase_uid", current_user.supabase_uid).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    current_profile_id = profile_res.data[0]["id"]
    
    if not current_user.is_admin and str(author_id) != str(current_profile_id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # 2. Perform soft delete
    supabase.table("discussion_threads").update({
        "is_deleted": True,
        "content": None # Clean content immediately on delete
    }).eq("id", str(discussion_id)).execute()
    
    return None

@router.post("/report", response_model=DiscussionReportRead, status_code=status.HTTP_201_CREATED)
async def report_discussion(
    report: DiscussionReportCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Report a comment for moderation.
    Prevents duplicate reports from the same user on the same comment.
    """
    supabase = get_admin_supabase_client()
    
    profile_res = supabase.table("profiles").select("id").eq("supabase_uid", current_user.supabase_uid).execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    user_id = profile_res.data[0]["id"]
    
    # Check if comment exists
    comment_check = supabase.table("discussion_threads").select("id").eq("id", str(report.comment_id)).execute()
    if not comment_check.data:
        raise HTTPException(status_code=404, detail="Comment not found")

    report_data = {
        "user_id": user_id,
        "comment_id": str(report.comment_id),
        "reason": report.reason
    }
    
    # Postgrest unique constraint violation will raise an error, we catch it
    try:
        response = supabase.table("discussion_reports").insert(report_data).execute()
        return response.data[0]
    except Exception as e:
        # Check if it's a unique constraint violation
        if "duplicate key value" in str(e) or "already exists" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="You have already reported this comment."
            )
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(e)}")

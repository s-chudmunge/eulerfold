from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UserUpdate, User, OnboardingStatusResponse
from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
from app.utils.resend_client import send_email, build_html_email, send_welcome_email
from app.utils.streaks import refresh_streak
import logging
import os
import re
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

class UserOnboardingRequest(BaseModel):
    username: str
    display_name: Optional[str] = None
    # we deliberately do not accept email or password here; email is derived from OAuth


class TOSAcceptRequest(BaseModel):
    version: str

class FeatureRequest(BaseModel):
    title: str
    description: str
    category: str = "Feature"

class UnsubscribeRequest(BaseModel):
    email: str

@router.post("/unsubscribe")
async def unsubscribe_email(request: UnsubscribeRequest):
    """Handle global unsubscriptions by updating the profile flag."""
    email = request.email.lower().strip()
    supabase = get_supabase_client()
    
    # Update profiles table for this email
    try:
        supabase.table("profiles").update({"unsubscribed": True}).eq("email", email).execute()
    except Exception as e:
        logger.error(f"Failed to update unsubscribed in profiles for {email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update unsubscription preference")
        
    return {"status": "ok", "message": "Successfully unsubscribed"}

@router.post("/feature-request")
async def submit_feature_request(
    request: FeatureRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit a feature request or bug report directly to the developer."""
    admin_email = "eulerfold@gmail.com"
    
    html_content = f"""
        <h1 style="color: #0f766e; font-size: 20px; font-weight: 900; text-transform: uppercase;">New {request.category} Request</h1>
        <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Title: {request.title}</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">{request.description}</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Sent by: {current_user.email}</p>
    """
    
    try:
        final_html = await build_html_email(html_content, current_user.email)
        await send_email(
            to=admin_email,
            subject=f"EulerFold {request.category}: {request.title}",
            html=final_html
        )
        return {"status": "ok", "message": "Feature request sent successfully"}
    except Exception as e:
        logger.error(f"Failed to send feature request: {e}")
        raise HTTPException(status_code=500, detail="Failed to send request. Please try again later.")

@router.get("/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    """Admin only: list all users."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    supabase = get_supabase_client()
    response = supabase.table("profiles").select("*").execute()
    return response.data

@router.get("/users/{user_id}", response_model=User)
async def get_user_by_id(user_id: int, current_user: User = Depends(get_current_user)):
    """Get user by ID. Admin or self."""
    # Check permission
    if not current_user.is_admin and current_user.id != user_id:
        # Note: current_user.id might be 0 because it's transient. 
        # We should use supabase_uid for reliable ownership checks.
        pass # Will handle below

    supabase = get_supabase_client()
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user_data = response.data[0]
    if not current_user.is_admin and current_user.supabase_uid != user_data.get("supabase_uid"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return user_data

@router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile. Admin or self."""
    supabase = get_supabase_client()
    
    # 1. Fetch current data to check ownership
    check_res = supabase.table("profiles").select("supabase_uid").eq("id", user_id).execute()
    if not check_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not current_user.is_admin and current_user.supabase_uid != check_res.data[0]["supabase_uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = user_update.model_dump(exclude_unset=True)
    # Prevent non-admins from making themselves admins
    if not current_user.is_admin:
        update_data.pop("is_admin", None)

    response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return response.data[0]

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, current_user: User = Depends(get_current_user)):
    """Delete user profile. Admin or self."""
    supabase = get_supabase_client()
    
    # 1. Fetch current data to check ownership
    check_res = supabase.table("profiles").select("supabase_uid").eq("id", user_id).execute()
    if not check_res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not current_user.is_admin and current_user.supabase_uid != check_res.data[0]["supabase_uid"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    response = supabase.table("profiles").delete().eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return

@router.patch("/profile", response_model=User)
@router.patch("/profile/", response_model=User)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile."""
    logger.info(f"Updating profile for user {current_user.email} (UID: {current_user.supabase_uid})")
    supabase = get_supabase_client()
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Validation for username
    if "username" in update_data:
        username = update_data["username"].lower()
        if not re.match(r"^[a-z0-9_]{3,20}$", username):
            raise HTTPException(status_code=400, detail="Username must be 3-20 characters, alphanumeric or underscore.")
        
        # Check if taken
        check = supabase.table("profiles").select("id").eq("username", username).neq("supabase_uid", current_user.supabase_uid).execute()
        if check.data:
            raise HTTPException(status_code=400, detail="Username already taken.")
        update_data["username"] = username

    response = supabase.table("profiles").update(update_data).eq("supabase_uid", current_user.supabase_uid).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found in database.")
    
    return response.data[0]


@router.post("/accept-tos", response_model=User)
async def accept_tos(
    request: TOSAcceptRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user's ToS acceptance timestamp and version."""
    supabase = get_supabase_client()

    update_data = {
        "tos_accepted_at": datetime.now().isoformat(),
        "tos_version": request.version
    }

    response = supabase.table("profiles").update(update_data).eq("supabase_uid", current_user.supabase_uid).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return response.data[0]


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    # Ensure streak is accurate
    if current_user and current_user.email:
        email = current_user.email.lower()
        await refresh_streak(email)
        
        supabase = get_supabase_client()
        # Fetch profile
        res = supabase.table("profiles").select("*").eq("supabase_uid", current_user.supabase_uid).execute()
        
        if not res.data:
            # RACE CONDITION: Profile might not be created by trigger yet.
            # Return the current_user (from JWT) which is enough for onboarding to start.
            logger.warning(f"Profile not found for {current_user.email} (UID: {current_user.supabase_uid}). Returning transient user.")
            return current_user

        user_data = res.data[0]

        # Sync GitHub username if linked but not in profile
        try:
            from app.core.supabase_client import get_admin_supabase_client
            admin_sb = get_admin_supabase_client()
            auth_user_res = admin_sb.auth.admin.get_user_by_id(current_user.supabase_uid)
            if auth_user_res and auth_user_res.user:
                github_identity = next((id for id in (auth_user_res.user.identities or []) if id.provider == "github"), None)
                if github_identity:
                    github_username = github_identity.identity_data.get("user_name")
                    if github_username and github_username != user_data.get("github_username"):
                        supabase.table("profiles").update({"github_username": github_username}).eq("supabase_uid", current_user.supabase_uid).execute()
                        user_data["github_username"] = github_username
        except Exception as e:
            logger.error(f"Failed to sync GitHub identity for {current_user.email}: {e}")
        
        # Fetch user skills
        uid = user_data.get("supabase_uid")
        skills = []
        if uid:
            skills_res = supabase.table("user_skills").select("*, canonical_skills(name, category)").eq("user_id", uid).execute()
            for us in skills_res.data:
                cs = us.get("canonical_skills", {}) or {}
                skills.append({
                    **us,
                    "name": cs.get("name"),
                    "category": cs.get("category")
                })
        
        user_data["skills"] = skills
        return user_data
    return current_user

@router.post("/metadata")
async def update_metadata(
    metadata: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Update profile metadata (UI state, etc.)"""
    supabase = get_supabase_client()
    
    # 1. Fetch current profile from DB to merge metadata (current_user is a transient object)
    profile_res = supabase.table("profiles").select("*").eq("supabase_uid", current_user.supabase_uid).execute()
    
    if not profile_res.data:
        # If user exists in Auth but not in Profiles, create a placeholder profile
        logger.warning(f"Auth metadata update: User {current_user.supabase_uid} has no profile. Creating one.")
        new_profile = {
            "supabase_uid": current_user.supabase_uid,
            "email": current_user.email,
            "display_name": current_user.display_name or "EulerFold User",
            "metadata": metadata
        }
        res = supabase.table("profiles").insert(new_profile).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create user profile")
        return res.data[0]
    
    # 2. Merge existing metadata with new metadata
    existing_profile = profile_res.data[0]
    current_metadata = existing_profile.get("metadata") or {}
    
    # Deep merge or just top-level merge? Frontend expects top-level merge for simple UI states.
    merged_metadata = {**current_metadata, **metadata}
    
    # 3. Save merged metadata
    response = supabase.table("profiles").update({"metadata": merged_metadata}).eq("supabase_uid", current_user.supabase_uid).execute()
    
    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile disappeared during update")
        
    return response.data[0]


@router.get("/onboarding-status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(current_user: User = Depends(get_current_user)):
    """Check if user needs to complete onboarding"""
    return OnboardingStatusResponse(
        needs_onboarding=not current_user.onboarding_completed,
        profile_completed=current_user.profile_completed,
        user_id=current_user.id
    )

@router.post("/complete-onboarding", response_model=User)
async def complete_onboarding(
    onboarding_data: UserOnboardingRequest,
    current_user: User = Depends(get_current_user)
):
    """Complete user onboarding with required profile information"""
    supabase = get_supabase_client()
    
    # 1. Validate Username (required)
    username = onboarding_data.username.lower().replace("@", "")
    if not re.match(r"^[a-z0-9_]{3,20}$", username):
        raise HTTPException(status_code=400, detail="Username must be 3-20 characters, alphanumeric or underscore.")
    
    # 2. Check if taken
    check = supabase.table("profiles").select("id").eq("username", username).neq("supabase_uid", current_user.supabase_uid).execute()
    if check.data:
        raise HTTPException(status_code=400, detail="Username already taken.")

    update_data = {
        "username": username,
        "profile_completed": True,
        "onboarding_completed": True
    }
    # display_name is optional
    if onboarding_data.display_name:
        update_data["display_name"] = onboarding_data.display_name
    
    response = supabase.table("profiles").update(update_data).eq("supabase_uid", current_user.supabase_uid).execute()
    
    if not response.data:
        # If profile doesn't exist, create it (though it should exist if they are logged in)
        update_data["supabase_uid"] = current_user.supabase_uid
        update_data["email"] = current_user.email
        # We omit eulercoins and roadmap_credits to avoid PGRST204 schema cache errors 
        # when columns were recently added. Database defaults will handle them.
        response = supabase.table("profiles").insert(update_data).execute()

    # Send welcome email if profile was just completed
    if response.data and current_user.email:
        try:
            profile_data = response.data[0]
            
            # Resolve the best name:
            # 1. Onboarding input (highest priority)
            # 2. JWT display_name (if profile is still the default 'EulerFold User')
            # 3. Profile's actual display_name
            # 4. Fallback to Email-derived name
            
            name = onboarding_data.display_name
            p_name = profile_data.get("display_name")
            
            if not name:
                if not p_name or p_name == "EulerFold User":
                    # Use name from JWT if profile has the generic default
                    name = current_user.display_name
                else:
                    name = p_name
            
            if not name or name == "EulerFold User":
                name = current_user.email.split('@')[0].capitalize()
            
            username = profile_data.get("username")
            import asyncio
            asyncio.create_task(send_welcome_email(current_user.email, name, username))
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")

    return response.data[0]

from typing import Optional
from fastapi import Depends, Request
from app.schemas import User
from app.core.supabase_client import get_supabase_client
from app.core.auth import verify_token_with_timeout
import logging
import os

logger = logging.getLogger(__name__)

async def get_optional_current_user(request: Request) -> Optional[User]:
    """Get current user from token, return None if not authenticated (optional auth)."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    sb = get_supabase_client()

    try:
        # Verify Supabase JWT token with timeout
        response = await verify_token_with_timeout(token)
        if not response or not response.user:
            return None

        supabase_user = response.user
        uid = supabase_user.id
        email = supabase_user.email
        logger.info(f"Optional Auth: Decoded Supabase token for UID: {uid}, Email: {email}")

        # Check if user exists in profiles by UID
        profile_res = sb.table("profiles").select("*").eq("supabase_uid", uid).execute()
        
        if not profile_res.data:
            # Fallback: check by email to handle sync issues or trigger race conditions
            email_check = sb.table("profiles").select("*").ilike("email", email).execute()
            if email_check.data:
                # Update UID if it was missing or different
                existing = email_check.data[0]
                if existing.get("supabase_uid") != uid:
                    sb.table("profiles").update({"supabase_uid": uid}).eq("id", existing["id"]).execute()
                return User(**existing)

            logger.warning(f"Optional Auth: User with Supabase UID {uid} not found in database. Creating new user.")
            try:
                user_metadata = supabase_user.user_metadata or {}
                display_name = user_metadata.get('full_name') or user_metadata.get('name')
                
                # Derive a safe username (similar to DB trigger logic)
                base_username = (email.split("@")[0] if email else "user").lower()
                base_username = "".join(c for c in base_username if c.isalnum() or c == "_")
                if len(base_username) < 3:
                    base_username += "user"
                
                final_username = f"{base_username[:15]}_{str(uid)[:4]}"

                new_user_data = {
                    "supabase_uid": uid,
                    "email": email or f"{uid}@temp.user",
                    "username": final_username,
                    "is_active": True,
                    "is_admin": False,
                    "display_name": display_name,
                    "profile_completed": bool(email),
                    "onboarding_completed": bool(email)
                }
                
                # Use upsert to handle race conditions with the DB trigger
                insert_res = sb.table("profiles").upsert(new_user_data, on_conflict="supabase_uid").execute()
                if insert_res.data:
                    return User(**insert_res.data[0])
                return None
            except Exception as e:
                logger.error(f"Optional Auth: Failed to create new user in DB: {e}")
                return None
        
        return User(**profile_res.data[0])
    except Exception as e:
        logger.warning(f"Optional Auth: Supabase token verification failed or user not found: {e}")
        return None

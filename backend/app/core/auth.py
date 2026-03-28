from datetime import timedelta, datetime
from typing import Optional
import asyncio
import logging
import os
import re

from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import OAuth2PasswordBearer
from app.schemas import User
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def verify_token_with_timeout(token: str, timeout: float = 10.0):
    """Verify Supabase token with a timeout to avoid hanging on network issues."""
    try:
        supabase = get_supabase_client()
        # Supabase-py's get_user is now async-friendly in v2+ and we should call it directly
        # if using the async client, or use wait_for if it's a synchronous call we're wrapping.
        # Actually, if we're using the standard supabase-py, get_user is sync.
        response = await asyncio.wait_for(
            asyncio.to_thread(supabase.auth.get_user, token),
            timeout=timeout
        )
        return response
    except asyncio.TimeoutError:
        logger.error(f"Auth: Supabase token verification timed out after {timeout}s")
        return None
    except Exception as e:
        logger.error(f"Auth verification failed: {e}")
        return None

async def get_current_user(request: Request) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise credentials_exception

    token = auth_header.split(" ")[1]

    try:
        # Verify Supabase JWT token with timeout
        response = await verify_token_with_timeout(token)
        if not response or not response.user:
            raise credentials_exception

        supabase_user = response.user
        uid = supabase_user.id
        email = supabase_user.email
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth: Supabase token verification failed: {e}")
        raise credentials_exception

    # Create transient user object
    user_metadata = supabase_user.user_metadata or {}
    display_name = user_metadata.get('full_name') or user_metadata.get('name')
    
    # We provide a placeholder username to satisfy the mandatory schema.
    # The actual profile data will be fetched in the /auth/me route.
    return User(
        id=0,
        supabase_uid=uid,
        email=email,
        username="user_" + uid[:8],
        is_active=True,
        display_name=display_name,
        profile_completed=False,
        onboarding_completed=False
    )

async def get_optional_user(request: Request) -> Optional[User]:
    """Optional authentication for endpoints that can work without a user."""
    try:
        return await get_current_user(request)
    except Exception:
        return None

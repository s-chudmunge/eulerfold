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

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((Exception)),
    before_sleep=lambda retry_state: logger.info(f"Retrying auth verification (attempt {retry_state.attempt_number})...")
)
async def verify_token_with_timeout(token: str, timeout: float = 10.0):
    """Verify Supabase token with a timeout to avoid hanging on network issues."""
    try:
        supabase = get_supabase_client()
        response = await asyncio.wait_for(
            asyncio.to_thread(supabase.auth.get_user, token),
            timeout=timeout
        )
        return response
    except asyncio.TimeoutError:
        logger.error(f"Auth: Supabase token verification timed out after {timeout}s")
        raise # Raise for tenacity to retry
    except Exception as e:
        logger.error(f"Auth verification attempt failed: {e}")
        raise # Raise for tenacity to retry

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
    
    # Quick check for malformed tokens to avoid log spam and useless retries
    if not token or token in ("null", "undefined") or token.count(".") != 2:
        # We don't log the full token for security, but we log the issue
        logger.warning(f"Auth: Malformed token received (length={len(token) if token else 0}, segments={token.count('.') + 1 if token else 0})")
        raise credentials_exception

    try:
        # Verify Supabase JWT token with timeout + retry
        try:
            response = await verify_token_with_timeout(token)
            if not response or not response.user:
                raise credentials_exception
        except Exception as e:
            logger.error(f"Auth: Supabase token verification failed after retries: {e}")
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

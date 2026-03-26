from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from app.schemas import User
from app.core.auth import get_current_user
from app.core.supabase_client import get_supabase_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    """Verify that the current user is an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    return current_user


@router.get("/users")
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
    search: Optional[str] = Query(None),
    admin_user: User = Depends(verify_admin)
):
    """
    Fetch users with pagination and search.
    Requires admin privileges.
    """
    try:
        logger.info(f"Fetching users - page: {page}, limit: {limit}, search: {search}")

        # Calculate offset for pagination
        offset = (page - 1) * limit

        supabase = get_supabase_client()
        query = supabase.table("profiles").select("*", count="exact")

        # Apply search filter if provided
        if search:
            query = query.or_(f"email.ilike.%{search}%,display_name.ilike.%{search}%")

        # Apply pagination
        query = query.range(offset, offset + limit - 1)

        response = query.execute()
        
        users = response.data
        total_users = response.count

        logger.info(f"Retrieved {len(users)} users from database")

        return {
            "users": users,
            "total": total_users,
            "page": page,
            "limit": limit,
            "total_pages": (total_users + limit - 1) // limit if total_users else 0
        }

    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

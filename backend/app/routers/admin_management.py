"""
Admin management router for setting up admin users with Supabase.
This is a one-time setup router that can be disabled after initial configuration.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from app.utils.secret_manager import get_admin_credentials
from app.core.supabase_client import get_supabase_client
from app.schemas import User
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin-setup", tags=["admin-setup"])
security = HTTPBasic()

# Get admin credentials for initial setup authentication
SETUP_USERNAME, SETUP_PASSWORD = get_admin_credentials()

class AdminSetupRequest(BaseModel):
    supabase_uid: str
    email: str

def verify_setup_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify setup credentials using Secret Manager"""
    is_correct_username = secrets.compare_digest(credentials.username, SETUP_USERNAME)
    is_correct_password = secrets.compare_digest(credentials.password, SETUP_PASSWORD)
    
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid setup credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

@router.post("/create-admin")
async def create_admin_user(
    request: AdminSetupRequest,
    _: str = Depends(verify_setup_credentials)
):
    """
    Grant admin privileges to a Supabase user.
    This endpoint should only be used during initial setup.
    """
    try:
        supabase = get_supabase_client()
        
        # Check if user exists in profiles
        response = supabase.table("profiles").select("*").eq("supabase_uid", request.supabase_uid).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with Supabase UID {request.supabase_uid} not found"
            )

        # Grant admin privileges
        update_response = supabase.table("profiles").update({"is_admin": True}).eq("supabase_uid", request.supabase_uid).execute()

        if not update_response.data:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user privileges"
            )

        logger.info(f"Successfully granted admin privileges to {request.email} ({request.supabase_uid})")
        return {
            "success": True,
            "message": f"Admin privileges granted to {request.email}",
            "supabase_uid": request.supabase_uid
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create admin user: {str(e)}"
        )

@router.post("/revoke-admin")
async def revoke_admin_user(
    request: AdminSetupRequest,
    _: str = Depends(verify_setup_credentials)
):
    """Revoke admin privileges from a Supabase user."""
    try:
        supabase = get_supabase_client()
        
        # Check if user exists in profiles
        response = supabase.table("profiles").select("*").eq("supabase_uid", request.supabase_uid).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with Supabase UID {request.supabase_uid} not found"
            )

        # Revoke admin privileges
        update_response = supabase.table("profiles").update({"is_admin": False}).eq("supabase_uid", request.supabase_uid).execute()

        if not update_response.data:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user privileges"
            )

        logger.info(f"Successfully revoked admin privileges from {request.email} ({request.supabase_uid})")
        return {
            "success": True,
            "message": f"Admin privileges revoked from {request.email}",
            "supabase_uid": request.supabase_uid
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking admin user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke admin user: {str(e)}"
        )

@router.get("/instructions")
async def get_setup_instructions():
    """Get instructions for setting up admin users."""
    return {
        "instructions": [
            "1. Create a regular user account through Supabase Auth (sign up normally)",
            "2. Get the user's Supabase UID from the Supabase dashboard or user profile",
            "3. Use POST /admin-setup/create-admin with HTTP Basic Auth and the user's UID",
            "4. The user can now access admin panels using their Supabase token",
            "5. For security, disable or remove this setup router after configuration"
        ],
        "example_request": {
            "method": "POST",
            "url": "/admin-setup/create-admin",
            "auth": "HTTP Basic Auth (use Secret Manager credentials)",
            "body": {
                "supabase_uid": "user-supabase-uid-here",
                "email": "admin@example.com"
            }
        }
    }

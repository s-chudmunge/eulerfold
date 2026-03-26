"""
Static data endpoints - kept minimal for admin use only
"""
from fastapi import APIRouter

router = APIRouter(prefix="/static-data", tags=["static-data"])

# Static data functionality has been removed to simplify the system
# The admin download functionality remains in the curated-roadmaps admin panel
# All data loading now goes directly to the database for consistency
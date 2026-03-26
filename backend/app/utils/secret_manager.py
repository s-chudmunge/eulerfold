import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

def get_admin_credentials() -> tuple[Optional[str], Optional[str]]:
    """
    Get admin credentials from environment variables.
    
    Returns:
        Tuple of (username, password)
    """
    username = os.getenv("ADMIN_USERNAME", "admin")
    password = os.getenv("ADMIN_PASSWORD")
    
    if not password:
        logger.error("ADMIN_PASSWORD not found in environment variables")
        return None, None
    
    return username, password

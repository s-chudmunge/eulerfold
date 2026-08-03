"""
Supabase client initialization and configuration.
"""
import logging
from typing import Optional
from supabase import create_client, Client
from supabase.lib.client_options import SyncClientOptions as ClientOptions
from .config import settings

import threading

logger = logging.getLogger(__name__)

# Thread-local storage for Supabase clients to prevent httpx concurrency errors
_local = threading.local()


def get_supabase_client() -> Client:
    """
    Get or create the Supabase client instance using thread-local storage.
    """
    if not hasattr(_local, "client"):
        if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.error("SUPABASE_URL and SUPABASE_KEY environment variables are required")
            raise RuntimeError("Supabase credentials are not configured")

        try:
            # Increase timeout to 60 seconds to be more resilient
            options = ClientOptions(
                postgrest_client_timeout=60,
                storage_client_timeout=60,
                # Thread isolation resolves httpx HTTP/2 multiplexing errors
            )
            _local.client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY,
                options=options
            )
            logger.info("Supabase client initialized successfully with 60s timeout")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise RuntimeError(f"Supabase initialization failed: {e}")

    return _local.client


def get_admin_supabase_client() -> Client:
    """
    Get or create the Supabase admin client instance (using service role key).
    """
    if not hasattr(_local, "admin_client"):
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY # Fallback

        if not url or not key:
            raise RuntimeError("Supabase admin credentials are not configured")

        try:
            _local.admin_client = create_client(url, key, options=ClientOptions(
                postgrest_client_timeout=60,
                storage_client_timeout=60,
            ))
            logger.info("Supabase ADMIN client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase admin client: {e}")
            raise RuntimeError(f"Supabase admin initialization failed: {e}")

    return _local.admin_client

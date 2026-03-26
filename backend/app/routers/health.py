from fastapi import APIRouter, Depends, HTTPException
from app.database.redis_client import get_redis_client
from app.core.supabase_client import get_supabase_client
import time
import logging
from typing import Dict, Any
import asyncio

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check():
    """Basic health check to keep backend warm"""
    return {"status": "ok"}

@router.api_route("/health/deep", methods=["GET", "HEAD"])
async def deep_health_check():
    """Deep health check that tests cache and Supabase connectivity"""
    checks = {
        "redis": False,
        "supabase": False,
    }
    
    try:
        # Test Redis connectivity
        try:
            with get_redis_client() as redis_client:
                redis_client.ping()
                checks["redis"] = True
        except Exception as e:
            logger.warning(f"Redis check failed: {e}")
        
        # Test Supabase connectivity
        try:
            sb = get_supabase_client()
            # Try a simple query (list table names or health endpoint)
            # Using a timeout to prevent hanging
            result = await asyncio.wait_for(
                asyncio.to_thread(sb.table("roadmaps").select("id").limit(1).execute),
                timeout=5
            )
            if result is not None:
                checks["supabase"] = True
        except asyncio.TimeoutError:
            logger.warning("Supabase check timed out after 5s")
        except Exception as e:
            logger.warning(f"Supabase check failed: {type(e).__name__}: {e}")
        
        return {
            "status": "healthy" if all(checks.values()) else "degraded",
            "checks": checks,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "checks": checks,
            "error": str(e),
            "timestamp": time.time()
        }

@router.api_route("/health/warm", methods=["GET", "HEAD"])
async def warm_backend():
    """Warm up backend by ensuring Redis connectivity"""
    try:
        start_time = time.time()
        
        # Test Redis connectivity
        redis_healthy = False
        try:
            with get_redis_client() as redis_client:
                redis_client.ping()
                redis_healthy = True
        except Exception:
            pass
        
        warmup_time = time.time() - start_time
        
        return {
            "status": "warmed",
            "redis_healthy": redis_healthy,
            "warmup_time_ms": round(warmup_time * 1000, 2),
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Backend warmup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Warmup failed: {str(e)}")


@router.api_route("/health/auth-test", methods=["GET", "HEAD"])
async def test_auth(authorization: str = None):
    """Test auth verification with a token (for debugging)"""
    import time
    from app.core.auth import verify_token_with_timeout
    
    if not authorization:
        return {
            "status": "missing_token",
            "message": "Pass Authorization header with Bearer token",
            "example": "?authorization=Bearer%20your_token_here"
        }
    
    token = authorization.replace("Bearer ", "").strip() if authorization.startswith("Bearer ") else authorization
    
    if not token or len(token) < 50:
        return {
            "status": "invalid_token",
            "message": f"Token too short (len={len(token) if token else 0}), expected JWT token >= 50 chars",
            "token_prefix": token[:20] if token else None
        }
    
    start = time.time()
    try:
        response = await verify_token_with_timeout(token, timeout=15)
        elapsed = time.time() - start
        
        if response and response.user:
            return {
                "status": "success",
                "email": response.user.email,
                "uid": response.user.id,
                "verification_time_ms": round(elapsed * 1000, 2),
                "timestamp": time.time()
            }
        else:
            return {
                "status": "empty_response",
                "message": "Supabase returned empty user",
                "verification_time_ms": round(elapsed * 1000, 2),
                "timestamp": time.time()
            }
    except asyncio.TimeoutError as e:
        elapsed = time.time() - start
        return {
            "status": "timeout",
            "message": str(e),
            "verification_time_ms": round(elapsed * 1000, 2),
            "timestamp": time.time()
        }
    except Exception as e:
        elapsed = time.time() - start
        return {
            "status": "error",
            "error_type": type(e).__name__,
            "message": str(e),
            "verification_time_ms": round(elapsed * 1000, 2),
            "timestamp": time.time()
        }
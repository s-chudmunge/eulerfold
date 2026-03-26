from typing import Generator, Optional
import redis
from app.core.config import settings
import contextlib
import logging
import time

logger = logging.getLogger(__name__)

@contextlib.contextmanager
def get_redis_client() -> Generator[Optional[redis.Redis], None, None]:
    """
    Context manager for Redis client with connection verification and retry logic.
    Returns None if Redis is unavailable, allowing graceful degradation.
    """
    client: Optional[redis.Redis] = None

    # Skip Redis if URL is not configured
    if not settings.REDIS_URL:
        logger.warning("Redis URL not configured, cache will be disabled")
        yield None
        return

    try:
        client = redis.Redis.from_url(
            settings.REDIS_URL,
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )

        # Verify connection with retries
        max_retries = 3
        for attempt in range(max_retries):
            try:
                client.ping()
                logger.debug("Redis connection verified")
                break
            except redis.ConnectionError as e:
                if attempt < max_retries - 1:
                    logger.debug(f"Redis connection attempt {attempt + 1} failed, retrying...")
                    time.sleep(0.5)  # Reduced sleep time
                else:
                    # Only log once at debug level when all retries fail
                    logger.debug(f"Redis unavailable after {max_retries} attempts: {e}")
                    if client:
                        client.close()
                    yield None
                    return

        yield client
    except Exception as e:
        logger.error(f"Redis client error: {e}")
        yield None
    finally:
        if client:
            try:
                client.close()
            except Exception as e:
                logger.error(f"Error closing Redis connection: {e}")
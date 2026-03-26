"""
Database Query Caching Layer
Implements intelligent caching to reduce database load
"""

import logging
import hashlib
import json
import pickle
from typing import Any, Optional, Dict, Callable, Union
from functools import wraps
from datetime import datetime, timedelta
import asyncio
from threading import Lock

logger = logging.getLogger(__name__)

class QueryCache:
    """In-memory cache for database queries with TTL and LRU eviction"""
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: Dict[str, Dict] = {}
        self._access_order: Dict[str, datetime] = {}
        self._lock = Lock()
    
    def _generate_key(self, query: str, params: Dict = None) -> str:
        """Generate cache key from query and parameters"""
        key_data = {"query": query, "params": params or {}}
        key_string = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached result if not expired"""
        with self._lock:
            if key not in self._cache:
                return None
            
            entry = self._cache[key]
            now = datetime.utcnow()
            
            # Check if expired
            if now > entry['expires_at']:
                del self._cache[key]
                self._access_order.pop(key, None)
                return None
            
            # Update access order
            self._access_order[key] = now
            logger.debug(f"Cache HIT for key: {key[:8]}...")
            return entry['data']
    
    def set(self, key: str, data: Any, ttl: Optional[int] = None) -> None:
        """Set cached result with TTL"""
        with self._lock:
            # Evict oldest if at capacity
            if len(self._cache) >= self.max_size:
                self._evict_oldest()
            
            ttl = ttl or self.default_ttl
            expires_at = datetime.utcnow() + timedelta(seconds=ttl)
            
            self._cache[key] = {
                'data': data,
                'expires_at': expires_at,
                'created_at': datetime.utcnow()
            }
            self._access_order[key] = datetime.utcnow()
            
            logger.debug(f"Cache SET for key: {key[:8]}... (TTL: {ttl}s)")
    
    def _evict_oldest(self):
        """Evict the oldest accessed entry"""
        if not self._access_order:
            return
        
        oldest_key = min(self._access_order.keys(), 
                        key=lambda k: self._access_order[k])
        
        self._cache.pop(oldest_key, None)
        self._access_order.pop(oldest_key, None)
        logger.debug(f"Cache EVICTED key: {oldest_key[:8]}...")
    
    def clear(self):
        """Clear all cached entries"""
        with self._lock:
            self._cache.clear()
            self._access_order.clear()
            logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self._lock:
            now = datetime.utcnow()
            expired_count = sum(1 for entry in self._cache.values() 
                               if now > entry['expires_at'])
            
            return {
                "total_entries": len(self._cache),
                "max_size": self.max_size,
                "expired_entries": expired_count,
                "memory_usage_mb": len(pickle.dumps(self._cache)) / (1024 * 1024)
            }

# Global cache instance
query_cache = QueryCache(max_size=500, default_ttl=300)  # 5 minutes default

def cached_query(ttl: int = 300, cache_key_func: Optional[Callable] = None):
    """
    Decorator for caching database query results
    
    Args:
        ttl: Time to live in seconds
        cache_key_func: Custom function to generate cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if cache_key_func:
                cache_key = cache_key_func(*args, **kwargs)
            else:
                # Default key generation
                key_data = {
                    'func': func.__name__,
                    'args': str(args),
                    'kwargs': str(sorted(kwargs.items()))
                }
                cache_key = query_cache._generate_key(
                    json.dumps(key_data, default=str)
                )
            
            # Try to get from cache
            cached_result = query_cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            try:
                result = func(*args, **kwargs)
                query_cache.set(cache_key, result, ttl)
                return result
            except Exception as e:
                logger.error(f"Query execution failed: {e}")
                raise
        
        return wrapper
    return decorator

# Specialized cache functions for common query patterns

def cache_user_query(user_id: Union[str, int], query_type: str, ttl: int = 300):
    """Cache user-specific queries"""
    def cache_key_func(*args, **kwargs):
        return f"user:{user_id}:{query_type}:{hash(str(kwargs))}"
    
    return cached_query(ttl=ttl, cache_key_func=cache_key_func)

def cache_roadmap_query(roadmap_id: Union[str, int], ttl: int = 600):
    """Cache roadmap queries (longer TTL as they change less frequently)"""
    def cache_key_func(*args, **kwargs):
        return f"roadmap:{roadmap_id}:{hash(str(kwargs))}"
    
    return cached_query(ttl=ttl, cache_key_func=cache_key_func)

def invalidate_user_cache(user_id: Union[str, int]):
    """Invalidate all cached queries for a user"""
    with query_cache._lock:
        keys_to_remove = [
            key for key in query_cache._cache.keys() 
            if key.startswith(f"user:{user_id}:")
        ]
        
        for key in keys_to_remove:
            query_cache._cache.pop(key, None)
            query_cache._access_order.pop(key, None)
        
        logger.info(f"Invalidated {len(keys_to_remove)} cache entries for user {user_id}")
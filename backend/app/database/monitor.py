"""
Database Usage Monitoring and Rate Limiting
Tracks database usage to prevent quota exhaustion
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
from threading import Lock
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

@dataclass
class QueryMetric:
    timestamp: datetime
    query_type: str
    duration_ms: float
    table: str
    user_id: Optional[str] = None
    success: bool = True

class DatabaseMonitor:
    """Monitor database usage and enforce rate limits"""
    
    def __init__(self):
        self._query_history: deque = deque(maxlen=10000)
        self._user_query_counts: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self._global_query_count: deque = deque(maxlen=10000)
        self._lock = Lock()
        
        # Rate limiting configuration
        self.max_queries_per_minute = 60
        self.max_queries_per_hour = 1000
        self.max_user_queries_per_minute = 20
        self.max_connection_duration = 300  # 5 minutes
        
        # Usage tracking
        self._connection_times: Dict[str, datetime] = {}
        self._total_compute_time = 0.0
        self._start_time = datetime.utcnow()
    
    def track_query(self, query_type: str, duration_ms: float, table: str, 
                   user_id: Optional[str] = None, success: bool = True) -> None:
        """Track a database query execution"""
        with self._lock:
            now = datetime.utcnow()
            metric = QueryMetric(now, query_type, duration_ms, table, user_id, success)
            
            self._query_history.append(metric)
            self._global_query_count.append(now)
            
            if user_id:
                self._user_query_counts[user_id].append(now)
            
            self._total_compute_time += duration_ms / 1000  # Convert to seconds
            
            logger.debug(f"Tracked query: {query_type} on {table} ({duration_ms:.2f}ms)")
    
    def check_rate_limit(self, user_id: Optional[str] = None) -> Tuple[bool, str]:
        """Check if rate limits are exceeded"""
        with self._lock:
            now = datetime.utcnow()
            
            # Clean old entries
            self._cleanup_old_entries(now)
            
            # Check global rate limits
            queries_last_minute = sum(1 for t in self._global_query_count 
                                    if now - t <= timedelta(minutes=1))
            
            if queries_last_minute > self.max_queries_per_minute:
                return False, f"Global rate limit exceeded: {queries_last_minute}/min"
            
            queries_last_hour = sum(1 for t in self._global_query_count 
                                  if now - t <= timedelta(hours=1))
            
            if queries_last_hour > self.max_queries_per_hour:
                return False, f"Global hourly limit exceeded: {queries_last_hour}/hour"
            
            # Check user-specific rate limits
            if user_id and user_id in self._user_query_counts:
                user_queries_minute = sum(1 for t in self._user_query_counts[user_id] 
                                        if now - t <= timedelta(minutes=1))
                
                if user_queries_minute > self.max_user_queries_per_minute:
                    return False, f"User rate limit exceeded: {user_queries_minute}/min"
            
            return True, "OK"
    
    def _cleanup_old_entries(self, now: datetime) -> None:
        """Remove entries older than tracking window"""
        cutoff_time = now - timedelta(hours=2)
        
        # Clean global query count
        while self._global_query_count and self._global_query_count[0] < cutoff_time:
            self._global_query_count.popleft()
        
        # Clean user query counts
        for user_id in list(self._user_query_counts.keys()):
            user_queue = self._user_query_counts[user_id]
            while user_queue and user_queue[0] < cutoff_time:
                user_queue.popleft()
            
            # Remove empty queues
            if not user_queue:
                del self._user_query_counts[user_id]
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics"""
        with self._lock:
            now = datetime.utcnow()
            self._cleanup_old_entries(now)
            
            uptime = (now - self._start_time).total_seconds()
            
            # Query counts by time period
            queries_last_minute = sum(1 for t in self._global_query_count 
                                    if now - t <= timedelta(minutes=1))
            queries_last_hour = sum(1 for t in self._global_query_count 
                                  if now - t <= timedelta(hours=1))
            
            # Query types breakdown
            recent_queries = [q for q in self._query_history 
                            if now - q.timestamp <= timedelta(minutes=10)]
            
            query_types = defaultdict(int)
            table_usage = defaultdict(int)
            
            for q in recent_queries:
                query_types[q.query_type] += 1
                table_usage[q.table] += 1
            
            return {
                "uptime_seconds": uptime,
                "total_compute_time_seconds": self._total_compute_time,
                "compute_time_percentage": (self._total_compute_time / uptime * 100) if uptime > 0 else 0,
                "queries_last_minute": queries_last_minute,
                "queries_last_hour": queries_last_hour,
                "total_queries": len(self._query_history),
                "active_users": len(self._user_query_counts),
                "query_types": dict(query_types),
                "table_usage": dict(table_usage),
                "rate_limits": {
                    "max_queries_per_minute": self.max_queries_per_minute,
                    "max_queries_per_hour": self.max_queries_per_hour,
                    "max_user_queries_per_minute": self.max_user_queries_per_minute
                }
            }
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get usage statistics for a specific user"""
        with self._lock:
            now = datetime.utcnow()
            
            if user_id not in self._user_query_counts:
                return {"queries_last_minute": 0, "queries_last_hour": 0, "total_queries": 0}
            
            user_queries = self._user_query_counts[user_id]
            
            queries_minute = sum(1 for t in user_queries 
                               if now - t <= timedelta(minutes=1))
            queries_hour = sum(1 for t in user_queries 
                             if now - t <= timedelta(hours=1))
            
            return {
                "queries_last_minute": queries_minute,
                "queries_last_hour": queries_hour,
                "total_queries": len(user_queries),
                "rate_limit_remaining": max(0, self.max_user_queries_per_minute - queries_minute)
            }

# Global monitor instance
db_monitor = DatabaseMonitor()

def monitor_query(query_type: str = "unknown", table: str = "unknown"):
    """Decorator to monitor database query execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Check rate limits
            user_id = kwargs.get('user_id') or (args[0].supabase_uid if args and hasattr(args[0], 'supabase_uid') else None)
            
            allowed, reason = db_monitor.check_rate_limit(user_id)
            if not allowed:
                logger.warning(f"Rate limit exceeded: {reason}")
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: {reason}. Please try again later."
                )
            
            # Execute query with timing
            start_time = time.time()
            success = True
            
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                logger.error(f"Query failed: {e}")
                raise
            finally:
                duration_ms = (time.time() - start_time) * 1000
                db_monitor.track_query(query_type, duration_ms, table, user_id, success)
        
        return wrapper
    return decorator

# Context manager for monitoring database sessions
class MonitoredSession:
    """Context manager for monitoring database session usage"""
    
    def __init__(self, session, user_id: Optional[str] = None):
        self.session = session
        self.user_id = user_id
        self.start_time = time.time()
    
    def __enter__(self):
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        if duration > db_monitor.max_connection_duration:
            logger.warning(f"Long-running database session: {duration:.2f}s (user: {self.user_id})")
        
        db_monitor.track_query("session", duration * 1000, "connection", self.user_id, exc_type is None)
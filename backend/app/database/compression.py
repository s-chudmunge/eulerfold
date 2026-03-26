"""
Database compression and optimization utilities
Reduce data storage and transfer overhead
"""

import gzip
import json
import logging
from typing import Any, Dict, Optional, Union
import pickle
from datetime import datetime
from sqlalchemy import text
from sqlmodel import Session

logger = logging.getLogger(__name__)

class DataCompressor:
    """Handle data compression for database storage"""
    
    @staticmethod
    def compress_json(data: Union[Dict, list]) -> bytes:
        """Compress JSON data using gzip"""
        try:
            json_str = json.dumps(data, separators=(',', ':'), default=str)
            return gzip.compress(json_str.encode('utf-8'))
        except Exception as e:
            logger.error(f"JSON compression failed: {e}")
            raise
    
    @staticmethod
    def decompress_json(compressed_data: bytes) -> Union[Dict, list]:
        """Decompress gzipped JSON data"""
        try:
            json_str = gzip.decompress(compressed_data).decode('utf-8')
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"JSON decompression failed: {e}")
            raise
    
    @staticmethod
    def compress_text(text: str, level: int = 6) -> bytes:
        """Compress text data using gzip with specified compression level"""
        try:
            return gzip.compress(text.encode('utf-8'), compresslevel=level)
        except Exception as e:
            logger.error(f"Text compression failed: {e}")
            raise
    
    @staticmethod
    def decompress_text(compressed_data: bytes) -> str:
        """Decompress gzipped text data"""
        try:
            return gzip.decompress(compressed_data).decode('utf-8')
        except Exception as e:
            logger.error(f"Text decompression failed: {e}")
            raise
    
    @staticmethod
    def should_compress(data: str, min_size: int = 1000) -> bool:
        """Determine if data should be compressed based on size"""
        return len(data.encode('utf-8')) >= min_size

class QueryOptimizer:
    """Database query optimization utilities"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def analyze_table_stats(self, table_name: str) -> Dict[str, Any]:
        """Analyze table statistics for optimization"""
        try:
            # Get table size and row count
            stats_query = text(f"""
                SELECT 
                    pg_size_pretty(pg_total_relation_size('{table_name}')) as size,
                    pg_stat_get_tuples_returned(c.oid) as seq_scan,
                    pg_stat_get_tuples_fetched(c.oid) as index_scan,
                    reltuples as estimated_rows,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes
                FROM pg_class c
                LEFT JOIN pg_stat_user_tables s ON c.relname = s.relname
                WHERE c.relname = '{table_name}'
                AND c.relkind = 'r';
            """)
            
            result = self.session.exec(stats_query).first()
            if result:
                return {
                    "table_name": table_name,
                    "size": result[0],
                    "sequential_scans": result[1] or 0,
                    "index_scans": result[2] or 0,
                    "estimated_rows": int(result[3] or 0),
                    "inserts": result[4] or 0,
                    "updates": result[5] or 0,
                    "deletes": result[6] or 0
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to analyze table {table_name}: {e}")
            return {}
    
    def suggest_indexes(self, table_name: str) -> list[str]:
        """Suggest indexes based on query patterns"""
        try:
            # Get columns that might benefit from indexing
            suggestions = []
            
            # Check for foreign key columns without indexes
            fk_query = text(f"""
                SELECT 
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = '{table_name}';
            """)
            
            fk_results = self.session.exec(fk_query).all()
            for row in fk_results:
                column_name = row[0]
                # Check if index already exists
                index_check = text(f"""
                    SELECT indexname FROM pg_indexes 
                    WHERE tablename = '{table_name}' 
                    AND indexdef LIKE '%{column_name}%';
                """)
                
                existing = self.session.exec(index_check).first()
                if not existing:
                    suggestions.append(
                        f"CREATE INDEX idx_{table_name}_{column_name} ON {table_name}({column_name});"
                    )
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Failed to suggest indexes for {table_name}: {e}")
            return []
    
    def vacuum_analyze_table(self, table_name: str) -> bool:
        """Run VACUUM ANALYZE on a specific table"""
        try:
            # Note: VACUUM cannot be run in a transaction
            self.session.commit()  # Commit any pending transaction
            
            vacuum_query = text(f"VACUUM ANALYZE {table_name};")
            self.session.exec(vacuum_query)
            
            logger.info(f"VACUUM ANALYZE completed for table: {table_name}")
            return True
            
        except Exception as e:
            logger.error(f"VACUUM ANALYZE failed for table {table_name}: {e}")
            return False
    
    def get_slow_queries(self) -> list[Dict[str, Any]]:
        """Get slow query information (requires pg_stat_statements extension)"""
        try:
            slow_query = text("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements 
                WHERE mean_time > 100  -- queries taking more than 100ms on average
                ORDER BY mean_time DESC 
                LIMIT 10;
            """)
            
            results = self.session.exec(slow_query).all()
            return [
                {
                    "query": row[0],
                    "calls": row[1],
                    "total_time_ms": row[2],
                    "mean_time_ms": row[3],
                    "rows_returned": row[4]
                }
                for row in results
            ]
            
        except Exception as e:
            logger.warning(f"Could not retrieve slow queries (pg_stat_statements may not be enabled): {e}")
            return []

def optimize_json_field(data: Union[Dict, list, str], compress_threshold: int = 1000) -> Union[bytes, str]:
    """Optimize JSON field storage with conditional compression"""
    if isinstance(data, str):
        # Already serialized JSON string
        json_str = data
    else:
        # Serialize to JSON
        json_str = json.dumps(data, separators=(',', ':'), default=str)
    
    # Compress if above threshold
    if len(json_str.encode('utf-8')) >= compress_threshold:
        return DataCompressor.compress_text(json_str)
    
    return json_str

def restore_json_field(stored_data: Union[bytes, str]) -> Union[Dict, list]:
    """Restore JSON field from optimized storage"""
    if isinstance(stored_data, bytes):
        # Decompress and parse
        json_str = DataCompressor.decompress_text(stored_data)
        return json.loads(json_str)
    else:
        # Just parse JSON
        return json.loads(stored_data)

# Database maintenance functions

def run_maintenance_tasks(session: Session) -> Dict[str, Any]:
    """Run routine database maintenance tasks"""
    optimizer = QueryOptimizer(session)
    results = {
        "timestamp": datetime.utcnow().isoformat(),
        "tasks_completed": [],
        "suggestions": [],
        "errors": []
    }
    
    # List of important tables to maintain
    important_tables = [
        'user', 'userprogress', 'learningsession', 'roadmap'    ]
    
    for table in important_tables:
        try:
            # Analyze table
            stats = optimizer.analyze_table_stats(table)
            if stats:
                results["tasks_completed"].append(f"Analyzed {table}")
                
                # Suggest indexes if needed
                index_suggestions = optimizer.suggest_indexes(table)
                if index_suggestions:
                    results["suggestions"].extend(index_suggestions)
                
                # VACUUM ANALYZE if table has significant activity
                if stats.get("inserts", 0) + stats.get("updates", 0) + stats.get("deletes", 0) > 100:
                    if optimizer.vacuum_analyze_table(table):
                        results["tasks_completed"].append(f"VACUUM ANALYZE {table}")
                        
        except Exception as e:
            error_msg = f"Maintenance failed for {table}: {str(e)}"
            results["errors"].append(error_msg)
            logger.error(error_msg)
    
    return results
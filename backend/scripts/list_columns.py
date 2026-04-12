
import asyncio
import os
import sys

# Add app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.supabase_client import get_supabase_client

async def list_columns():
    supabase = get_supabase_client()
    tables = ["profiles", "roadmaps", "submissions", "learning_sessions", "user_skills"]
    
    for table in tables:
        print(f"\n--- Columns for table: {table} ---")
        try:
            # We can't easily get column names from Supabase Python client without a direct SQL query
            # but we can fetch one row and see the keys
            res = supabase.table(table).select("*").limit(1).execute()
            if res.data:
                for key in res.data[0].keys():
                    print(f"- {key}")
            else:
                print("No data found in table to infer columns.")
        except Exception as e:
            print(f"Error fetching from {table}: {e}")

if __name__ == "__main__":
    asyncio.run(list_columns())

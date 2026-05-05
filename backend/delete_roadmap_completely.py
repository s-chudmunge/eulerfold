import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.core.supabase_client import get_supabase_client

async def delete_roadmap():
    sb = get_supabase_client()
    roadmap_id = 1293
    slug = "book-recommendation-engine"
    
    print(f"Attempting to delete roadmap ID: {roadmap_id} (slug: {slug})")

    # The order of deletion matters if CASCADE is not set.
    # We'll try to delete the main roadmap entry. If it fails due to FK constraints,
    # we'll identify and delete dependents first.
    
    tables_to_clean = [
        "module_progress",
        "submissions",
        "practice_sessions",
        "practice_progress",
        "ratings",
        "clones"
    ]
    
    for table in tables_to_clean:
        try:
            res = sb.table(table).delete().eq("roadmap_id", roadmap_id).execute()
            print(f"Cleaned up {table}")
        except Exception as e:
            print(f"Skipping {table} or error: {e}")

    # Finally delete the roadmap itself
    try:
        res = sb.table("roadmaps").delete().eq("id", roadmap_id).execute()
        if res.data:
            print(f"Successfully deleted roadmap {roadmap_id}")
        else:
            print(f"Roadmap {roadmap_id} not found or already deleted.")
    except Exception as e:
        print(f"Error deleting roadmap: {e}")

if __name__ == "__main__":
    asyncio.run(delete_roadmap())

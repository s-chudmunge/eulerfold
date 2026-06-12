import asyncio
import os
import sys
import time

# Move to backend app directory to allow correct imports
os.chdir("backend/app")
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from core.supabase_client import get_admin_supabase_client
from ddgs import DDGS
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_roadmaps():
    sb = get_admin_supabase_client()
    logger.info("Fetching public roadmaps...")
    
    # Fetch roadmaps where is_public = true
    res = sb.table("roadmaps").select("id, title, roadmap_plan").eq("is_public", True).execute()
    roadmaps = res.data
    logger.info(f"Found {len(roadmaps)} public roadmaps")

    with DDGS() as ddgs:
        for r in roadmaps:
            roadmap_plan = r["roadmap_plan"]
            if not roadmap_plan or "modules" not in roadmap_plan:
                continue
            
            modified = False
            for module in roadmap_plan["modules"]:
                search_query = module.get("optimal_search_query")
                
                # If there's no optimal_search_query, let's create a fallback one using module title
                if not search_query:
                    search_query = f"{roadmap_plan.get('title', '')} {module.get('title', '')} tutorial".strip()
                    
                logger.info(f"Searching DDG for: {search_query}")
                try:
                    # Execute synchronous ddg search within a thread if needed, or just block here
                    ddg_results = list(ddgs.text(search_query, max_results=3))
                    if ddg_results:
                        new_resources = [{"title": res["title"], "url": res["href"], "type": "article"} for res in ddg_results]
                        module["resources"] = new_resources
                        modified = True
                        logger.info(f"Updated resources for module '{module.get('title', '')}'")
                except Exception as e:
                    logger.error(f"Failed DDG search: {e}")
                
                # Sleep a bit to avoid rate limits
                time.sleep(2)
                
            if modified:
                logger.info(f"Updating roadmap '{r['title']}' ({r['id']}) in DB")
                try:
                    update_res = sb.table("roadmaps").update({"roadmap_plan": roadmap_plan}).eq("id", r["id"]).execute()
                    logger.info(f"Update response data length: {len(update_res.data)}")
                except Exception as e:
                    logger.error(f"Update failed: {e}")
                
    logger.info("Done fixing roadmaps.")

if __name__ == "__main__":
    asyncio.run(fix_roadmaps())

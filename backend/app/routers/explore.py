import logging
import os
import httpx
import asyncio
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.supabase_client import get_supabase_client
from app.schemas import ExploreRoadmap, VisibilityUpdate, ReportCreate, RoadmapMe, User, RatingCreate
from app.core.coins import EulerCoins
from app.utils.eulercoins import award_coins
from app.core.auth import get_current_user
from app.routers.optional_auth import get_optional_current_user
from app.utils.search import clean_search_query, get_search_keywords
from app.routers.roadmaps import _generate_unique_slug

logger = logging.getLogger(__name__)
router = APIRouter()

async def ping_google_sitemap():
    # ... (rest of ping_google_sitemap)
    pass

@router.get("/explore", response_model=List[ExploreRoadmap])
async def explore_roadmaps(
    search: Optional[str] = None, 
    page: int = 0, 
    limit: int = 20,
    sort_by: str = "newest", # newest, highest_rated, most_cloned
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """List public roadmaps for discovery with server-side search."""
    sb = get_supabase_client()
    email = current_user.email if current_user else None
    
    # Retry logic for flakiness
    max_retries = 2
    last_error = None
    
    response = None
    for attempt in range(max_retries + 1):
        try:
            query = sb.table("roadmaps") \
                .select("id, title, slug, subject, goal, time_value, time_unit, clone_count, average_rating, rating_count, show_author, email, roadmap_plan, created_at") \
                .eq("is_public", True) \
                .lt("report_count", 3)
            
            if search:
                cleaned = clean_search_query(search)
                keywords = get_search_keywords(search)
                
                if cleaned:
                    # Construct a robust OR filter for all keywords across title, subject, and goal
                    # This handles natural language like "I want to learn python" -> "python"
                    or_parts = [
                        f"title.ilike.%{cleaned}%",
                        f"subject.ilike.%{cleaned}%",
                        f"goal.ilike.%{cleaned}%"
                    ]
                    
                    # Also search for individual keywords to be more permissive
                    for kw in keywords:
                        if kw.lower() != cleaned.lower(): # Avoid redundancy
                            or_parts.append(f"title.ilike.%{kw}%")
                            or_parts.append(f"subject.ilike.%{kw}%")
                            or_parts.append(f"goal.ilike.%{kw}%")
                    
                    query = query.or_(",".join(or_parts))
            
            if sort_by == "highest_rated":
                query = query.order("average_rating", desc=True).order("rating_count", desc=True)
            elif sort_by == "most_cloned":
                query = query.order("clone_count", desc=True)
            else:
                query = query.order("created_at", desc=True)
                
            response = query.range(page * limit, (page + 1) * limit - 1) \
                .execute()
            
            # If successful, break the retry loop
            break
        except Exception as e:
            last_error = e
            logger.warning(f"Explore search attempt {attempt + 1} failed: {e}")
            if attempt < max_retries:
                await asyncio.sleep(1) # Small delay before retry
            else:
                logger.error(f"All explore search attempts failed: {e}")
                raise HTTPException(status_code=500, detail="Database connection timeout. Please try again.")
    
    if not response or not response.data:
        return []

    # 1. Fetch usernames for these roadmaps to avoid email-derived fallbacks
    emails = list(set(r.get("email") for r in response.data if r.get("email")))
    username_map = {}
    if emails:
        try:
            profile_res = sb.table("profiles").select("email, username").in_("email", emails).execute()
            for p in profile_res.data:
                if p.get("username"):
                    username_map[p["email"]] = p["username"]
        except Exception as e:
            logger.warning(f"Failed to fetch usernames for explore: {e}")

    # 2. If logged in, fetch user's roadmaps to check ownership/clone status
    owned_ids = set()
    cloned_from_ids = set()
    if email:
        user_roadmaps = sb.table("roadmaps").select("id, cloned_from").eq("email", email).execute()
        for ur in user_roadmaps.data:
            owned_ids.add(ur["id"])
            if ur.get("cloned_from"):
                cloned_from_ids.add(ur["cloned_from"])

    results = []
    cleaned_query = clean_search_query(search) if search else ""
    keywords = get_search_keywords(search) if search else []

    for r in response.data:
        # Calculate Relevance Score
        relevance_score = 0
        if search:
            title_lower = r["title"].lower()
            subject_lower = (r.get("subject") or "").lower()
            goal_lower = (r.get("goal") or "").lower()

            # 1. Exact title match (highest)
            if cleaned_query == title_lower:
                relevance_score += 1000
            
            # 2. Cleaned query contained in title
            elif cleaned_query in title_lower:
                relevance_score += 500
            
            # 3. Individual keyword matches
            for kw in keywords:
                kw_l = kw.lower()
                if kw_l in title_lower:
                    relevance_score += 100 # Keyword in title
                if kw_l in subject_lower:
                    relevance_score += 30  # Keyword in subject
                if goal_lower and kw_l in goal_lower:
                    relevance_score += 10  # Keyword in goal

        # Only count modules and topics that are NOT extensions for the public explore view
        plan = r.get("roadmap_plan", {})
        if isinstance(plan, str):
            try:
                plan = json.loads(plan)
            except:
                plan = {}

        modules = plan.get("modules", [])
        public_modules = [m for m in modules if not m.get("is_extension")]

        week_count = len(public_modules)
        topic_count = sum(len(m.get("topics", [])) for m in public_modules)

        r_email = r.get("email")
        username = username_map.get(r_email)
        
        author = "Anonymous"
        if r.get("show_author") and r_email:
            if username:
                author = username
            else:
                # Fallback to email prefix ONLY if username is absolutely missing
                email_part = r_email.split("@")[0]
                raw_name = email_part.split(".")[0]
                if len(raw_name) >= 2:
                    author = raw_name.capitalize()
                else:
                    author = "EulerFold User"

        rid = r["id"]
        # Ensure strict boolean to avoid Pydantic validation errors when email is None
        is_owner = bool(rid in owned_ids or (email and r.get("email", "").lower() == email.lower()))
        is_cloned = rid in cloned_from_ids
            
        results.append({
            "data": ExploreRoadmap(
                id=rid,
                title=r["title"],
                slug=r.get("slug", ""),
                username=username,
                subject=r.get("subject"),
                goal=r.get("goal"),
                time_value=r.get("time_value"),
                time_unit=r.get("time_unit"),
                clone_count=r.get("clone_count", 0),
                average_rating=float(r.get("average_rating") or 0.0),
                rating_count=r.get("rating_count", 0),
                author=author,
                week_count=week_count,
                topic_count=topic_count,
                created_at=r["created_at"],
                is_owner=is_owner,
                is_cloned=is_cloned
            ),
            "relevance": relevance_score,
            "rating": float(r.get("average_rating") or 0.0),
            "clones": r.get("clone_count", 0),
            "created_at": r["created_at"]
        })
    
    # Sort the results
    if search and sort_by == "newest":
        # If searching, relevance is the primary sort, then quality (rating), then recency
        results.sort(key=lambda x: (x["relevance"], x["rating"], x["created_at"]), reverse=True)
    elif sort_by == "highest_rated":
        results.sort(key=lambda x: (x["rating"], x["relevance"]), reverse=True)
    elif sort_by == "most_cloned":
        results.sort(key=lambda x: (x["clones"], x["relevance"]), reverse=True)
    else:
        # Default newest
        results.sort(key=lambda x: x["created_at"], reverse=True)

    return [r["data"] for r in results]

@router.post("/roadmaps/{id}/clone", response_model=Dict[str, Any])
async def clone_roadmap(id: int, current_user: User = Depends(get_current_user)):
    """Clone a public roadmap to the current user's collection."""
    cloner_email = current_user.email
    sb = get_supabase_client()
    
    # 1. Fetch original roadmap
    orig_res = sb.table("roadmaps").select("*").eq("id", id).execute()
    if not orig_res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    orig = orig_res.data[0]
    orig_slug = orig.get("slug")

    # 2. Safety: If user already owns THIS specific roadmap record
    if orig.get("email", "").lower() == cloner_email.lower():
        return {
            "status": "success", 
            "new_id": orig["id"], 
            "new_slug": orig["slug"],
            "message": "You already own this roadmap."
        }

    # 3. Check if user already has a roadmap with this slug (either original or another clone)
    # This respects the constraint that a user can only have one roadmap per slug.
    existing_by_slug = sb.table("roadmaps").select("id, slug").eq("email", cloner_email).eq("slug", orig_slug).execute()
    if existing_by_slug.data:
        return {
            "status": "success", 
            "new_id": existing_by_slug.data[0]["id"], 
            "new_slug": existing_by_slug.data[0]["slug"],
            "message": "You already have this roadmap in your dashboard."
        }

    # 4. Check if user already cloned THIS specific roadmap record before (redundant but safe)
    existing_clone = sb.table("roadmaps").select("id, slug").eq("email", cloner_email).eq("cloned_from", id).execute()
    if existing_clone.data:
        return {
            "status": "success", 
            "new_id": existing_clone.data[0]["id"], 
            "new_slug": existing_clone.data[0]["slug"],
            "message": "You already have this roadmap in your dashboard."
        }

    if not orig.get("is_public") and orig.get("email") != cloner_email:
        raise HTTPException(status_code=403, detail="Cannot clone private roadmap")
    
    # 5. Create new row with cloner's email
    title = orig["title"]
    slug = orig_slug # Strictly reuse the original slug for consistency
    
    # Filter out extensions from roadmap_plan if they exist
    plan = orig.get("roadmap_plan", {})
    if isinstance(plan, str):
        try:
            plan = json.loads(plan)
        except json.JSONDecodeError:
            plan = {}
            
    time_value = orig.get("time_value", 0)
    if "modules" in plan:
        original_count = len(plan["modules"])
        plan["modules"] = [m for m in plan["modules"] if not m.get("is_extension")]
        filtered_count = len(plan["modules"])
        
        # Adjust time_value if we removed modules
        if filtered_count < original_count:
            removed_count = original_count - filtered_count
            time_value = max(1, (time_value or 0) - removed_count)

    new_roadmap_data = {
        "email": cloner_email,
        "title": title,
        "slug": slug,
        "description": orig.get("description"),
        "roadmap_plan": plan,
        "subject": orig.get("subject"),
        "goal": orig.get("goal"),
        "time_value": time_value,
        "time_unit": orig.get("time_unit"),
        "model": orig.get("model"),
        "cloned_from": id,
        "is_public": False, 
        "last_position": {"mIdx": 0, "tIdx": 0},
        "extension_count": 0,
        "status": "active"
    }
    
    new_res = sb.table("roadmaps").insert(new_roadmap_data).execute()
    if not new_res.data:
        raise HTTPException(status_code=500, detail="Failed to create clone")
    
    new_record = new_res.data[0]
    new_id = new_record["id"]
    new_slug = new_record["slug"]
    
    # 6. Increment clone_count on original atomically
    try:
        sb.rpc("increment_clone_count", {"row_id": id}).execute()
        # Award coins to original owner
        if orig.get("email"):
            await award_coins(
                orig["email"], 
                EulerCoins.ROADMAP_CLONED, 
                f"Your roadmap '{orig['title']}' was cloned", 
                roadmap_id=id
            )
    except Exception as e:
        logger.error(f"Failed to increment clone count or award coins: {e}")
    
    return {"status": "success", "new_id": new_id, "new_slug": new_slug}

@router.post("/roadmaps/{id}/report")
async def report_roadmap(id: int, report: ReportCreate, current_user: User = Depends(get_current_user)):
    """Report a roadmap for inappropriate content."""
    email = current_user.email
    sb = get_supabase_client()
    
    # 1. Insert into roadmap_reports
    sb.table("roadmap_reports").insert({
        "roadmap_id": id,
        "reporter_email": email,
        "reason": report.reason
    }).execute()
    
    # 2. Increment report_count on roadmap atomically
    try:
        sb.rpc("increment_report_count", {"row_id": id}).execute()
    except Exception as e:
        logger.error(f"Failed to increment report count: {e}")
            
    return {"status": "ok"}

@router.post("/roadmaps/{id}/rate")
async def rate_roadmap(id: int, rating: RatingCreate, current_user: User = Depends(get_current_user)):
    """Rate a public roadmap."""
    user_id = current_user.supabase_uid
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    sb = get_supabase_client()
    
    # 1. Verify roadmap is public
    check_res = sb.table("roadmaps").select("is_public").eq("id", id).execute()
    if not check_res.data or not check_res.data[0]["is_public"]:
        raise HTTPException(status_code=404, detail="Public roadmap not found")

    # 2. Insert or update rating
    try:
        sb.table("roadmap_ratings").upsert({
            "roadmap_id": id,
            "user_id": user_id,
            "rating": rating.rating,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).execute()
        
    except Exception as e:
        logger.error(f"Failed to submit rating: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit rating")
            
    return {"status": "success"}

@router.patch("/roadmaps/{id}/visibility")
async def update_visibility(id: int, update: VisibilityUpdate, current_user: User = Depends(get_current_user)):
    """Update privacy and author display settings."""
    email = current_user.email
    sb = get_supabase_client()
    
    # 1. Fetch current visibility before update
    check_res = sb.table("roadmaps").select("email, is_public, title").eq("id", id).execute()
    if not check_res.data or check_res.data[0]["email"] != email:
        raise HTTPException(status_code=403, detail="Not authorized to update this roadmap")
    
    was_already_public = check_res.data[0].get("is_public", False)
    is_public = update.is_public
    
    if was_already_public and not is_public:
        raise HTTPException(status_code=400, detail="Public roadmaps cannot be made private to maintain link consistency.")
    
    # Log the visibility update for debugging
    logger.info(f"Visibility update: id={id}, is_public={is_public}, was_already_public={was_already_public}")
    print(f"Visibility update: is_public={is_public}, was_already_public={was_already_public}")

    # 2. Update visibility in the database
    sb.table("roadmaps").update({
        "is_public": is_public,
        "show_author": update.show_author
    }).eq("id", id).execute()

    # 3. Award coins and ping Google if transitioned to public
    if is_public:
        # Ping Google (fire-and-forget)
        asyncio.create_task(ping_google_sitemap())
        
        if not was_already_public:
            await award_coins(
                email, 
                EulerCoins.SHARE_ROADMAP, 
                f"Shared roadmap '{check_res.data[0]['title']}' with the community", 
                roadmap_id=id
            )
    
    return {"status": "success"}

@router.get("/explore/{id}")
async def get_public_roadmap(
    id: int,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Fetch a public roadmap's details for preview without authentication."""
    sb = get_supabase_client()
    email = current_user.email if current_user else None
    
    # Query roadmap but verify it is public and not hidden by reports
    # We include show_author and email in select to compute author but exclude them from final response
    response = sb.table("roadmaps") \
        .select("id, title, slug, description, roadmap_plan, subject, goal, time_value, time_unit, model, show_author, email, clone_count, average_rating, rating_count, created_at, updated_at") \
        .eq("id", id) \
        .eq("is_public", True) \
        .lt("report_count", 3) \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Public roadmap not found")
    
    r = response.data[0]
    r_email = r.get("email")
    
    # Ownership check
    is_owner = email and r_email and r_email.lower() == email.lower()

    # If it's a non-owner viewing, filter out extensions from roadmap_plan
    if not is_owner:
        plan = r.get("roadmap_plan", {})
        if isinstance(plan, str):
            try:
                plan = json.loads(plan)
            except:
                plan = {}
        
        if "modules" in plan:
            original_count = len(plan["modules"])
            plan["modules"] = [m for m in plan["modules"] if not m.get("is_extension")]
            filtered_count = len(plan["modules"])
            
            # Adjust time_value if we removed modules
            if filtered_count < original_count:
                removed_count = original_count - filtered_count
                r["time_value"] = max(1, (r.get("time_value", 0) or 0) - removed_count)
            
            r["roadmap_plan"] = plan

    # Compute author name using username if available
    author = "Anonymous"
    username = None
    if r_email:
        profile_res = sb.table("profiles").select("username").eq("email", r_email).execute()
        if profile_res.data and profile_res.data[0].get("username"):
            username = profile_res.data[0]["username"]

    if r.get("show_author") and r_email:
        if username:
            author = username
        else:
            email_part = r_email.split("@")[0]
            raw_name = email_part.split(".")[0]
            if len(raw_name) >= 2:
                author = raw_name.capitalize()
            else:
                author = "EulerFold User"

    # Clone check
    is_cloned = False
    if email and not is_owner:
        clone_check = sb.table("roadmaps").select("id").eq("email", email).eq("cloned_from", id).execute()
        if clone_check.data:
            is_cloned = True
    
    # Fetch user's own rating if authenticated
    user_rating = None
    if email:
        rating_res = sb.table("roadmap_ratings").select("rating").eq("roadmap_id", id).eq("user_id", current_user.supabase_uid).execute()
        if rating_res.data:
            user_rating = rating_res.data[0]["rating"]

    # Remove sensitive fields and metadata used for processing
    r.pop("email", None)
    r.pop("show_author", None)
    r["author"] = author
    r["username"] = username
    r["is_owner"] = is_owner
    r["is_cloned"] = is_cloned
    r["user_rating"] = user_rating
        
    return r

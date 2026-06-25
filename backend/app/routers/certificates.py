from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
import uuid
import logging
from datetime import datetime

from app.core.supabase_client import get_supabase_client
from app.utils.certificates import generate_certificate_pdf
from app.utils.scoring import get_letter_grade

router = APIRouter()
logger = logging.getLogger(__name__)

def generate_and_store_certificate(user_id: str, roadmap_id: int):
    sb = get_supabase_client()
    
    # Check if certificate already exists
    cert_check = sb.table("certificates").select("id").eq("user_id", user_id).eq("roadmap_id", roadmap_id).execute()
    if cert_check.data:
        logger.info(f"Certificate already exists for user {user_id} and roadmap {roadmap_id}")
        return

    # Fetch User Profile
    profile_res = sb.table("profiles").select("display_name, username, avatar_url").eq("supabase_uid", user_id).single().execute()
    if not profile_res.data:
        logger.error(f"Profile not found for user {user_id}")
        return
    # Fetch full name from Auth metadata if available
    auth_name = None
    try:
        auth_user = sb.auth.admin.get_user_by_id(user_id)
        user_meta = auth_user.user.user_metadata
        auth_name = user_meta.get("full_name") or user_meta.get("name")
    except Exception as e:
        logger.warning(f"Could not fetch auth user details for {user_id}: {e}")
        
    user_name = auth_name or profile_res.data.get("display_name") or profile_res.data.get("username", "Anonymous User")
    avatar_url = profile_res.data.get("avatar_url")
    username_handle = profile_res.data.get("username")
    profile_url = f"www.eulerfold.com/u/{username_handle}" if username_handle else None

    # Fetch Roadmap
    r_res = sb.table("roadmaps").select("title, subject, time_value").eq("id", roadmap_id).single().execute()
    if not r_res.data:
        logger.error(f"Roadmap not found {roadmap_id}")
        return
    
    # Use full roadmap name
    roadmap_title = r_res.data.get("title") or r_res.data.get("subject", "Roadmap")
    
    # Calculate Grade from user_skills
    us_res = sb.table("user_skills").select("confidence_score").eq("user_id", user_id).filter("contributing_roadmap_ids", "cs", f"{{{roadmap_id}}}").execute()
    
    scores = []
    if us_res.data:
        for us in us_res.data:
            scores.append(us.get("confidence_score", 0.0))
        avg_score = sum(scores) / len(scores) if scores else 0.0
    else:
        avg_score = 0.0
        
    grade = get_letter_grade(avg_score)
    
    # Calculate accurate time invested from learning sessions
    ls_res = sb.table("learning_sessions").select("duration_seconds").eq("user_id", user_id).execute()
    if ls_res.data and len(ls_res.data) > 0:
        time_invested = sum(ls.get("duration_seconds", 0) for ls in ls_res.data) / 3600.0
    else:
        # Fallback to defaults if no sessions found
        time_invested = float(r_res.data.get("time_value", 0)) * 5.0

    credential_id = f"EF-{datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"
    issue_date = datetime.now()

    # Generate PDF
    pdf_bytes = generate_certificate_pdf(user_name, roadmap_title, grade, time_invested, issue_date, credential_id, avatar_url, profile_url)
    
    # Upload to Supabase Storage
    # Assuming bucket 'certificates' exists
    file_path = f"{user_id}/{credential_id}.pdf"
    try:
        sb.storage.from_("certificates").upload(
            path=file_path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
        pdf_url = sb.storage.from_("certificates").get_public_url(file_path)
    except Exception as e:
        logger.error(f"Failed to upload certificate PDF for {user_id}: {e}")
        pdf_url = None

    # Save to Database
    cert_data = {
        "user_id": user_id,
        "roadmap_id": roadmap_id,
        "credential_id": credential_id,
        "grade": grade,
        "average_score": avg_score,
        "time_invested_hours": time_invested,
        "pdf_url": pdf_url
    }
    
    try:
        sb.table("certificates").insert(cert_data).execute()
        logger.info(f"Certificate {credential_id} generated for {user_id}")
    except Exception as e:
        logger.error(f"Failed to insert certificate into DB: {e}")

@router.get("/{credential_id}")
async def get_certificate(credential_id: str):
    sb = get_supabase_client()
    res = sb.table("certificates").select("*, roadmaps(title, subject)").eq("credential_id", credential_id).single().execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    data = res.data
    user_name = "Anonymous User"
    
    if data.get("user_id"):
        prof_res = sb.table("profiles").select("display_name, username").eq("supabase_uid", data["user_id"]).maybe_single().execute()
        if prof_res.data:
            user_name = prof_res.data.get("display_name") or prof_res.data.get("username") or "Anonymous User"

    # Re-map fields
    return {
        "id": data["id"],
        "user_id": data["user_id"],
        "roadmap_id": data["roadmap_id"],
        "credential_id": data["credential_id"],
        "grade": data["grade"],
        "average_score": data["average_score"],
        "time_invested_hours": data["time_invested_hours"],
        "pdf_url": data["pdf_url"],
        "issued_at": data["issued_at"],
        "roadmap_title": data.get("roadmaps", {}).get("title"),
        "roadmap_subject": data.get("roadmaps", {}).get("subject"),
        "user_name": user_name
    }

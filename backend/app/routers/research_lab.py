import logging
import asyncio
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Body, BackgroundTasks
from app.core.supabase_client import get_supabase_client
from app.core.auth import get_current_user
from app.schemas import User
from app.utils.ai_client import robust_json_loads, generate_text, log_backend_ai_usage
from app.core.config import settings
from app.routers.payments import check_and_revoke_pro_if_no_credits

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/research-lab", tags=["Research Lab"])

async def _fetch_pdf_content(url: str) -> Optional[bytes]:
    """Internal helper to fetch PDF bytes with proper headers and timeouts."""
    import httpx
    if "arxiv.org/abs/" in url:
        url = url.replace("arxiv.org/abs/", "arxiv.org/pdf/")
        if not url.endswith(".pdf"):
            url += ".pdf"
            
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/pdf,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
    timeout = httpx.Timeout(connect=15.0, read=60.0, write=15.0, pool=15.0)
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.content
        except Exception as e:
            logger.warning(f"PDF fetch attempt {attempt + 1} failed for {url}: {e}")
            if attempt == 0:
                await asyncio.sleep(1)
    return None

async def run_research_analysis(decode_id: str, paper_url: str, uid: str):
    """
    Background task to perform the paper analysis using modern google-genai SDK.
    """
    import time
    t0 = time.time()
    sb = get_supabase_client()
    logger.info(f"[ResearchLab] Starting analysis {decode_id[:8]}... | URL: {paper_url[:80]}")
    try:
        sb.table("research_lab_decodes").update({"status": "processing"}).eq("id", decode_id).execute()
        
        pdf_bytes = await _fetch_pdf_content(paper_url)
        if not pdf_bytes:
            raise Exception("Could not retrieve paper content from the provided URL.")
        logger.info(f"[ResearchLab] PDF fetched — {len(pdf_bytes) / 1024:.0f} KB, {time.time() - t0:.1f}s")

        import io
        from pypdf import PdfReader
        
        reader = PdfReader(io.BytesIO(pdf_bytes))
        paper_text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                paper_text += extracted + "\n\n"
        
        paper_text = paper_text[:60000]
        logger.info(f"[ResearchLab] Text extracted — {len(reader.pages)} pages, {len(paper_text)} chars")

        # Streamlined prompt — no extracted_text echo, cleaner schema for free models
        prompt = """You are a Technical Consultant. Deconstruct this paper into a structured Engineering Dossier.

TASK:
1. Identify paper archetype: Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering.
2. Extract metadata: title, authors, year.
3. Create 5-6 technical modules.

REQUIRED MODULES (always include these 3):
- "The Shift": {"before": "old approach", "after": "new approach", "the_win": "core advantage"}
- "Logic": {"details": "step-by-step technical logic in Markdown. Use $...$ for inline math and $$...$$ for block math."}
- "Realities": {"items": ["gotcha 1", "gotcha 2", ...]}

OPTIONAL MODULES (pick 2-3 based on archetype):
- "Concept": {"details": "core architecture/mechanism breakdown in Markdown"}
- "Math": {"math": [{"formula": "$LaTeX$", "action": "what it computes", "intuition": "why it matters"}]}
- "Blueprint": {"details": "system design / implementation details in Markdown"}
- "Benchmarks": {"items": ["result 1", "result 2", ...]}

MATH RULE: Always use $...$ for inline math and $$...$$ for block math. Never use bare LaTeX.
STYLE: Plain English. Technical precision. No fluff. No filler.

Return ONLY this JSON structure:
{
    "paper_title": "Clean Title",
    "authors": ["Author 1", "Author 2"],
    "year": "202X",
    "archetype": "identified type",
    "modules": [
        {"id": "shift", "label": "The Shift", "data": {"before": "...", "after": "...", "the_win": "..."}},
        {"id": "logic", "label": "Logic", "data": {"details": "..."}},
        {"id": "realities", "label": "Realities", "data": {"items": ["..."]}}
    ],
    "summary": "2-3 sentence technical synthesis"
}
""" + f"\n\nPAPER CONTENT:\n{paper_text}\n"
        
        response_text, usage = await generate_text(prompt, model=settings.DEFAULT_ROADMAP_MODEL, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, uid, "Research Lab Analysis (Cost: 1.0 Credits)", usage, source="backend")

        if not response_text:
            raise Exception("AI failed to return a valid analysis.")

        data = robust_json_loads(response_text)
        
        # The response is the analysis directly (no nested "analysis" wrapper)
        # Handle both formats: direct or wrapped in "analysis" key
        if "analysis" in data and isinstance(data["analysis"], dict):
            decoded_data = data["analysis"]
        elif "modules" in data:
            decoded_data = data
        else:
            decoded_data = data
        
        module_count = len(decoded_data.get("modules", []))
        title = decoded_data.get("paper_title", "Untitled")
        
        sb.table("research_lab_decodes").update({
            "paper_title": decoded_data.get("paper_title", "Untitled Paper"),
            "core_analysis": decoded_data,
            "extracted_text": paper_text[:15000],
            "status": "completed",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", decode_id).execute()
        
        elapsed = time.time() - t0
        logger.info(f"[ResearchLab] ✓ Completed {decode_id[:8]} — \"{title}\" | {module_count} modules | {elapsed:.1f}s total")

    except Exception as e:
        logger.error(f"Research Lab Background Task Failed for {decode_id}: {e}")
        sb.table("research_lab_decodes").update({
            "status": "failed",
            "error_message": str(e),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", decode_id).execute()
        
        # Refund the 1.0 credit on failure
        try:
            profile_res = sb.table("profiles").select("roadmap_credits").eq("id", uid).single().execute()
            if profile_res.data:
                current_credits = float(profile_res.data.get("roadmap_credits", 0))
                sb.table("profiles").update({"roadmap_credits": current_credits + 1.0}).eq("id", uid).execute()
                logger.info(f"Refunded 1.0 credit to user {uid} after failed analysis {decode_id}")
        except Exception as refund_err:
            logger.error(f"Failed to refund credit for {decode_id}: {refund_err}")


@router.post("/decodes/{decode_id}/chat")
async def lab_chat(decode_id: str, payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    # Pro check
    if not current_user.is_pro:
        raise HTTPException(status_code=403, detail="The technical peer is only available for Pro members.")

    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="Missing message")

    sb = get_supabase_client()
    res = sb.table("research_lab_decodes").select("extracted_text, core_analysis").eq("id", decode_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    paper_context = res.data[0]
    history_res = sb.table("research_lab_messages")\
        .select("role, content")\
        .eq("decode_id", decode_id)\
        .order("created_at", desc=True)\
        .limit(10)\
        .execute()
    
    history = history_res.data[::-1]
    
    prompt = f"""
    You are a Technical Peer helping a researcher understand an academic paper.
    
    CONTEXT:
    Paper Analysis: {json.dumps(paper_context['core_analysis'])}
    Full Text Excerpt: {paper_context['extracted_text'][:15000]}
    
    RULES:
    - BE EXTREMELY CONCISE AND BRIEF.
    - DO NOT provide long explanations unless explicitly asked for a deep dive.
    - BE PLAIN AND DIRECT. No fluff.
    - BE GROUNDED. Only answer based on the paper or established math/science.
    - BE TECHNICAL.
    
    DIALOGUE HISTORY:
    {json.dumps(history)}
    
    USER QUESTION: {user_message}
    """

    try:
        bot_response = await generate_text(prompt, model=settings.DEFAULT_FEEDBACK_MODEL)
        
        sb.table("research_lab_messages").insert([
            {"decode_id": decode_id, "user_id": current_user.supabase_uid, "role": "user", "content": user_message},
            {"decode_id": decode_id, "user_id": current_user.supabase_uid, "role": "assistant", "content": bot_response}
        ]).execute()
        
        return {"response": bot_response}
        
    except Exception as e:
        logger.error(f"Lab Chat Error: {e}")
        raise HTTPException(status_code=500, detail="The technical peer is unavailable right now.")

@router.get("/decodes/{decode_id}/messages")
async def get_chat_messages(decode_id: str, current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    res = sb.table("research_lab_messages")\
        .select("*")\
        .eq("decode_id", decode_id)\
        .order("created_at", desc=False)\
        .execute()
    return res.data or []

@router.post("/decode")
async def start_analysis(background_tasks: BackgroundTasks, payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    paper_url = payload.get("paper_url")
    if not paper_url:
        raise HTTPException(status_code=400, detail="Missing paper_url")
        
    if not current_user.is_pro:
        raise HTTPException(status_code=403, detail="Research Lab is a Pro feature.")
        
    email = current_user.email
    sb = get_supabase_client()
    
    profile_res = sb.table("profiles").select("roadmap_credits").eq("email", email).single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    credits = float(profile_res.data.get("roadmap_credits", 0))
    if credits < 1.0:
        raise HTTPException(status_code=402, detail="Insufficient credits. Analyzing a paper costs 1.0 credit.")
        
    new_credits = credits - 1.0
    sb.table("profiles").update({"roadmap_credits": new_credits}).eq("email", email).execute()
    if new_credits <= 0:
        await check_and_revoke_pro_if_no_credits(email, sb)
    
    new_decode = {
        "user_id": current_user.supabase_uid,
        "email": email,
        "paper_url": paper_url,
        "status": "pending"
    }
    
    ins_res = sb.table("research_lab_decodes").insert(new_decode).execute()
    if not ins_res.data:
        sb.table("profiles").update({"roadmap_credits": credits}).eq("email", email).execute()
        raise HTTPException(status_code=500, detail="Failed to initialize analysis session")
        
    decode_id = ins_res.data[0]["id"]
    background_tasks.add_task(run_research_analysis, decode_id, paper_url, current_user.supabase_uid)
    return {"id": decode_id, "status": "pending", "message": "Analysis started in background."}

@router.post("/extract")
async def extract_paper_text(payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    """Used by Local AI and OpenRouter to get paper text."""
    if not current_user.is_pro:
        raise HTTPException(status_code=403, detail="Research Lab is a Pro feature.")
        
    paper_url = payload.get("paper_url")
    if not paper_url:
        raise HTTPException(status_code=400, detail="Missing paper_url")
        
    pdf_bytes = await _fetch_pdf_content(paper_url)
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Could not retrieve paper content from the provided URL.")
        
    import io
    from pypdf import PdfReader
    
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n\n"
        
        # Limit text length to avoid token limits for local models
        # Roughly 20k chars is safe for most local models
        text = text[:80000] 
        return {"text": text}
    except Exception as e:
        logger.error(f"Failed to extract PDF text: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF.")

@router.post("/save-external")
async def save_external_decode(payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    """Saves a decode generated by OpenRouter or Local AI."""
    if not current_user.is_pro:
        raise HTTPException(status_code=403, detail="Research Lab is a Pro feature.")
        
    paper_url = payload.get("paper_url")
    analysis_data = payload.get("analysis_data")
    
    if not paper_url or not analysis_data:
        raise HTTPException(status_code=400, detail="Missing paper_url or analysis_data")
        
    sb = get_supabase_client()
    
    # Extract core analysis and full text
    core_analysis = analysis_data.get("analysis", analysis_data)
    extracted_text = analysis_data.get("extracted_text", "")
    
    # Generate ID and insert
    new_decode = {
        "user_id": current_user.supabase_uid,
        "email": current_user.email,
        "paper_url": paper_url,
        "paper_title": core_analysis.get("paper_title", "Untitled Paper"),
        "core_analysis": core_analysis,
        "extracted_text": extracted_text,
        "status": "completed"
    }
    
    ins_res = sb.table("research_lab_decodes").insert(new_decode).execute()
    if not ins_res.data:
        raise HTTPException(status_code=500, detail="Failed to save analysis session")
        
    return {"id": ins_res.data[0]["id"], "status": "completed"}

@router.get("/history")
async def get_lab_history(current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    res = sb.table("research_lab_decodes")\
        .select("id, paper_title, paper_url, status, created_at")\
        .eq("user_id", current_user.supabase_uid)\
        .order("created_at", desc=True)\
        .execute()
    return res.data or []

@router.get("/decodes/{decode_id}")
async def get_decode_detail(decode_id: str, current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    res = sb.table("research_lab_decodes")\
        .select("*")\
        .eq("id", decode_id)\
        .execute()
        
    if not res.data:
        raise HTTPException(status_code=404, detail="Decode not found")
        
    decode = res.data[0]
    if decode["user_id"] != current_user.supabase_uid and not decode.get("is_public"):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return decode

@router.delete("/decodes/{decode_id}")
async def delete_decode(decode_id: str, current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    
    # Verify ownership
    res = sb.table("research_lab_decodes").select("user_id").eq("id", decode_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    if res.data[0]["user_id"] != current_user.supabase_uid:
        raise HTTPException(status_code=403, detail="Not authorized to delete this analysis")
        
    # Delete it
    sb.table("research_lab_decodes").delete().eq("id", decode_id).execute()
    
    return {"status": "success", "message": "Analysis deleted successfully"}


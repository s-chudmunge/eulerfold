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
from app.utils.gemini_client import robust_json_loads
from app.core.config import settings
from google import genai
from google.genai import types
from app.routers.payments import check_and_revoke_pro_if_no_credits

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/research-lab", tags=["Research Lab"])

async def _fetch_pdf_content(url: str) -> Optional[bytes]:
    """Internal helper to fetch PDF bytes with proper headers."""
    import httpx
    if "arxiv.org/abs/" in url:
        url = url.replace("arxiv.org/abs/", "arxiv.org/pdf/")
        if not url.endswith(".pdf"):
            url += ".pdf"
            
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True, headers=headers) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.content
    except Exception as e:
        logger.error(f"Failed to fetch PDF from {url}: {e}")
    return None

async def run_research_analysis(decode_id: str, paper_url: str):
    """
    Background task to perform the paper analysis using modern google-genai SDK.
    """
    sb = get_supabase_client()
    try:
        sb.table("research_lab_decodes").update({"status": "processing"}).eq("id", decode_id).execute()
        
        pdf_bytes = await _fetch_pdf_content(paper_url)
        if not pdf_bytes:
            raise Exception("Could not retrieve paper content from the provided URL.")

        raise Exception("EulerFold Cloud AI is currently disabled per user request.")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Dynamic Technical Module Prompt
        prompt = """
        You are a world-class Technical Consultant. Deconstruct the attached paper into an 'Engineering Dossier'.
        
        TASK:
        1. Identify the paper archetype: (Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering).
        2. Extract Metadata: (Clean Title, List of Authors, Publication Year).
        3. Create 5-6 high-utility technical modules based on that archetype.

        MODULE RULES:
        - ALWAYS include: 'The Shift', 'Logic', and 'Realities'.
        - 'The Shift' data schema: {"before": "...", "after": "...", "the_win": "..."}
        - 'Logic' data schema: {"details": "Step-by-step logic in Markdown"}
        - 'Realities' data schema: {"items": ["list of technical gotchas"]}
        - 'Concept' data schema: {"details": "Technical breakdown of the underlying architecture or core mechanism. Avoid oversimplification. Focus on structural insights."}
        - For others like 'Math', 'Blueprint', 'Benchmarks', 'Industry':
            - Use "details" for text.
            - Use "items" for lists.
            - Use "math" for formula maps: [{"formula": "LaTeX", "action": "...", "intuition": "..."}]

        STRICT STYLE: Plain English. Technical Precision. No fluff.

        OUTPUT JSON STRUCTURE:
        {
            "extracted_text": "Full text extraction",
            "analysis": {
                "paper_title": "Clean Title",
                "authors": ["Author 1", "Author 2"],
                "year": "202X",
                "archetype": "The identified paper type",
                "modules": [
                    {
                        "id": "unique_id",
                        "label": "The Shift", 
                        "data": {"before": "...", "after": "...", "the_win": "..."}
                    },
                    {
                        "id": "unique_id",
                        "label": "Logic",
                        "data": {"details": "..."}
                    },
                    {
                        "id": "unique_id",
                        "label": "Math",
                        "data": {"math": [...]}
                    }
                ],
                "summary": "Final technical synthesis"
            }
        }
        """
        
        # Use confirmed working 2.5 Pro model
        response = await client.aio.models.generate_content(
            model="gemini-2.5-pro",
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                prompt
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
            )
        )

        if not response.text:
            raise Exception("Gemini failed to return a valid analysis.")

        data = robust_json_loads(response.text)
        decoded_data = data.get("analysis", {})
        full_text = data.get("extracted_text", "")
        
        sb.table("research_lab_decodes").update({
            "paper_title": decoded_data.get("paper_title", "Untitled Paper"),
            "core_analysis": decoded_data,
            "extracted_text": full_text,
            "status": "completed",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", decode_id).execute()
        
        logger.info(f"Research Lab: Successfully analyzed {decode_id}")

    except Exception as e:
        logger.error(f"Research Lab Background Task Failed for {decode_id}: {e}")
        sb.table("research_lab_decodes").update({
            "status": "failed",
            "error_message": str(e),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", decode_id).execute()


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

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    try:
        raise Exception("Cloud AI is disabled")
        
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        
        bot_response = response.text
        
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
    background_tasks.add_task(run_research_analysis, decode_id, paper_url)
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


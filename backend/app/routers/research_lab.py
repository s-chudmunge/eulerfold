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
    
    # Handle ArXiv and AlphaXiv rewrites to get the raw PDF
    import re
    arxiv_match = re.search(r'(?:arxiv\.org|alphaxiv\.org)/(?:abs|pdf|html)/([a-zA-Z\-]+/[0-9]+|[0-9]+\.[0-9]+(?:v[0-9]+)?)', url)
    if arxiv_match:
        paper_id = arxiv_match.group(1)
        if paper_id.endswith(".pdf"):
            paper_id = paper_id[:-4]
        url = f"https://arxiv.org/pdf/{paper_id}.pdf"
            
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
                    content_type = resp.headers.get("content-type", "").lower()
                    if "text/html" in content_type or resp.content.startswith(b"<!DOC") or resp.content.startswith(b"<html"):
                        logger.warning(f"URL returned HTML instead of PDF: {url}")
                        raise Exception("The provided URL points to an HTML webpage instead of a raw PDF file. Please provide a direct link to the PDF.")
                    return resp.content
                else:
                    raise Exception(f"HTTP {resp.status_code}")
        except Exception as e:
            logger.warning(f"PDF fetch attempt {attempt + 1} failed for {url}: {e}")
            if attempt == 0:
                await asyncio.sleep(1)
    return None

async def _extract_paper_figures(paper_url: str) -> List[Dict[str, str]]:
    """Helper to extract figure image URLs and captions from arXiv/ar5iv HTML if available."""
    import re
    import httpx
    from bs4 import BeautifulSoup
    from urllib.parse import urljoin

    arxiv_match = re.search(r'(?:arxiv\.org|alphaxiv\.org)/(?:abs|pdf|html)/([a-zA-Z\-]+/[0-9]+|[0-9]+\.[0-9]+(?:v[0-9]+)?)', paper_url)
    if not arxiv_match:
        return []
    
    paper_id = arxiv_match.group(1)
    if paper_id.endswith(".pdf"):
        paper_id = paper_id[:-4]

    target_urls = [
        f"https://arxiv.org/html/{paper_id}",
        f"https://ar5iv.labs.arxiv.org/html/{paper_id}"
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    timeout = httpx.Timeout(connect=10.0, read=15.0, write=10.0, pool=10.0)
    for html_url in target_urls:
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, headers=headers) as client:
                resp = await client.get(html_url)
                if resp.status_code == 200 and ("/html/" in str(resp.url) or "ar5iv" in str(resp.url)):
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    figures = []
                    for fig in soup.find_all(['figure', 'div'], class_=['ltx_figure', 'ltx_table', 'figure']):
                        img = fig.find('img')
                        caption = fig.find(['figcaption', 'span', 'div'], class_=['ltx_caption', 'caption'])
                        if img:
                            img_src = img.get('src')
                            if img_src and not img_src.startswith('data:'):
                                absolute_url = urljoin(str(resp.url), img_src)
                                cap_text = caption.get_text().strip() if caption else "Figure from paper"
                                figures.append({"src": absolute_url, "caption": cap_text})
                    if figures:
                        return figures[:8]  # Limit to top 8 key figures
        except Exception as e:
            logger.warning(f"Figure extraction attempt failed for {html_url}: {e}")
    return []

async def run_research_analysis(decode_id: str, paper_url: str, uid: str, user_email: str):
    """
    Background task to perform the paper analysis using modern google-genai SDK.
    """
    import time
    t0 = time.time()
    sb = get_supabase_client()
    logger.info(f"[ResearchLab] Starting analysis {decode_id[:8]}... | URL: {paper_url[:80]}")
    try:
        sb.table("research_lab_decodes").update({"status": "fetching_paper"}).eq("id", decode_id).execute()
        
        pdf_bytes = await _fetch_pdf_content(paper_url)
        if not pdf_bytes:
            raise Exception("Could not retrieve paper content from the provided URL.")
        logger.info(f"[ResearchLab] PDF fetched — {len(pdf_bytes) / 1024:.0f} KB, {time.time() - t0:.1f}s")

        sb.table("research_lab_decodes").update({"status": "extracting_text"}).eq("id", decode_id).execute()
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

        # Fetch figures if available
        figures = await _extract_paper_figures(paper_url)
        figures_formatted = ""
        if figures:
            figures_formatted = "\nEXTRACTED PAPER FIGURES & CAPTIONS:\n" + "\n".join(
                [f"- Image URL: {f['src']}\n  Caption: {f['caption']}" for f in figures]
            ) + "\n"

        sb.table("research_lab_decodes").update({"status": "analyzing_architecture"}).eq("id", decode_id).execute()
        prompt = """You are a Technical Analyst decoding a research paper for a reader who is smart but has NOT read the paper.
Your job is to make the paper understandable — not just transcribe it.

CORE RULE: Every module MUST start with 1-2 sentences of plain-English context explaining WHAT this section covers and WHY it matters, before any equations, tables, bullet points, or technical terms. No cold starts.

TASK:
1. Identify paper archetype: Theoretical Math, Systems/Hardware, AI Architecture, or Applied Engineering.
2. Extract metadata: title, authors, year.
3. Create 5-6 modules that tell a coherent story — not a dump of information.

REQUIRED MODULES (always include these 3):
- "The Shift": {
    "context": "One sentence: what is the core problem this paper is responding to?",
    "before": "The old approach — what was the existing state of affairs? Be specific.",
    "after": "The new approach proposed — what changes and why?",
    "the_win": "The concrete advantage. What can you now do that you couldn't before?"
  }
- "Logic": {
    "details": "Markdown explaining the step-by-step reasoning of the paper. MUST start with a plain-English paragraph describing what the argument/proof/method is trying to achieve before any math or symbols. Then walk through the logic step by step. Use $...$ for inline math, $$...$$ for block math."
  }
- "Realities": {
    "context": "One sentence summarizing the theme of these limitations/gotchas.",
    "items": ["Each item is a complete thought: state the gotcha AND why it matters to practitioners. No one-liners that assume the reader already knows the paper."]
  }

OPTIONAL MODULES (pick 2-3 based on archetype):
- "Concept": {
    "details": "Markdown. Start with: what is the core concept and why does the paper need to define it? Then explain the mechanism/architecture. Tables and diagrams are welcome but must be preceded by a setup sentence."
  }
- "Figures & Visuals": {
    "details": "Markdown explaining the paper's key figures, architectural diagrams, or plots. IF extracted paper figures are provided below, you MUST embed them using standard Markdown image syntax `![Figure Description](URL)` followed by a detailed paragraph explaining what the figure demonstrates and why it matters to the paper's main thesis."
  }
- "Math": {
    "math": [{"formula": "$LaTeX$", "action": "what this formula computes in plain English", "intuition": "why this formula captures the right thing — connect it to real-world intuition"}]
  }
- "Blueprint": {
    "context": "One sentence: what problem does this implementation/system solve, and who needs to build it?",
    "details": "Markdown describing the components and architecture. Do NOT repeat the context sentence here — dive straight into the structure. Plain text for tool names and field names; code blocks only for actual code (minimum 3 lines of logic)."
  }
- "Benchmarks": {
    "context": "What was being measured and why these specific metrics matter.",
    "items": ["Each result stated with its significance: not just the number but what it proves or disproves."]
  }

FIGURE HANDLING RULE:
- If EXTRACTED PAPER FIGURES are provided below, make sure to reference and embed the most important ones (`![Caption](src)`) in the "Figures & Visuals", "Concept", or "Blueprint" module details and explain what each figure represents in detail.

STYLE RULES:
- Plain English first, then technical notation.
- Never open a section with a symbol, equation, table header, or bullet point.
- A smart but uninitiated expert should be able to follow every module from start to finish.
- Use $...$ for inline math and $$...$$ for block math. Never use bare LaTeX.
- No fluff, no marketing language. Be precise and direct.

CODE BLOCK RULES (strictly enforced):
- Code blocks (triple backticks) are SACRED. Use them ONLY when showing actual executable/compilable code that directly illustrates a mechanism from the paper — e.g., a Lean proof, a Python algorithm, a pseudocode procedure showing the logic.
- NEVER use a code block for: tool names (Mathlib, Lean 4, HOL), variable names (compute_budget, verification_status), field names, system names, or any single word or short phrase that is just a technical term. Write those inline as plain text.
- A code block must contain at least 3 lines of meaningful code logic to justify its existence. A code block containing a single identifier like `Mathlib` or `human_scaffolding_hours` is strictly forbidden.
- When in doubt, write it as plain text.

Return ONLY this JSON:
{
    "paper_title": "Clean Title",
    "authors": ["Author 1", "Author 2"],
    "year": "202X",
    "archetype": "identified type",
    "modules": [
        {"id": "shift", "label": "The Shift", "data": {"context": "...", "before": "...", "after": "...", "the_win": "..."}},
        {"id": "logic", "label": "Logic", "data": {"details": "..."}},
        {"id": "realities", "label": "Realities", "data": {"context": "...", "items": ["..."]}}
    ],
    "summary": "3-4 sentence synthesis: what this paper claims, how it argues it, and what changes if it is right."
}
""" + figures_formatted + f"\n\nPAPER CONTENT:\n{paper_text}\n"
        
        sb.table("research_lab_decodes").update({"status": "generating_report"}).eq("id", decode_id).execute()
        response_text, usage = await generate_text(prompt, model=settings.DEFAULT_ROADMAP_MODEL, response_mime_type="application/json", return_usage=True)
        log_backend_ai_usage(sb, uid, "Research Lab Analysis (Cost: 1.0 Credits)", usage, source="backend")

        if not response_text:
            raise Exception("AI failed to return a valid analysis.")

        sb.table("research_lab_decodes").update({"status": "finalizing"}).eq("id", decode_id).execute()
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
            profile_res = sb.table("profiles").select("roadmap_credits").eq("email", user_email).single().execute()
            if profile_res.data:
                current_credits = float(profile_res.data.get("roadmap_credits", 0))
                sb.table("profiles").update({"roadmap_credits": current_credits + 1.0}).eq("email", user_email).execute()
                logger.info(f"Refunded 1.0 credit to user {user_email} after failed analysis {decode_id}")
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
    background_tasks.add_task(run_research_analysis, decode_id, paper_url, current_user.supabase_uid, email)
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


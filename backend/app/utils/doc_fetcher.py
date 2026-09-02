import io
import ssl
import logging
import asyncio
import urllib.request
import httpx
from bs4 import BeautifulSoup
from typing import Tuple, Optional
import pypdf

logger = logging.getLogger(__name__)

def create_resilient_ssl_context() -> ssl.SSLContext:
    """Creates an SSL context that can connect to legacy academic/gov servers."""
    ctx = ssl.create_default_context()
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except Exception:
        pass
    try:
        ctx.options |= getattr(ssl, 'OP_LEGACY_SERVER_CONNECT', 0x4)
    except Exception:
        pass
    return ctx

def fetch_url_bytes(url: str, timeout: float = 25.0) -> bytes:
    """Fetch raw bytes from a URL using resilient SSL settings and browser headers."""
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

    try:
        ctx = create_resilient_ssl_context()
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            return response.read()
    except Exception as e:
        logger.warning(f"urllib fetch failed for {url}: {e}. Retrying with httpx...")

    with httpx.Client(timeout=timeout, follow_redirects=True, headers=headers, verify=False) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content

def extract_text_from_bytes_or_url(raw_bytes: bytes, url: str = "") -> Tuple[str, str]:
    """
    Extracts text from PDF bytes or HTML bytes.
    Returns (extracted_text, content_type: 'pdf' | 'html').
    """
    is_pdf = False
    if raw_bytes.startswith(b"%PDF-") or (url and url.lower().endswith(".pdf")):
        is_pdf = True

    if is_pdf:
        try:
            reader = pypdf.PdfReader(io.BytesIO(raw_bytes))
            pages_text = []
            for page in reader.pages:
                txt = page.extract_text()
                if txt:
                    pages_text.append(txt)
            extracted = "\n\n".join(pages_text).strip()
            if extracted:
                return extracted, "pdf"
        except Exception as e:
            logger.warning(f"pypdf extraction failed on raw bytes: {e}")

    try:
        soup = BeautifulSoup(raw_bytes, "html.parser")
        for script in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            script.extract()
        text = soup.get_text(separator=' ', strip=True)
        return text, "html"
    except Exception as e:
        logger.error(f"HTML extraction failed: {e}")
        return raw_bytes.decode('utf-8', errors='ignore'), "text"

async def fetch_rendered_webpage_text(url: str, timeout_seconds: int = 25) -> Tuple[str, str]:
    """
    Tier 1 web scraper: Fast direct HTTP/PDF extraction.
    We removed the Playwright (Chromium) fallback to massively reduce backend bloat.
    Dynamic JS-rendered pages will fall back to basic text extraction or Jina Reader API if configured.
    """
    # 1. Fast Tier: Direct Fetch
    try:
        raw_bytes = await asyncio.to_thread(fetch_url_bytes, url, 15.0)
        text, ctype = extract_text_from_bytes_or_url(raw_bytes, url)
        
        if ctype == "pdf" or (text and len(text.strip()) > 350 and "loading..." not in text.lower()[:300]):
            return text, ctype
    except Exception as e:
        logger.warning(f"Fast HTTP extraction failed for {url}: {e}.")

    # 2. Dynamic Tier: Lightweight API fallback (Jina Reader)
    # This replaces the bloaty 200MB+ Playwright Chromium dependency
    try:
        jina_url = f"https://r.jina.ai/{url}"
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            resp = await client.get(jina_url, headers={"X-No-Cache": "true", "X-Return-Format": "text"})
            if resp.status_code == 200 and len(resp.text.strip()) > 20:
                logger.info(f"Jina Reader successfully extracted dynamic page: {len(resp.text)} chars")
                return resp.text, "dynamic_webpage"
    except Exception as jina_err:
        logger.error(f"Jina Reader fallback failed for {url}: {jina_err}")

    # Fallback to whatever fast tier retrieved or empty
    return text if 'text' in locals() and text else "", "webpage"

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
    Tier 1 & Tier 2 web scraper:
    1. First tries fast direct HTTP/PDF extraction.
    2. If the text appears truncated, empty, or contains dynamic JS placeholders (e.g. 'Loading...', SPA containers),
       escalates to headless Playwright (Chromium) to execute JavaScript and capture the rendered DOM.
    """
    # 1. Fast Tier: Direct Fetch
    try:
        raw_bytes = await asyncio.to_thread(fetch_url_bytes, url, 15.0)
        text, ctype = extract_text_from_bytes_or_url(raw_bytes, url)
        
        # If it's a PDF or we got substantial content without loading skeletons, return immediately
        if ctype == "pdf" or (text and len(text.strip()) > 350 and "loading..." not in text.lower()[:300]):
            return text, ctype
    except Exception as e:
        logger.warning(f"Fast HTTP extraction failed for {url}: {e}. Escalating to Playwright.")

    # 2. Dynamic Tier: Headless Playwright (Chromium)
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            await page.goto(url, wait_until="domcontentloaded", timeout=timeout_seconds * 1000)
            
            # Wait for content or network idle
            try:
                await page.wait_for_timeout(3000)
            except Exception:
                pass
                
            content = await page.content()
            await browser.close()

            soup = BeautifulSoup(content, "html.parser")
            for script in soup(["script", "style", "nav", "footer", "header", "noscript"]):
                script.extract()
            rendered_text = soup.get_text(separator=' ', strip=True)
            if rendered_text and len(rendered_text.strip()) > 20:
                logger.info(f"Playwright successfully rendered dynamic page: {len(rendered_text)} chars")
                return rendered_text, "dynamic_webpage"
    except Exception as pw_err:
        logger.error(f"Playwright rendering failed for {url}: {pw_err}")

    # Fallback to whatever fast tier retrieved or empty
    return text if 'text' in locals() and text else "", "webpage"

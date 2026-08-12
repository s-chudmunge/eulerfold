from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
import re
import asyncio
import random
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/local-tools", tags=["local-tools"])

_executor = ThreadPoolExecutor(max_workers=4)

# Rotate user agents to reduce connection resets from remote servers
_USER_AGENTS = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
]


def _pick_headers() -> dict:
    return {
        "User-Agent": random.choice(_USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }


def _ddgs_search_sync(q: str, limit: int) -> list[dict]:
    """
    Run DuckDuckGo search synchronously (DDGS is a blocking library).
    Retries up to 3 times with exponential backoff on connection errors.
    """
    from ddgs import DDGS
    import time

    last_err: Exception | None = None
    for attempt in range(3):
        if attempt > 0:
            time.sleep(1.5 * attempt)  # 1.5s, 3s
        try:
            results = []
            with DDGS(timeout=12) as ddgs:
                for r in ddgs.text(q, max_results=limit):
                    results.append({
                        "title": r.get("title", ""),
                        "url": r.get("href", ""),
                        "snippet": r.get("body", ""),
                    })
            if results:
                return results
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"Search failed after 3 attempts: {last_err}")


@router.get("/search")
async def web_search(
    q: str = Query(..., min_length=1, max_length=300),
    limit: int = Query(5, ge=1, le=8),
):
    """
    DuckDuckGo text search — no API key required.
    Runs in a thread pool with retry/backoff to handle connection resets.
    """
    loop = asyncio.get_event_loop()
    try:
        results = await loop.run_in_executor(_executor, _ddgs_search_sync, q, limit)
        return {"query": q, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class FetchRequest(BaseModel):
    url: str


def _extract_text(html: str) -> tuple[str, str]:
    """Extract page title and clean body text from raw HTML."""
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "aside",
                     "header", "noscript", "iframe", "form", "button", "svg"]):
        tag.decompose()

    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    main_el = (
        soup.find("main")
        or soup.find("article")
        or soup.find(attrs={"role": "main"})
        or soup.find(id=re.compile(r"^(content|main|article|body|post)$", re.I))
        or soup.find(class_=re.compile(r"(content|article|post|body|prose)", re.I))
    )
    target = main_el if main_el else (soup.body if soup.body else soup)

    raw_text = target.get_text(separator="\n", strip=True)

    lines = []
    for line in raw_text.split("\n"):
        clean_line = re.sub(r"[^\x20-\x7E]", " ", line.strip())
        clean_line = re.sub(r" {3,}", "  ", clean_line).strip()
        if clean_line and len(clean_line) > 3:
            lines.append(clean_line)

    return title, "\n".join(lines)


@router.post("/fetch")
async def fetch_url(req: FetchRequest):
    """
    Fetch and extract readable text from a URL.
    Retries up to 2 times on connection reset / network errors.
    Caps output at 3000 chars for small local GPU models.
    """
    last_err: Exception | None = None

    for attempt in range(3):
        if attempt > 0:
            await asyncio.sleep(1.0 * attempt)

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(connect=10.0, read=20.0, write=10.0, pool=5.0),
                follow_redirects=True,
                http2=False,  # Disable HTTP/2 — connection resets are more common with h2
            ) as client:
                response = await client.get(req.url, headers=_pick_headers())
                response.raise_for_status()
                content_type = response.headers.get("content-type", "")
                raw_html = response.text

            if "text/html" not in content_type and "application/xhtml" not in content_type:
                return {
                    "url": req.url,
                    "title": req.url,
                    "content": raw_html[:3000],
                }

            loop = asyncio.get_event_loop()
            title, clean = await loop.run_in_executor(_executor, _extract_text, raw_html)

            if len(clean) > 3000:
                clean = clean[:3000] + "\n\n[...content truncated]"

            return {"url": req.url, "title": title, "content": clean}

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=400,
                detail=f"HTTP {e.response.status_code} from {req.url}",
            )
        except (httpx.RemoteProtocolError, httpx.ReadError, httpx.ConnectError) as e:
            # Connection reset / stream reading errors — retry
            last_err = e
            continue
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail=f"Timed out fetching {req.url}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Fetch failed: {str(e)}")

    raise HTTPException(
        status_code=502,
        detail=f"Connection reset after 3 attempts: {last_err}",
    )

import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
import httpx
import logging
import asyncio

logger = logging.getLogger(__name__)

# In-memory cache for instant response on repeat views
_PAPERS_CACHE: Dict[str, tuple[List[Dict[str, Any]], float]] = {}
CACHE_TTL_SECONDS = 86400  # 24 hours

COURSE_FLUFF_REGEX = re.compile(
    r'(?i)\b(an?\s+)?(introduction to|intro to|basics of|fundamentals of|principles of|overview of|understanding|getting started with|deep dive into|guide to|tutorial on|primer on|basics|basic|intro|fundamentals|fundamental|overview|principles|principle|concepts|concept|tutorial)\b',
    re.IGNORECASE
)

def _clean_text(raw_text: str) -> str:
    if not raw_text:
        return ""
    no_html = re.sub(r'<[^>]+>', '', raw_text)
    return re.sub(r'\s+', ' ', no_html).strip()

def _clean_snippet(raw_summary: str, max_chars: int = 150) -> str:
    if not raw_summary:
        return ""
    text = re.sub(r'\$[^$]*\$', '', raw_summary)
    text = re.sub(r'\s+', ' ', text).strip()
    match = re.search(r'^(.*?[.!?])(?:\s+[A-Z]|\s*$)', text)
    if match and 40 <= len(match.group(1)) <= max_chars:
        return match.group(1)
    if len(text) <= max_chars:
        return text
    trimmed = text[:max_chars].rsplit(' ', 1)[0]
    return f"{trimmed}..."

def _determine_badge(title: str, primary_category: str) -> str:
    title_lower = title.lower()
    if 'survey' in title_lower:
        return 'Survey'
    if 'benchmark' in title_lower or 'benchmarking' in title_lower:
        return 'Benchmark'
    if 'overview' in title_lower or 'review' in title_lower:
        return 'Overview'
    if 'foundation' in title_lower or 'primer' in title_lower or 'tutorial' in title_lower:
        return 'Foundations'
    return primary_category or 'arXiv'

STOPWORDS = {
    'and', 'the', 'for', 'with', 'from', 'using', 'into', 'basic', 'basics', 'intro',
    'setup', 'introduction', 'module', 'week', 'building', 'practical', 'mastery', 'toy',
    'guide', 'tutorial', 'overview', 'fundamentals', 'principles', 'concepts', 'concept'
}

def _extract_meaningful_terms(text: str) -> List[str]:
    words = re.findall(r'\b[a-zA-Z0-9+#.-]{3,}\b', text)
    return [w for w in words if w.lower() not in STOPWORDS]

async def fetch_top_cited_papers(
    topic: str,
    subject: Optional[str] = None,
    objectives: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Searches arXiv for accessible surveys, benchmarks, and foundational literature
    matching the module title, roadmap subject, and learning objectives.
    """
    raw_topic = _clean_text(topic)
    if not raw_topic:
        return []

    # Strip generic syllabus fluff (e.g. "SQL Basics" -> "SQL", "Introduction to Databases" -> "Databases")
    clean_topic = COURSE_FLUFF_REGEX.sub(' ', raw_topic)
    clean_topic = re.sub(r'\s+', ' ', clean_topic).strip() or raw_topic
    first_part = re.split(r'[&,]', clean_topic)[0].strip() or clean_topic

    cache_key = f"{clean_topic.lower()}|{subject.lower().strip() if subject else ''}"
    now = time.time()
    if cache_key in _PAPERS_CACHE:
        cached_papers, cached_at = _PAPERS_CACHE[cache_key]
        if now - cached_at < CACHE_TTL_SECONDS:
            return cached_papers

    headers = {
        'User-Agent': 'EulerFold/1.0 (mailto:admin@eulerfold.com; https://www.eulerfold.com)'
    }
    
    timeout = httpx.Timeout(connect=3.0, read=6.0, write=3.0, pool=3.0)
    papers: List[Dict[str, Any]] = []

    try:
        mod_terms = _extract_meaningful_terms(clean_topic)
        road_terms = _extract_meaningful_terms(subject or '')
        all_obj_text = ' '.join(objectives or [])
        obj_terms = _extract_meaningful_terms(all_obj_text)

        # Identify core technology or subject anchor (e.g. 'Rust', 'CUDA', 'SQL', 'Quantum', 'GNN')
        anchor = None
        for t in road_terms + mod_terms:
            if t in mod_terms and (t in road_terms or len(mod_terms) == 1):
                anchor = t
                break
        if not anchor and road_terms:
            anchor = road_terms[-1]

        # Multi-tier search queries
        queries: List[str] = [
            f'all:"{first_part}" AND (ti:survey OR ti:overview OR ti:review OR ti:benchmark OR ti:foundations)',
            f'ti:"{first_part}"'
        ]

        if anchor and anchor.lower() != first_part.lower():
            sec_terms = [t for t in (mod_terms + obj_terms) if t.lower() != anchor.lower()][:3]
            if sec_terms:
                sec_clause = ' OR '.join([f'all:"{s}"' for s in sec_terms])
                queries.append(f'(all:"{anchor}" OR ti:"{anchor}") AND ({sec_clause})')

        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            ns = {'atom': 'http://www.w3.org/2005/Atom', 'arxiv': 'http://arxiv.org/schemas/atom'}
            reqs = [
                client.get(
                    f"https://export.arxiv.org/api/query?search_query={urllib.parse.quote(q)}&start=0&max_results=5&sortBy=relevance&sortOrder=descending",
                    headers=headers
                )
                for q in queries
            ]
            resps = await asyncio.gather(*reqs, return_exceptions=True)

            entries = []
            for r in resps:
                if isinstance(r, httpx.Response) and r.status_code == 200:
                    tree = ET.fromstring(r.content)
                    entries.extend(tree.findall('atom:entry', ns))

            # Fallback if sparse results
            if len(entries) < 3:
                q_fallback = f'all:"{first_part}"'
                try:
                    res_fallback = await client.get(
                        f"https://export.arxiv.org/api/query?search_query={urllib.parse.quote(q_fallback)}&start=0&max_results=5&sortBy=relevance&sortOrder=descending",
                        headers=headers
                    )
                    if res_fallback.status_code == 200:
                        tree_fallback = ET.fromstring(res_fallback.content)
                        entries.extend(tree_fallback.findall('atom:entry', ns))
                except Exception:
                    pass

            seen_ids = set()
            candidate_list = []
            key_tokens = set([t.lower() for t in (mod_terms + road_terms + obj_terms)])

            for e in entries:
                paper_id = e.find('atom:id', ns)
                if paper_id is None or not paper_id.text:
                    continue
                raw_id = paper_id.text.strip()
                if raw_id in seen_ids:
                    continue
                seen_ids.add(raw_id)

                title_elem = e.find('atom:title', ns)
                title_text = _clean_text(title_elem.text or '') if title_elem is not None else ''
                if not title_text:
                    continue

                summary_elem = e.find('atom:summary', ns)
                raw_summary = summary_elem.text or '' if summary_elem is not None else ''
                snippet = _clean_snippet(raw_summary)

                pub_elem = e.find('atom:published', ns)
                pub_year = int(pub_elem.text[:4]) if pub_elem is not None and pub_elem.text and pub_elem.text[:4].isdigit() else None

                authors_elems = e.findall('atom:author', ns)
                authors_list = [a.find('atom:name', ns).text.strip() for a in authors_elems if a.find('atom:name', ns) is not None and a.find('atom:name', ns).text]
                if len(authors_list) > 2:
                    authors_str = f"{', '.join(authors_list[:2])} et al."
                elif authors_list:
                    authors_str = ', '.join(authors_list)
                else:
                    authors_str = 'Academic Researchers'

                cat_elem = e.find('arxiv:primary_category', ns)
                category = cat_elem.attrib.get('term') if cat_elem is not None else 'arXiv'
                badge = _determine_badge(title_text, category)

                # Direct PDF Link
                pdf_url = None
                for link in e.findall('atom:link', ns):
                    if link.attrib.get('title') == 'pdf' or link.attrib.get('type') == 'application/pdf':
                        pdf_url = link.attrib.get('href')
                        break
                if not pdf_url and raw_id:
                    pdf_url = raw_id.replace('http://', 'https://').replace('/abs/', '/pdf/')
                    if not pdf_url.endswith('.pdf'):
                        pdf_url += '.pdf'
                elif pdf_url and pdf_url.startswith('http://'):
                    pdf_url = 'https://' + pdf_url[7:]

                # Deterministic scoring for syllabus and learner relevance
                score = 0
                title_lower = title_text.lower()
                summary_lower = raw_summary.lower()

                if any(w in title_lower for w in ['survey', 'overview', 'benchmark', 'review', 'foundations']):
                    score += 30
                if anchor and anchor.lower() in title_lower:
                    score += 25
                elif anchor and anchor.lower() in summary_lower:
                    score += 10

                matched_tokens_ti = sum(1 for tok in key_tokens if tok in title_lower)
                score += min(matched_tokens_ti * 10, 30)

                matched_tokens_sm = sum(1 for tok in key_tokens if tok in summary_lower)
                score += min(matched_tokens_sm * 3, 15)

                if pub_year and pub_year >= 2018:
                    score += 5

                candidate_list.append((score, {
                    'title': title_text,
                    'authors': authors_str,
                    'year': pub_year,
                    'citation_count': 0,
                    'url': raw_id.replace('http://', 'https://'),
                    'pdf_url': pdf_url,
                    'snippet': snippet,
                    'badge': badge,
                    'venue': category,
                    'doi': None
                }))

            candidate_list.sort(key=lambda x: x[0], reverse=True)
            papers = [p[1] for p in candidate_list[:3]]

    except Exception as e:
        logger.warning(f"Failed to fetch arXiv papers for module '{clean_topic}': {e}")

    _PAPERS_CACHE[cache_key] = (papers, now)
    return papers

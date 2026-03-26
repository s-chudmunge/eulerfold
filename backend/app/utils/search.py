import re
from typing import List

# Common filler words and phrases to remove from learning-related searches
FILLER_PHRASES = [
    r"i want to learn\b",
    r"i want to\b",
    r"how to learn\b",
    r"how to\b",
    r"i need to learn\b",
    r"teach me\b",
    r"roadmap for\b",
    r"roadmap to\b",
    r"guide to\b",
    r"everything about\b",
    r"from scratch\b",
    r"for beginners\b",
    r"beginner to advanced\b",
    r"step by step\b",
    r"\band\b",
    r"\bwith\b",
    r"\bthe\b",
    r"\ba\b",
    r"\ban\b",
    r"\bin\b",
    r"\bof\b",
    r"\bfor\b"
]

def clean_search_query(query: str) -> str:
    """
    Cleans a natural language search query to extract core keywords.
    Example: "I want to learn Python from scratch" -> "python"
    """
    if not query:
        return ""
    
    # Convert to lowercase
    q = query.lower().strip()
    
    # Remove common filler phrases
    for phrase in FILLER_PHRASES:
        q = re.sub(phrase, "", q)
    
    # Remove leading/trailing "learn" if it's still there
    q = re.sub(r"^\s*learn\s+", "", q)
    q = re.sub(r"\s+learn\s*$", "", q)
    
    # Remove extra whitespace
    q = re.sub(r"\s+", " ", q).strip()
    
    # If we cleaned everything away, return original (fallback)
    if not q:
        # Just remove common symbols and return
        return re.sub(r"[^a-zA-Z0-9\s]", "", query).strip()
    
    return q

def get_search_keywords(query: str) -> List[str]:
    """
    Splits a query into a list of significant keywords.
    """
    cleaned = clean_search_query(query)
    # Filter out very short words unless they are digits or common tech terms
    words = cleaned.split()
    return [w for w in words if len(w) > 1 or w.isdigit()]

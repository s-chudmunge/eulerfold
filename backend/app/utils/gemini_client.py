import json
import logging
import os
import re
import asyncio
import google.generativeai as genai
from app.core.config import settings
try:
    from json_repair import repair, loads as repair_loads
    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False

logger = logging.getLogger(__name__)

# Initialize genai if key is present
if settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"):
    # Attempting to use rest transport
    genai.configure(
        api_key=settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"),
        transport='rest'
    )

async def generate_text(prompt: str, model: str = "models/gemini-2.5-flash", response_mime_type: str = None) -> str:
    """Generates text from Gemini with standard config and retry logic."""
    VALID_MODELS = [
        "models/gemini-2.5-flash",
        "models/gemini-2.0-flash",
        "models/gemini-2.0-flash-lite-preview-02-05",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-flash-8b",
        "models/gemini-1.5-pro",
        "models/gemini-2.5-pro",
        "models/gemma-3-1b-it",
        "models/gemma-3-4b-it",
        "models/gemini-2.0-flash-exp",
        "models/gemini-2.0-flash-lite-latest",
        "models/gemini-2.0-flash-thinking-exp",
    ]
    
    is_valid = model in VALID_MODELS or model.startswith("models/gemini") or model.startswith("models/gemma")
    
    if not is_valid:
        raise ValueError(f"Invalid model '{model}'.")
    
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    max_retries = 2
    for attempt in range(max_retries):
        try:
            gen_model = genai.GenerativeModel(model)
            
            config = {
                "temperature": 0.1,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
            
            if response_mime_type:
                config["response_mime_type"] = response_mime_type
                
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: gen_model.generate_content(
                    prompt,
                    generation_config=config,
                )
            )

            if not response or not response.text:
                raise RuntimeError("Empty response from Gemini")

            return response.text

        except Exception as e:
            error_msg = str(e)
            if "User location is not supported" in error_msg:
                logger.error(f"Gemini Location Error: {error_msg}. Server region: {os.getenv('RENDER_REGION', 'Unknown')}. Suggestion: Change Render region to Oregon (us-west-2) or Frankfurt (eu-central-1).")
            
            if attempt == max_retries - 1:
                raise RuntimeError(f"Gemini generation failed: {error_msg}")
            
            logger.warning(f"Gemini attempt {attempt + 1} failed, retrying... Error: {error_msg}")
            await asyncio.sleep(1)

def clean_json_string(text: str) -> str:
    """Extracts and prepares JSON string for parsing."""
    if not text:
        return ""

    # 1. Remove markdown
    text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```\s*', '', text)
    
    # 2. Extract bracketed content
    start_match = re.search(r'[\[\{]', text, re.DOTALL)
    if start_match:
        start_pos = start_match.start()
        end_match_br = text.rfind(']')
        end_match_cr = text.rfind('}')
        end_pos = max(end_match_br, end_match_cr)
        if end_pos != -1:
            text = text[start_pos : end_pos + 1]
            
    return text.strip()

def robust_json_loads(text: str):
    """Parses JSON with multiple fallback and repair strategies."""
    cleaned = clean_json_string(text)
    
    # Strategy 1: Standard JSON
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
        
    # Strategy 2: json_repair
    if HAS_JSON_REPAIR:
        try:
            return repair_loads(cleaned)
        except Exception as e:
            logger.warning(f"repair_loads failed: {e}")
            
    # Strategy 3: Manual repair + Standard JSON
    # Remove trailing commas
    fixed = re.sub(r',\s*([\]\}])', r'\1', cleaned)
    # Fix unescaped newlines in values
    # (Matches "key": "value with \n" but not legitimate structure)
    try:
        return json.loads(fixed)
    except:
        pass
        
    # If all else fails, re-raise original error or try one last ditch
    return json.loads(cleaned) # This will throw the definitive error

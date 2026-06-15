import json
import logging
import os
import re
import asyncio
from google import genai
from fastapi import HTTPException
from app.core.config import settings

try:
    from json_repair import repair, loads as repair_loads
    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False

logger = logging.getLogger(__name__)

# Global client for reuse
_client = None

def get_gemini_client():
    global _client
    if _client is None:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.error("GEMINI_API_KEY not configured")
            return None
            
        try:
            # Proxy handling for new SDK
            proxy = os.getenv("GEMINI_PROXY") or os.getenv("HTTPS_PROXY") or os.getenv("https_proxy")
            if proxy:
                logger.info(f"Using proxy for Gemini Client: {proxy}")
                os.environ["HTTP_PROXY"] = proxy
                os.environ["HTTPS_PROXY"] = proxy
            
            _client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
            logger.info("New google-genai client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize google-genai client: {e}")
            
    return _client

async def generate_text(prompt: str, model: str = "models/gemini-2.5-flash", response_mime_type: str = None) -> str:
    """Generates text from Gemini using the modern google-genai SDK with native async."""
    raise RuntimeError("EulerFold Cloud AI is currently disabled per user request. Please use Local AI or OpenRouter.")
    
    # Strip 'models/' prefix if present for the new SDK's model string
    current_model = model.replace("models/", "") if model.startswith("models/") else model
    
    # Restored original model list
    VALID_MODELS = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-2.0-flash",
        "models/gemini-2.0-flash-lite-preview-02-05",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-flash-8b",
        "models/gemini-1.5-pro",
        "models/gemma-3-1b-it",
        "models/gemma-3-4b-it",
        "models/gemini-2.0-flash-exp",
        "models/gemini-2.0-flash-lite-latest",
        "models/gemini-2.0-flash-thinking-exp",
    ]
    
    is_valid = model in VALID_MODELS or model.startswith("models/gemini") or model.startswith("models/gemma") or current_model.startswith("gemini-")
    
    if not is_valid:
        raise ValueError(f"Invalid model '{model}'.")
    
    # Use AI Studio client directly
    client = get_gemini_client()
    if not client:
        raise RuntimeError("Gemini Client not initialized")

    config = {
        "temperature": 0.1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
    }
    
    if response_mime_type:
        config["response_mime_type"] = response_mime_type

    max_retries = 3
    fallback_used = False

    for attempt in range(max_retries):
        try:
            # Use native async generate_content
            response = await client.aio.models.generate_content(
                model=current_model,
                contents=prompt,
                config=config
            )

            if not response or not response.text:
                raise RuntimeError("Empty response from Gemini")

            return response.text

        except Exception as e:
            error_msg = str(e).upper()
            
            # Handle Location Error
            if "USER LOCATION IS NOT SUPPORTED" in error_msg:
                logger.error(f"Gemini Location Error: {e}. Server region: {os.getenv('RENDER_REGION', 'Unknown')}.")
                if attempt == max_retries - 1:
                    raise RuntimeError(
                        "Gemini API is not available in your current deployment region. "
                        "Fix: Change Render region to 'Oregon (us-west-2)' or 'Frankfurt (eu-central-1)'."
                    )
            
            # Handle Rate Limit / Quota Errors
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "QUOTA" in error_msg:
                # If we were using Pro, try to fallback to Flash for the remaining attempts
                # Use lower() to be case-insensitive for the model name check
                if "pro" in current_model.lower() and not fallback_used:
                    logger.warning(f"Gemini Pro quota exhausted. Falling back to Gemini 2.5 Flash for attempt {attempt + 1}.")
                    current_model = "gemini-2.5-flash"
                    fallback_used = True
                    # No sleep needed for fallback, just retry immediately
                    continue
                
                if attempt == max_retries - 1:
                    logger.error(f"Gemini rate limit exceeded after {max_retries} attempts.")
                    raise HTTPException(
                        status_code=429, 
                        detail="The AI engine is currently under heavy load or quota limit. Please try again in a few minutes."
                    )
            
            if attempt == max_retries - 1:
                raise RuntimeError(f"Gemini generation failed after {max_retries} attempts: {str(e)}")
            
            wait_time = (attempt + 1) * 2
            logger.warning(f"Gemini attempt {attempt + 1} failed, retrying in {wait_time}s... Error: {str(e)}")
            await asyncio.sleep(wait_time)

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
    if not text:
        return {}
        
    cleaned = clean_json_string(text)
    
    # Strategy 1: Standard JSON
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.debug(f"Standard json.loads failed: {e}")
        pass
        
    # Strategy 2: json_repair
    try:
        from json_repair import loads as repair_loads
        return repair_loads(cleaned)
    except Exception as e:
        logger.warning(f"json_repair failed: {e}")
            
    # Strategy 3: Manual repair for common Gemini issues
    try:
        # Remove trailing commas before closing braces/brackets
        fixed = re.sub(r',\s*([\]\}])', r'\1', cleaned)
        # Fix missing commas between objects/arrays
        fixed = re.sub(r'\}\s*\{', '}, {', fixed)
        fixed = re.sub(r'\]\s*\[', '], [', fixed)
        return json.loads(fixed)
    except:
        pass
        
    # Strategy 4: Last ditch - attempt to find the last valid closing character
    try:
        open_braces = cleaned.count('{') - cleaned.count('}')
        open_brackets = cleaned.count('[') - cleaned.count(']')
        
        last_ditch = cleaned
        if open_brackets > 0:
            last_ditch += ']' * open_brackets
        if open_braces > 0:
            last_ditch += '}' * open_braces
            
        from json_repair import loads as repair_loads_last
        return repair_loads_last(last_ditch)
    except:
        pass

    logger.error(f"Failed to parse JSON. Length: {len(cleaned)}. Error context: {cleaned[-500:]}")
    return json.loads(cleaned)

import json
import logging
import os
import re
import asyncio
import httpx
import cohere
from google import genai
from google.genai import types
from huggingface_hub import AsyncInferenceClient
from fastapi import HTTPException
from app.core.config import settings

try:
    from json_repair import repair, loads as repair_loads
    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False

logger = logging.getLogger(__name__)

_cached_free_model = None
_cached_time = 0

async def get_fastest_free_openrouter_model() -> str:
    global _cached_free_model, _cached_time
    import time
    
    if _cached_free_model and time.time() - _cached_time < 3600:
        return _cached_free_model
        
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get("https://openrouter.ai/api/v1/models", timeout=10.0)
            res.raise_for_status()
            data = res.json()
            
            free_models = []
            for m in data.get("data", []):
                # We discontinue use of gemini models per user request
                if "gemini" in m["id"].lower():
                    continue
                pricing = m.get("pricing", {})
                if pricing.get("prompt") == "0" and pricing.get("completion") == "0":
                    free_models.append(m)
            
            if free_models:
                # Prefer cohere/north-mini-code:free
                preferred_models = [m for m in free_models if "north-mini-code" in m["id"].lower()]
                selected = preferred_models[0]["id"] if preferred_models else free_models[0]["id"]
                _cached_free_model = selected
                _cached_time = time.time()
                logger.info(f"Selected free OpenRouter model: {_cached_free_model}")
                return _cached_free_model
    except Exception as e:
        logger.error(f"Failed to fetch free models from OpenRouter: {e}")
        
    return "cohere/north-mini-code:free"

async def _call_openrouter(prompt: str, model: str, response_mime_type: str):
    api_key = settings.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.eulerfold.com", # Required by OpenRouter
        "X-Title": "EulerFold Cloud AI" # Optional
    }
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "top_p": 0.95,
    }
    
    if response_mime_type == "application/json":
        payload["response_format"] = {"type": "json_object"}

    max_retries = 3

    async with httpx.AsyncClient() as client:
        for attempt in range(max_retries):
            try:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=180.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    raise RuntimeError("Empty choices from OpenRouter")
                    
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage") or {}
                if usage.get("prompt_tokens", 0) == 0 and usage.get("completion_tokens", 0) == 0:
                    pt = max(1, len(prompt) // 4)
                    ct = max(1, len(content) // 4)
                    usage = {"prompt_tokens": pt, "completion_tokens": ct, "total_tokens": pt + ct}
                    
                return content, usage, model

            except httpx.HTTPStatusError as e:
                error_msg = response.text
                logger.error(f"OpenRouter HTTP Error {e.response.status_code}: {error_msg}")
                
                if e.response.status_code == 429:
                    if attempt == max_retries - 1:
                        raise HTTPException(
                            status_code=429, 
                            detail="The AI engine is currently under heavy load or rate-limited on OpenRouter. Please try again in a few minutes."
                        )
                elif e.response.status_code >= 400 and e.response.status_code < 500 and e.response.status_code != 429:
                    # Client errors (like context length exceeded, invalid key) shouldn't be retried
                    raise RuntimeError(f"OpenRouter client error: {e.response.status_code} - {error_msg}")
                
                if attempt == max_retries - 1:
                    raise RuntimeError(f"OpenRouter generation failed after {max_retries} attempts: {e}")
                    
            except Exception as e:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"OpenRouter generation failed after {max_retries} attempts: {str(e)}")
            
            wait_time = (attempt + 1) * 2
            logger.warning(f"OpenRouter attempt {attempt + 1} failed, retrying in {wait_time}s...")
            await asyncio.sleep(wait_time)


async def _call_groq(prompt: str, model: str, response_mime_type: str):
    api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not configured for fallback")

    # Map OpenRouter model names to Groq models
    groq_model = "llama-3.1-8b-instant" # default fallback
    if "sonnet" in model.lower() or "pro" in model.lower() or "gpt-4o" in model.lower() and "mini" not in model.lower() or "70b" in model.lower():
        groq_model = "llama-3.3-70b-versatile"
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": groq_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "top_p": 0.95,
    }
    
    if response_mime_type == "application/json":
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient() as client:
        try:
            logger.info(f"Attempting Groq fallback with model {groq_model}...")
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=180.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" not in data or not data["choices"]:
                raise RuntimeError("Empty choices from Groq")
                
            return data["choices"][0]["message"]["content"], data.get("usage", {}), model
        except httpx.HTTPStatusError as e:
            logger.error(f"Groq HTTP Error {e.response.status_code}: {e.response.text}")
            raise RuntimeError(f"Groq fallback failed: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Groq fallback failed: {str(e)}")
            raise RuntimeError(f"Groq fallback failed: {str(e)}")


async def _call_cohere(prompt: str, response_mime_type: str):
    api_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    if not api_key:
        raise RuntimeError("COHERE_API_KEY not configured for fallback")
        
    co = cohere.AsyncClientV2(api_key=api_key)
    cohere_model = "command-a-03-2025"
    
    logger.info(f"Attempting Cohere fallback with model {cohere_model}...")
    
    kwargs = {
        "model": cohere_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
    }
    
    if response_mime_type == "application/json":
        kwargs["response_format"] = {"type": "json_object"}
        
    response = await co.chat(**kwargs)
    
    if not response or not response.message or not response.message.content:
        raise RuntimeError("Empty response from Cohere")
        
    usage = {
        "prompt_tokens": int(response.usage.tokens.input_tokens) if hasattr(response.usage, "tokens") and hasattr(response.usage.tokens, "input_tokens") and response.usage.tokens.input_tokens is not None else 0,
        "completion_tokens": int(response.usage.tokens.output_tokens) if hasattr(response.usage, "tokens") and hasattr(response.usage.tokens, "output_tokens") and response.usage.tokens.output_tokens is not None else 0,
        "total_tokens": int((response.usage.tokens.input_tokens or 0) + (response.usage.tokens.output_tokens or 0)) if hasattr(response.usage, "tokens") else 0
    } if hasattr(response, "usage") else {}
        
    return response.message.content[0].text, usage, cohere_model

async def _call_gemini(prompt: str, response_mime_type: str):
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured for fallback")
        
    client = genai.Client(api_key=api_key)
    gemini_model = "gemini-2.5-flash"
    
    logger.info(f"Attempting Gemini fallback with model {gemini_model}...")
    
    config = types.GenerateContentConfig(
        temperature=0.1,
        response_mime_type=response_mime_type,
    )
    
    response = await client.aio.models.generate_content(
        model=gemini_model,
        contents=prompt,
        config=config
    )
    
    if not response or not response.text:
        raise RuntimeError("Empty response from Gemini")
        
        usage = {}
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        usage = {
            "prompt_tokens": response.usage_metadata.prompt_token_count or 0,
            "completion_tokens": response.usage_metadata.candidates_token_count or 0,
            "total_tokens": response.usage_metadata.total_token_count or 0
        }
        
    return response.text, usage, gemini_model

async def _call_huggingface(prompt: str, response_mime_type: str):
    api_key = settings.HF_API_TOKEN or os.getenv("HF_API_TOKEN")
    if not api_key:
        raise RuntimeError("HF_API_TOKEN not configured for fallback")
        
    client = AsyncInferenceClient(api_key=api_key)
    # Using a highly capable but small model (7B parameters) to avoid free inference memory limits
    hf_model = "Qwen/Qwen2.5-7B-Instruct"
    
    logger.info(f"Attempting Hugging Face fallback with model {hf_model}...")
    
    kwargs = {
        "model": hf_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
    }
    
    response = await client.chat_completion(**kwargs)
    
    if not response or not response.choices:
        raise RuntimeError("Empty response from Hugging Face")
        
    usage = {
        "prompt_tokens": response.usage.prompt_tokens if hasattr(response, "usage") else 0,
        "completion_tokens": response.usage.completion_tokens if hasattr(response, "usage") else 0,
        "total_tokens": response.usage.total_tokens if hasattr(response, "usage") else 0
    }
        
    return response.choices[0].message.content, usage, hf_model

async def generate_text(prompt: str, model: str = None, response_mime_type: str = None, return_usage: bool = False):
    """Generates text from OpenRouter, with a fallback cascade: Groq -> Cohere -> Gemini -> Hugging Face."""
    # Enforce fastest available free model for OpenRouter
    openrouter_model = await get_fastest_free_openrouter_model()
    
    def _attach_model(usage_dict, model_name):
        usage_dict["model_name"] = model_name
        return usage_dict

    try:
        actual_model = model or openrouter_model
        text, usage, used_model = await _call_openrouter(prompt, actual_model, response_mime_type)
        return (text, _attach_model(usage, used_model)) if return_usage else text
    except Exception as e:
        logger.error(f"Primary OpenRouter call failed: {e}. Attempting Groq fallback...")
        try:
            text, usage, used_model = await _call_groq(prompt, model or openrouter_model, response_mime_type)
            return (text, _attach_model(usage, used_model)) if return_usage else text
        except Exception as groq_e:
            logger.error(f"Groq fallback failed: {groq_e}. Attempting Cohere fallback...")
            try:
                text, usage, used_model = await _call_cohere(prompt, response_mime_type)
                return (text, _attach_model(usage, used_model)) if return_usage else text
            except Exception as cohere_e:
                logger.error(f"Cohere fallback failed: {cohere_e}. Attempting Gemini fallback...")
                try:
                    text, usage, used_model = await _call_gemini(prompt, response_mime_type)
                    return (text, _attach_model(usage, used_model)) if return_usage else text
                except Exception as gemini_e:
                    logger.error(f"Gemini fallback failed: {gemini_e}. Attempting Hugging Face fallback...")
                    try:
                        text, usage, used_model = await _call_huggingface(prompt, response_mime_type)
                        return (text, _attach_model(usage, used_model)) if return_usage else text
                    except Exception as hf_e:
                        logger.error(f"All AI providers failed.")
                        raise Exception(f"AI generation failed completely.\\nOpenRouter: {e}\\nGroq: {groq_e}\\nCohere: {cohere_e}\\nGemini: {gemini_e}\\nHugging Face: {hf_e}")

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
            
    # 3. Fix invalid escape sequences (e.g. \-, \escape)
    # Valid JSON escapes are \", \\, \/, \b, \f, \n, \r, \t, \u
    text = re.sub(r'(?<!\\)\\([^"\\/bfnrtu])', r'\1', text)
    
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
    if HAS_JSON_REPAIR:
        try:
            return repair_loads(cleaned)
        except Exception as e:
            logger.warning(f"json_repair failed: {e}")
            
    # Strategy 3: Manual repair for common AI issues
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
    if HAS_JSON_REPAIR:
        try:
            open_braces = cleaned.count('{') - cleaned.count('}')
            open_brackets = cleaned.count('[') - cleaned.count(']')
            
            last_ditch = cleaned
            if open_brackets > 0:
                last_ditch += ']' * open_brackets
            if open_braces > 0:
                last_ditch += '}' * open_braces
                
            return repair_loads(last_ditch)
        except:
            pass

    logger.error(f"Failed to parse JSON. Length: {len(cleaned)}. Error context: {cleaned[-500:]}")
    return json.loads(cleaned)

def log_backend_ai_usage(sb, user_id, subject, usage, source="backend", status="success", error_message=None):
    if not usage: return
    try:
        log_entry = {
            "user_id": user_id,
            "model_name": usage.get("model_name", "Unknown"),
            "subject": subject,
            "prompt_tokens": usage.get("prompt_tokens", 0),
            "completion_tokens": usage.get("completion_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
            "status": status,
            "source": source,
            "error_message": error_message
        }
        sb.table("ai_usage_logs").insert(log_entry).execute()
    except Exception as e:
        logger.error(f"Failed to log backend AI usage: {e}")

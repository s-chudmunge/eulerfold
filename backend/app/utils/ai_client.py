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
    from json_repair import repair_json, loads as repair_loads
    HAS_JSON_REPAIR = True
except ImportError:
    HAS_JSON_REPAIR = False

logger = logging.getLogger(__name__)

_cached_free_model = None
_cached_time = 0

# Preferred free models ranked by structured JSON capability
PREFERRED_FREE_MODELS = [
    "nvidia/nemotron-3.5-lightning:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "google/gemma-4-31b-it:free",
    "poolside/laguna-s-2.1:free",
    "z-ai/glm-5.2:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "cohere/north-mini-code:free",
    "openrouter/free"
]

async def get_fastest_free_openrouter_model() -> str:
    global _cached_free_model, _cached_time
    import time
    
    if _cached_free_model and time.time() - _cached_time < 3600:
        return _cached_free_model
        
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get("https://openrouter.ai/api/v1/models", timeout=10.0)
            res.raise_for_status()
            data = res.json()
            
            # Select the very first available free model with adequate context
            for m in data.get("data", []):
                pricing = m.get("pricing", {})
                if str(pricing.get("prompt")) == "0" and str(pricing.get("completion")) == "0":
                    if m.get("context_length", 0) >= 8000:
                        _cached_free_model = m["id"]
                        _cached_time = time.time()
                        logger.info(f"Selected first available free OpenRouter model: {_cached_free_model}")
                        return _cached_free_model
                        
    except Exception as e:
        logger.error(f"Failed to fetch free models from OpenRouter: {e}")
        
    # Absolute fallback
    return "openrouter/free"


async def _call_ollama(prompt: str, response_mime_type: str):
    # Try localhost ollama
    endpoint = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama3.1", # Or mistral, etc. We'll use llama3.1 as standard local.
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }
    if response_mime_type == "application/json":
        payload["format"] = "json"
        
    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(endpoint, json=payload)
        response.raise_for_status()
        data = response.json()
        
        usage = {
            "total_tokens": data.get("eval_count", 0) + data.get("prompt_eval_count", 0),
            "prompt_tokens": data.get("prompt_eval_count", 0),
            "completion_tokens": data.get("eval_count", 0)
        }
        return data["message"]["content"], usage, "ollama/llama3.1"

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
        "max_tokens": 8192,
    }
    
    # We intentionally DO NOT pass "response_format": {"type": "json_object"} 
    # to OpenRouter because many free models throw 400 errors if they don't support the API feature.
    # The prompt explicitly asks for JSON, and our parser handles it.

    max_retries = 2

    async with httpx.AsyncClient(timeout=90.0) as client:
        for attempt in range(max_retries):
            if attempt > 0 and model.endswith(":free"):
                # Rotate to another free model on retry
                fallback_idx = attempt % len(PREFERRED_FREE_MODELS)
                payload["model"] = PREFERRED_FREE_MODELS[fallback_idx]
                logger.info(f"OpenRouter attempt {attempt + 1}: Retrying with fallback free model {payload['model']}...")
                
            try:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=90.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                if "choices" not in data or not data["choices"]:
                    raise RuntimeError("Empty choices from OpenRouter")
                    
                content = data["choices"][0]["message"]["content"]
                if not content or not content.strip() or content.strip() == "{}":
                    raise RuntimeError("Model returned empty or trivial text completion")
                    
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

    # Dynamically select from currently supported Groq API models
    groq_model = "openai/gpt-oss-120b"
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": groq_model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "top_p": 0.95,
        "max_tokens": 8192,
    }
    
    if response_mime_type == "application/json":
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            logger.info(f"Attempting Groq fallback with model {groq_model}...")
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=90.0
            )
            response.raise_for_status()
            data = response.json()
            
            if "choices" not in data or not data["choices"]:
                raise RuntimeError("Empty choices from Groq")
                
            content = data["choices"][0]["message"]["content"]
            if not content or not content.strip() or content.strip() == "{}":
                raise RuntimeError("Model returned empty or trivial text completion")
                
            return content, data.get("usage", {}), groq_model
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
    import time
    # Enforce fastest available free model for OpenRouter
    openrouter_model = await get_fastest_free_openrouter_model()
    
    prompt_len = len(prompt)
    json_mode = response_mime_type == "application/json"
    
    def _attach_model(usage_dict, model_name):
        usage_dict["model_name"] = model_name
        return usage_dict

    def _log_success(provider: str, model_name: str, usage: dict, elapsed: float):
        tokens = usage.get("total_tokens", 0)
        logger.info(f"[AI] ✓ {provider} ({model_name}) — {tokens} tokens, {elapsed:.1f}s, prompt={prompt_len} chars{' [JSON]' if json_mode else ''}")


    if model in ("eulerfold", "openrouter", ""):
        model = None

    if model == "local":
        t0 = time.time()
        try:
            logger.info(f"[AI] Starting generation — model=local, prompt={prompt_len} chars")
            text, usage, used_model = await _call_ollama(prompt, response_mime_type)
            _log_success("Ollama (Local)", used_model, usage, time.time() - t0)
            return (text, _attach_model(usage, used_model)) if return_usage else text
        except Exception as e:
            logger.error(f"[AI] ✗ Local Ollama failed: {e}")
            raise Exception(f"Local AI failed: {e}. Is Ollama running on localhost:11434?")

    t0 = time.time()
    actual_model = model or openrouter_model
    logger.info(f"[AI] Starting generation — model={actual_model}, prompt={prompt_len} chars{' [JSON]' if json_mode else ''}")

    try:
        text, usage, used_model = await _call_openrouter(prompt, actual_model, response_mime_type)
        _log_success("OpenRouter", used_model, usage, time.time() - t0)
        return (text, _attach_model(usage, used_model)) if return_usage else text
    except Exception as e:
        logger.warning(f"[AI] ✗ OpenRouter failed ({type(e).__name__}: {str(e)[:100]})")
        try:
            text, usage, used_model = await _call_groq(prompt, model or openrouter_model, response_mime_type)
            _log_success("Groq", used_model, usage, time.time() - t0)
            return (text, _attach_model(usage, used_model)) if return_usage else text
        except Exception as groq_e:
            logger.warning(f"[AI] ✗ Groq failed ({type(groq_e).__name__}: {str(groq_e)[:100]})")
            try:
                text, usage, used_model = await _call_cohere(prompt, response_mime_type)
                _log_success("Cohere", used_model, usage, time.time() - t0)
                return (text, _attach_model(usage, used_model)) if return_usage else text
            except Exception as cohere_e:
                logger.warning(f"[AI] ✗ Cohere failed ({type(cohere_e).__name__}: {str(cohere_e)[:100]})")
                try:
                    text, usage, used_model = await _call_gemini(prompt, response_mime_type)
                    _log_success("Gemini", used_model, usage, time.time() - t0)
                    return (text, _attach_model(usage, used_model)) if return_usage else text
                except Exception as gemini_e:
                    logger.warning(f"[AI] ✗ Gemini failed ({type(gemini_e).__name__}: {str(gemini_e)[:100]})")
                    try:
                        logger.info(f"[AI] ⚠ All alternative providers failed. Attempting final Hail Mary with OpenRouter...")
                        text, usage, used_model = await _call_openrouter(prompt, "openrouter/free", response_mime_type)
                        _log_success("OpenRouter (Final Fallback)", used_model, usage, time.time() - t0)
                        return (text, _attach_model(usage, used_model)) if return_usage else text
                    except Exception as or_final_e:
                        try:
                            text, usage, used_model = await _call_huggingface(prompt, response_mime_type)
                            _log_success("HuggingFace", used_model, usage, time.time() - t0)
                            return (text, _attach_model(usage, used_model)) if return_usage else text
                        except Exception as hf_e:
                            elapsed = time.time() - t0
                            logger.error(f"[AI] ✗ All 6 providers failed after {elapsed:.1f}s")
                            raise Exception(f"AI generation failed completely.\\nOpenRouter: {e}\\nGroq: {groq_e}\\nCohere: {cohere_e}\\nGemini: {gemini_e}\\nOpenRouter (Final): {or_final_e}\\nHugging Face: {hf_e}")

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
    parsed = None
    
    # Strategy 1: Standard JSON
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.debug(f"Standard json.loads failed: {e}")
        
    # Strategy 2: json_repair
    if parsed is None and HAS_JSON_REPAIR:
        try:
            parsed = repair_loads(cleaned)
        except Exception as e:
            logger.warning(f"json_repair failed: {e}")
            
    # Strategy 3: Manual repair for common AI issues
    if parsed is None:
        try:
            # Remove trailing commas before closing braces/brackets
            fixed = re.sub(r',\s*([\]\}])', r'\1', cleaned)
            # Fix missing commas between objects/arrays
            fixed = re.sub(r'\}\s*\{', '}, {', fixed)
            fixed = re.sub(r'\]\s*\[', '], [', fixed)
            parsed = json.loads(fixed)
        except:
            pass
            
    # Strategy 4: Last ditch - attempt to find the last valid closing character
    if parsed is None and HAS_JSON_REPAIR:
        try:
            open_braces = cleaned.count('{') - cleaned.count('}')
            open_brackets = cleaned.count('[') - cleaned.count(']')
            
            last_ditch = cleaned
            if open_brackets > 0:
                last_ditch += ']' * open_brackets
            if open_braces > 0:
                last_ditch += '}' * open_braces
                
            parsed = repair_loads(last_ditch)
        except:
            pass

    if parsed is None:
        logger.error(f"Failed to parse JSON. Length: {len(cleaned)}. Error context: {cleaned[-500:]}")
        raise ValueError("The AI model hit its maximum output limit and truncated the response before finishing. This usually happens when generating very long 12-week courses on free models. Please try again with a shorter duration (e.g., 4 weeks) or switch to a Pro model in the Engine menu.")
        
    # Handle double-encoded JSON strings
    if isinstance(parsed, str):
        try:
            parsed = json.loads(parsed)
        except Exception:
            pass
            
    # Ensure dict wrapping for common AI array hallucinations
    if isinstance(parsed, list):
        if len(parsed) == 1 and isinstance(parsed[0], dict):
            # Unwrap if it's just a single dictionary wrapped in an array
            parsed = parsed[0]
        else:
            # If it's a list of modules or mappings, wrap it in a dict
            if len(parsed) > 0 and isinstance(parsed[0], dict) and "canonical_skill" in parsed[0]:
                parsed = {"mappings": parsed}
            else:
                parsed = {"title": "Generated Content", "description": "Auto-generated content.", "modules": parsed, "data": parsed}
                
    # Final fallback if it's still not a dict (e.g. it was just an int, or an unparseable string)
    if not isinstance(parsed, dict):
        parsed = {"title": "Generated Content", "description": str(parsed), "modules": [], "data": parsed}
                
    return parsed

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

async def generate_text_stream(prompt: str, model: str = None, response_mime_type: str = None):
    """Streams generated text tokens from OpenRouter with non-stream fallback."""
    api_key = settings.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY")
    actual_model = model or await get_fastest_free_openrouter_model()

    if api_key:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.eulerfold.com",
            "X-Title": "EulerFold Cloud AI"
        }
        payload = {
            "model": actual_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1,
            "top_p": 0.95,
            "stream": True
        }
        if response_mime_type == "application/json":
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                async with client.stream("POST", "https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk_json = json.loads(data_str)
                                token = chunk_json.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                if token:
                                    yield token
                            except Exception:
                                pass
            return
        except Exception as e:
            logger.error(f"OpenRouter streaming failed: {e}. Falling back to generate_text.")

    full_text = await generate_text(prompt, model=model, response_mime_type=response_mime_type)
    yield full_text

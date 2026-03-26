import json
import logging
import os
import re
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize genai if key is present
if settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY"))

async def generate_text(prompt: str, model: str = "models/gemini-2.5-flash", response_mime_type: str = None) -> str:
    """Generates text from Gemini with standard config."""
    VALID_MODELS = [
        "models/gemini-2.5-flash",
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
    
    # Simple check: if it's a known model or starts with models/ it's likely fine
    is_valid = model in VALID_MODELS or model.startswith("models/gemini") or model.startswith("models/gemma")
    
    if not is_valid:
        raise ValueError(f"Invalid model '{model}'. Must be one of: {VALID_MODELS}")
    
    if not (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")):
        raise RuntimeError("GEMINI_API_KEY not configured")

    try:
        gen_model = genai.GenerativeModel(model)
        
        config = {
            "temperature": 0,
            "top_p": 1,
            "top_k": 1,
            "max_output_tokens": 8192,
        }
        
        if response_mime_type:
            config["response_mime_type"] = response_mime_type
            
        response = gen_model.generate_content(
            prompt,
            generation_config=config,
        )

        if not response or not response.text:
            raise RuntimeError("Empty response from Gemini")

        return response.text

    except Exception as e:
        # HARD FAIL — never return fake text
        raise RuntimeError(f"Gemini generation failed: {str(e)}")

def clean_json_string(text: str) -> str:
    """Removes markdown code blocks, comments, and other non-JSON characters."""
    # 1. Extract content between first [ or { and last ] or }
    # Look for both possible JSON root structures
    match = re.search(r"([\[\{].*[\]\}])", text, re.DOTALL)
    if match:
        text = match.group(1)
    
    # 2. Remove markdown code blocks if they somehow survived
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'```$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
    
    # 3. Remove trailing commas in arrays/objects (common AI mistake)
    text = re.sub(r',\s*([\]\}])', r'\1', text)
    
    # 4. Try to fix unterminated strings by finding the last complete object
    # Count braces to find balanced JSON
    brace_count = 0
    last_valid_pos = -1
    in_string = False
    escape_next = False
    
    for i, char in enumerate(text):
        if escape_next:
            escape_next = False
            continue
        if char == '\\':
            escape_next = True
            continue
        if char == '"' and not escape_next:
            in_string = not in_string
        elif not in_string:
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    last_valid_pos = i
    
    if brace_count > 0 and last_valid_pos > 0:
        # Truncate to the last complete object
        text = text[:last_valid_pos + 1]
    
    return text.strip()

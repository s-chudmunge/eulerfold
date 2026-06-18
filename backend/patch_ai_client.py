import re

with open("app/utils/ai_client.py", "r") as f:
    content = f.read()

# Replace _call_openrouter signature
content = re.sub(r"async def _call_openrouter\([^)]+\) -> str:", "async def _call_openrouter(prompt: str, model: str, response_mime_type: str):", content)
content = content.replace("return data[\"choices\"][0][\"message\"][\"content\"]", 'return data["choices"][0]["message"]["content"], data.get("usage", {}), model')

# Replace _call_groq signature
content = re.sub(r"async def _call_groq\([^)]+\) -> str:", "async def _call_groq(prompt: str, model: str, response_mime_type: str):", content)
content = content.replace("return data[\"choices\"][0][\"message\"][\"content\"]\n        except httpx.HTTPStatusError as e:", 'return data["choices"][0]["message"]["content"], data.get("usage", {}), groq_model\n        except httpx.HTTPStatusError as e:')

# Replace _call_cohere signature
content = re.sub(r"async def _call_cohere\([^)]+\) -> str:", "async def _call_cohere(prompt: str, response_mime_type: str):", content)
cohere_ret = """    usage = {
        "prompt_tokens": response.meta.tokens.input_tokens if hasattr(response.meta.tokens, "input_tokens") else 0,
        "completion_tokens": response.meta.tokens.output_tokens if hasattr(response.meta.tokens, "output_tokens") else 0,
        "total_tokens": ((response.meta.tokens.input_tokens or 0) + (response.meta.tokens.output_tokens or 0)) if hasattr(response.meta.tokens, "input_tokens") else 0
    } if hasattr(response, "meta") and hasattr(response.meta, "tokens") else {}
        
    return response.message.content[0].text, usage, cohere_model"""
content = content.replace("return response.message.content[0].text", cohere_ret)

# Replace _call_gemini signature
content = re.sub(r"async def _call_gemini\([^)]+\) -> str:", "async def _call_gemini(prompt: str, response_mime_type: str):", content)
gemini_ret = """    usage = {}
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        usage = {
            "prompt_tokens": response.usage_metadata.prompt_token_count or 0,
            "completion_tokens": response.usage_metadata.candidates_token_count or 0,
            "total_tokens": response.usage_metadata.total_token_count or 0
        }
        
    return response.text, usage, gemini_model"""
content = content.replace("return response.text", gemini_ret)

# Replace _call_huggingface signature
content = re.sub(r"async def _call_huggingface\([^)]+\) -> str:", "async def _call_huggingface(prompt: str, response_mime_type: str):", content)
hf_ret = """    usage = {
        "prompt_tokens": response.usage.prompt_tokens if hasattr(response, "usage") else 0,
        "completion_tokens": response.usage.completion_tokens if hasattr(response, "usage") else 0,
        "total_tokens": response.usage.total_tokens if hasattr(response, "usage") else 0
    }
        
    return response.choices[0].message.content, usage, hf_model"""
content = content.replace("return response.choices[0].message.content", hf_ret)

# Replace generate_text
gen_text_old = """async def generate_text(prompt: str, model: str = None, response_mime_type: str = None) -> str:
    \"\"\"Generates text from OpenRouter, with a fallback cascade: Groq -> Cohere -> Gemini -> Hugging Face.\"\"\"
    # Enforce fastest available free model for OpenRouter
    openrouter_model = await get_fastest_free_openrouter_model()
    
    try:
        return await _call_openrouter(prompt, openrouter_model, response_mime_type)
    except Exception as e:
        logger.error(f"Primary OpenRouter call failed: {e}. Attempting Groq fallback...")
        try:
            return await _call_groq(prompt, model or openrouter_model, response_mime_type)
        except Exception as groq_e:
            logger.error(f"Groq fallback failed: {groq_e}. Attempting Cohere fallback...")
            try:
                return await _call_cohere(prompt, response_mime_type)
            except Exception as cohere_e:
                logger.error(f"Cohere fallback failed: {cohere_e}. Attempting Gemini fallback...")
                try:
                    return await _call_gemini(prompt, response_mime_type)
                except Exception as gemini_e:
                    logger.error(f"Gemini fallback failed: {gemini_e}. Attempting Hugging Face fallback...")
                    try:
                        return await _call_huggingface(prompt, response_mime_type)
                    except Exception as hf_e:
                        logger.error(f"All AI providers failed.")
                        raise Exception(f"AI generation failed completely.\\nOpenRouter: {e}\\nGroq: {groq_e}\\nCohere: {cohere_e}\\nGemini: {gemini_e}\\nHugging Face: {hf_e}")"""

gen_text_new = """async def generate_text(prompt: str, model: str = None, response_mime_type: str = None, return_usage: bool = False):
    \"\"\"Generates text from OpenRouter, with a fallback cascade: Groq -> Cohere -> Gemini -> Hugging Face.\"\"\"
    # Enforce fastest available free model for OpenRouter
    openrouter_model = await get_fastest_free_openrouter_model()
    
    text, usage, model_used = "", {}, ""
    try:
        text, usage, model_used = await _call_openrouter(prompt, openrouter_model, response_mime_type)
    except Exception as e:
        logger.error(f"Primary OpenRouter call failed: {e}. Attempting Groq fallback...")
        try:
            text, usage, model_used = await _call_groq(prompt, model or openrouter_model, response_mime_type)
        except Exception as groq_e:
            logger.error(f"Groq fallback failed: {groq_e}. Attempting Cohere fallback...")
            try:
                text, usage, model_used = await _call_cohere(prompt, response_mime_type)
            except Exception as cohere_e:
                logger.error(f"Cohere fallback failed: {cohere_e}. Attempting Gemini fallback...")
                try:
                    text, usage, model_used = await _call_gemini(prompt, response_mime_type)
                except Exception as gemini_e:
                    logger.error(f"Gemini fallback failed: {gemini_e}. Attempting Hugging Face fallback...")
                    try:
                        text, usage, model_used = await _call_huggingface(prompt, response_mime_type)
                    except Exception as hf_e:
                        logger.error(f"All AI providers failed.")
                        raise Exception(f"AI generation failed completely.\\nOpenRouter: {e}\\nGroq: {groq_e}\\nCohere: {cohere_e}\\nGemini: {gemini_e}\\nHugging Face: {hf_e}")

    if return_usage:
        usage["model_name"] = model_used
        return text, usage
    return text"""

content = content.replace(gen_text_old, gen_text_new)

with open("app/utils/ai_client.py", "w") as f:
    f.write(content)


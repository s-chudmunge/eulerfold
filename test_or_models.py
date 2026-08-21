import requests

try:
    res = requests.get("https://openrouter.ai/api/v1/models")
    data = res.json()
    free_models = []
    for m in data.get("data", []):
        pricing = m.get("pricing", {})
        if pricing.get("prompt") == "0" and pricing.get("completion") == "0":
            free_models.append((m["id"], m.get("context_length", 0)))
            
    free_models.sort(key=lambda x: x[1], reverse=True)
    for model_id, ctx in free_models:
        print(f"{model_id} (Context: {ctx})")
except Exception as e:
    print(f"Error: {e}")

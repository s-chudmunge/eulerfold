import os
import sys
import json
import urllib.request
from urllib.error import HTTPError

env_vars = {}
try:
    with open("backend/.env") as f:
        for line in f:
            if "=" in line:
                k, v = line.strip().split("=", 1)
                env_vars[k] = v.strip('"\'')
except Exception as e:
    pass

url = env_vars.get("SUPABASE_URL")
key = env_vars.get("SUPABASE_KEY")

def supabase_get(endpoint):
    req_url = f"{url}/rest/v1/{endpoint}"
    req = urllib.request.Request(req_url, headers={
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except HTTPError as e:
        return []

print("=== Original Roadmap 76 ===")
roadmaps = supabase_get(f"roadmaps?id=eq.76&select=title,email,is_public")
if roadmaps:
    print(roadmaps[0])

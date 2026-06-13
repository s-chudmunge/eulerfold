import requests
import json
import re
import os

with open('.env', 'r') as f:
    for line in f:
        if line.startswith('SUPABASE_KEY='):
            key = line.strip().split('=', 1)[1].strip('"')
        if line.startswith('SUPABASE_URL='):
            url = line.strip().split('=', 1)[1].strip('"')

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

get_url = f"{url}/rest/v1/research_lab_decodes?id=eq.5f512dd7-28a1-43e7-8be4-8bb34d479cf5&select=core_analysis"
res = requests.get(get_url, headers=headers)
data = res.json()

if data:
    analysis = data[0]['core_analysis']
    for mod in analysis.get('modules', []):
        if mod['label'] == 'Concept':
            text = mod['data']['details']
            
            # Use regex to find and wrap specific math patterns just in case
            text = re.sub(r'\(A\(\\mathbf\{x\}\)\)', r'$(A(\\mathbf{x}))$', text)
            text = re.sub(r'\(W\(\\mathbf\{r\},h\)\)', r'$(W(\\mathbf{r},h))$', text)
            text = re.sub(r'(⟨A\(\\mathbf\{x\}_i\)⟩.*?\))', r'$$\1$$', text)
            
            # also replace any bare equations like (Eq. 3) just to be safe
            text = text.replace('(h)', '$(h)$')
            mod['data']['details'] = text
            print("Patched text:\n", text)
            
    patch_url = f"{url}/rest/v1/research_lab_decodes?id=eq.5f512dd7-28a1-43e7-8be4-8bb34d479cf5"
    patch_res = requests.patch(patch_url, headers=headers, json={"core_analysis": analysis})
    print("Patch status:", patch_res.status_code)

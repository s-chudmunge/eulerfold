import requests
import json
import os

with open('.env', 'r') as f:
    for line in f:
        if line.startswith('SUPABASE_KEY='):
            key = line.strip().split('=', 1)[1]
        if line.startswith('SUPABASE_URL='):
            url = line.strip().split('=', 1)[1]

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
            # Manual patching of the missing math delimiters
            text = text.replace('(A(\\mathbf{x}))', '$(A(\\mathbf{x}))$')
            text = text.replace('(W(\\mathbf{r},h))', '$(W(\\mathbf{r},h))$')
            text = text.replace('⟨A(\\mathbf{x}_i)⟩ = \\sum_{j\\in\\mathcal{N}(i)} \\frac{m_j}{\\rho_j}\\,A_j\\,W(\\mathbf{x}_i-\\mathbf{x}_j,h)', '$$ \\langle A(\\mathbf{x}_i) \\rangle = \\sum_{j\\in\\mathcal{N}(i)} \\frac{m_j}{\\rho_j}\\,A_j\\,W(\\mathbf{x}_i-\\mathbf{x}_j,h) $$')
            text = text.replace('(h)', '$(h)$')
            mod['data']['details'] = text
            
    patch_url = f"{url}/rest/v1/research_lab_decodes?id=eq.5f512dd7-28a1-43e7-8be4-8bb34d479cf5"
    patch_res = requests.patch(patch_url, headers=headers, json={"core_analysis": analysis})
    print("Patch status:", patch_res.status_code)

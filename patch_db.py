import sys
import json
sys.path.append('/home/sankalp/Documents/projects/eulerfold/backend')
from app.database import get_supabase_client

sb = get_supabase_client()
res = sb.table("research_lab_decodes").select("core_analysis").eq("id", "5f512dd7-28a1-43e7-8be4-8bb34d479cf5").execute()

if res.data:
    analysis = res.data[0]['core_analysis']
    for mod in analysis.get('modules', []):
        if mod['label'] == 'Concept':
            mod['data']['details'] = mod['data']['details'].replace('<A(x_i)>', '$\\langle A(\\mathbf{x}_i) \\rangle$').replace('\\sum', '$\\sum').replace('x_j, h)', 'x_j, h)$').replace('A(x)', '$A(\\mathbf{x})$').replace('W(r, h)', '$W(\\mathbf{r}, h)$')
    
    sb.table("research_lab_decodes").update({"core_analysis": analysis}).eq("id", "5f512dd7-28a1-43e7-8be4-8bb34d479cf5").execute()
    print("Patched DB successfully!")

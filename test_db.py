import sys
import os
sys.path.append('/home/sankalp/Documents/projects/eulerfold/backend')
from app.database import supabase

data = supabase.table("research_lab_decodes").select("core_analysis").eq("id", "5f512dd7-28a1-43e7-8be4-8bb34d479cf5").execute()
if data.data:
    analysis = data.data[0]['core_analysis']
    for mod in analysis.get('modules', []):
        if mod['label'] == 'Concept':
            print("CONCEPT DETAILS:")
            print(repr(mod['details']))

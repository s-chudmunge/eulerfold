import asyncio
from backend.app.core.supabase_client import get_supabase_client

def test():
    sb = get_supabase_client()
    slug = "llm-fine-tuning-from-scratch"
    
    response = sb.table("roadmaps").select("id, email, is_public, clone_count, cloned_from").eq("slug", slug).execute()
    for row in response.data:
        print(row)

test()

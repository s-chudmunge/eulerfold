import asyncio
from backend.app.core.supabase_client import get_supabase_client

def test():
    sb = get_supabase_client()
    slug = "llm-fine-tuning-from-scratch"
    
    response = sb.table("roadmaps").select("*, email").eq("slug", slug).execute()
    
    print(f"Total roadmaps for slug '{slug}': {len(response.data)}")
    
    r = None
    public_version = next((item for item in response.data if item.get("is_public")), None)
    if public_version:
        r = public_version
        print("Found public version!")
        print("Clone count:", r.get("clone_count"))
        print("Cloned from:", r.get("cloned_from"))
        
        # Test my new logic:
        original_clone_count = r.get("clone_count", 0)
        if r.get("cloned_from"):
            orig_res = sb.table("roadmaps").select("clone_count, average_rating, rating_count").eq("id", r["cloned_from"]).execute()
            if orig_res.data:
                original_clone_count = orig_res.data[0].get("clone_count", 0)
        print("Final original clone count:", original_clone_count)

test()

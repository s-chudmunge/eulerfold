import asyncio
from backend.app.core.supabase_client import get_supabase_client

def test():
    sb = get_supabase_client()
    slug = "llm-fine-tuning-from-scratch"
    email = "csankalp21@gmail.com" # Assume this is his email
    
    response = sb.table("roadmaps").select("*, email").eq("slug", slug).execute()
    
    r = None
    if email:
        user_version = next((item for item in response.data if item.get("email", "").lower() == email.lower()), None)
        if user_version:
            r = user_version
            print("Found user version!")

    if not r:
        public_version = next((item for item in response.data if item.get("is_public")), None)
        if public_version:
            r = public_version
            print("Found public version!")

    print("r cloned_from:", r.get("cloned_from"))
    print("r clone_count:", r.get("clone_count"))
    
    original_clone_count = r.get("clone_count", 0)
    if r.get("cloned_from"):
        orig_res = sb.table("roadmaps").select("clone_count").eq("id", r["cloned_from"]).execute()
        if orig_res.data:
            original_clone_count = orig_res.data[0].get("clone_count", 0)
            
    print("Final clone count:", original_clone_count)

test()

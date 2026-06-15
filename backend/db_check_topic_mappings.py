import asyncio
from app.core.supabase_client import get_admin_supabase_client

def main():
    sb = get_admin_supabase_client()
    user_res = sb.table("profiles").select("supabase_uid").eq("email", "jukeask@gmail.com").execute()
    uid = user_res.data[0]["supabase_uid"]
    
    us_res = sb.table("user_skills").select("id, canonical_skill_id, topic_mappings").eq("user_id", uid).execute()
    for us in us_res.data:
        c_res = sb.table("canonical_skills").select("name").eq("id", us["canonical_skill_id"]).execute()
        if c_res.data and "1337" in us.get("topic_mappings", {}):
            print(f"Skill: {c_res.data[0]['name']}, Topics for 1337: {us['topic_mappings']['1337']['topics']}")

main()

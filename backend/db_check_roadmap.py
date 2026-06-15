from app.core.supabase_client import get_admin_supabase_client

def main():
    sb = get_admin_supabase_client()
    res = sb.table("roadmaps").select("subject, roadmap_plan").eq("id", 1337).execute()
    print(res.data)

main()

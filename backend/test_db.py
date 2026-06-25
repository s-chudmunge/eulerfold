from app.core.supabase_client import get_supabase_client
sb = get_supabase_client()
res = sb.table("profiles").select("avatar_url").limit(5).execute()
print(res.data)

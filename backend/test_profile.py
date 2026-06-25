from app.core.supabase_client import get_supabase_client
sb = get_supabase_client()
res = sb.table("profiles").select("*").limit(1).execute()
print(res.data[0].keys())

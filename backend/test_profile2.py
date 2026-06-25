from app.core.supabase_client import get_supabase_client
sb = get_supabase_client()
res = sb.table("profiles").select("metadata").eq("supabase_uid", "b083da08-835f-458a-9b53-1ee01e3036ba").execute()
print(res.data)
try:
    user = sb.auth.admin.get_user_by_id("b083da08-835f-458a-9b53-1ee01e3036ba")
    print(user.user.user_metadata)
except Exception as e:
    print("Auth error:", e)

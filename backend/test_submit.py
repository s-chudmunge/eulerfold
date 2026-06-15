import asyncio
from app.core.supabase_client import get_admin_supabase_client
from fastapi.testclient import TestClient
from app.main import app

def main():
    sb = get_admin_supabase_client()
    # 1. Fetch user id
    user_res = sb.table("profiles").select("supabase_uid").eq("email", "jukeask@gmail.com").execute()
    uid = user_res.data[0]["supabase_uid"]
    
    # 2. Insert active session
    new_session = {
        "user_id": uid,
        "subtopic_id": "b4b21e62-0425-44e3-a3af-f5253641005d",
        "topic_name": "Test",
        "subject": "Test",
        "week_number": 1,
        "questions": [{"question": "Q1?", "options": ["A", "B"], "correct_answer_index": 0}],
        "status": "active"
    }
    insert_res = sb.table("mcq_sessions").insert(new_session).execute()
    session_id = insert_res.data[0]["id"]
    print("Created session:", session_id)
    
    # We can't easily mock Depends(get_current_user) in a raw script without the token.
    # Let's just create an override.
    from app.core.auth import get_current_user
    from app.schemas import User
    
    app.dependency_overrides[get_current_user] = lambda: User(
        supabase_uid=uid, email="jukeask@gmail.com", user_metadata={},
        id=uid, aud="authenticated", created_at="", app_metadata={}
    )
    
    client = TestClient(app)
    response = client.post(f"/practice/mcq/{session_id}/submit", json={"answers": [0]})
    print("Response status:", response.status_code)
    print("Response text:", response.text)

main()

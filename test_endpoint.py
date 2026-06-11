from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath('backend'))
from app.main import app

client = TestClient(app)

# Let's bypass auth by overriding get_current_user
from app.routers.auth import get_current_user
from app.schemas import User

def override_get_current_user():
    return User(email="test@test.com", supabase_uid="123", username="test")

app.dependency_overrides[get_current_user] = override_get_current_user

payload = {
    "roadmap_plan": {"title": "Test", "modules": []},
    "subject": "Test",
    "goal": "Test",
    "time_value": 4,
    "time_unit": "weeks",
    "model": "openai/gpt-4o",
    "is_job_decoded": True
}

response = client.post("/roadmaps/save-external", json=payload)
print(response.status_code)
print(response.json())

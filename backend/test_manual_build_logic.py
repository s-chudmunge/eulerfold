import json
import uuid
import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

# Add the project root to sys.path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.main import app
from app.schemas import User
from app.core.auth import get_current_user

client = TestClient(app)

# Mock User
MOCK_USER = {
    "id": 1,
    "email": "jukeask@gmail.com",
    "username": "sankalp",
    "display_name": "Sankalp C",
    "supabase_uid": "b083da08-835f-458a-9b53-1ee01e3036ba",
    "is_active": True,
    "profile_completed": True,
    "onboarding_completed": True
}

def test_manual_build_logic():
    print("Testing manual build logic (internal via TestClient)...")
    
    manual_plan = {
        "title": "Manual Test Roadmap (Logic)",
        "description": "A manually built roadmap for testing logic",
        "modules": [
            {
                "id": "module_1",
                "title": "Module 1",
                "outcome": "Learn the basics",
                "topics": [
                    {
                        "id": "topic_1_1",
                        "uuid": str(uuid.uuid4()),
                        "title": "First Manual Topic",
                        "youtube_video_id": "dQw4w9WgXcQ",
                        "duration": 10
                    }
                ],
                "resources": [
                    {"id": str(uuid.uuid4()), "title": "Docs", "url": "https://example.com"}
                ]
            }
        ]
    }

    payload = {
        "title": "Manual Test Roadmap (Logic)",
        "description": "A manually built roadmap for testing logic",
        "subject": "Manual Test Roadmap",
        "goal": "A manually built roadmap for testing logic",
        "time_value": 1,
        "time_unit": "weeks",
        "roadmap_plan": manual_plan,
        "model": "manual-build",
        "email": "jukeask@gmail.com"
    }

    # Override the authentication dependency
    app.dependency_overrides[get_current_user] = lambda: User(**MOCK_USER)

    with patch("app.routers.roadmaps.get_supabase_client") as mock_sb_factory:
        mock_sb = MagicMock()
        mock_sb_factory.return_value = mock_sb
        
        # Mock slug check (it's unique)
        mock_sb.table().select().eq().execute.return_value.data = []
        
        # Mock insert response
        mock_sb.table().insert().execute.return_value.data = [{
            "id": 888,
            "slug": "manual-test-roadmap-logic",
            "created_at": "2026-05-05T00:00:00Z",
            "updated_at": "2026-05-05T00:00:00Z",
            **payload
        }]
        
        try:
            response = client.post("/roadmaps/save", json=payload)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Success! Manual build logic works as expected.")
                data = response.json()
                print(f"Created Roadmap ID: {data['id']}")
                print(f"Slug: {data['slug']}")
                
                # Check if internal fields were added/preserved
                plan = data["roadmap_plan"]
                assert plan["modules"][0]["topics"][0]["youtube_video_id"] == "dQw4w9WgXcQ"
                assert "uuid" in plan["modules"][0]["topics"][0]
            else:
                print(f"❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
        finally:
            # Clean up
            del app.dependency_overrides[get_current_user]

if __name__ == "__main__":
    test_manual_build_logic()

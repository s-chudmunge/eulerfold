import pytest
import json
import uuid
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.schemas import User
from app.core.auth import get_current_user

client = TestClient(app)

# Mock User
MOCK_USER = {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "display_name": "Test User",
    "supabase_uid": str(uuid.uuid4()),
    "is_active": True,
    "profile_completed": True,
    "onboarding_completed": True
}

@pytest.fixture
def mock_user():
    return User(**MOCK_USER)

def test_manual_build_save_success(mock_user):
    """
    Verifies that a manual roadmap can be saved to the database.
    This simulates the call made by the ManualRoadmapBuilder component.
    """
    
    manual_plan = {
        "title": "Manual Test Roadmap",
        "description": "A manually built roadmap for testing",
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
        "title": "Manual Test Roadmap",
        "description": "A manually built roadmap for testing",
        "subject": "Manual Test Roadmap",
        "goal": "A manually built roadmap for testing",
        "time_value": 1,
        "time_unit": "weeks",
        "roadmap_plan": manual_plan,
        "model": "manual-build",
        "email": "test@example.com"
    }

    with patch("app.routers.roadmaps.get_supabase_client") as mock_sb_factory:
        mock_sb = MagicMock()
        mock_sb_factory.return_value = mock_sb
        
        # Mock slug check (it's unique)
        mock_sb.table().select().eq().execute.return_value.data = []
        
        # Mock insert response
        mock_sb.table().insert().execute.return_value.data = [{
            "id": 999,
            "slug": "manual-test-roadmap",
            "created_at": "2026-05-05T00:00:00Z",
            "updated_at": "2026-05-05T00:00:00Z",
            **payload
        }]
        
        # Override auth
        app.dependency_overrides[get_current_user] = lambda: mock_user
        
        try:
            response = client.post("/roadmaps/save", json=payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Manual Test Roadmap"
            assert data["id"] == 999
            assert data["model"] == "manual-build"
            
            # Verify structure of roadmap_plan
            plan = data["roadmap_plan"]
            assert len(plan["modules"]) == 1
            assert plan["modules"][0]["topics"][0]["youtube_video_id"] == "dQw4w9WgXcQ"
            
            # Verify backend auto-filled missing IDs if they were missing 
            # (though our builder provides them, the backend should be robust)
            assert "id" in plan["modules"][0]
            assert "uuid" in plan["modules"][0]["topics"][0]
            
            assert mock_sb.table("roadmaps").insert.called
        finally:
            # Clean up dependency override
            del app.dependency_overrides[get_current_user]

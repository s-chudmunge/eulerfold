import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch, AsyncMock
from app.main import app
from app.schemas import User
from app.core.auth import get_current_user
from app.routers.optional_auth import get_optional_current_user

client = TestClient(app)

# User details provided by Sankalp
SANKALP_USER = {
    "id": 100,
    "email": "jukeask@gmail.com",
    "username": "sankalpc",
    "display_name": "Sankalp C",
    "supabase_uid": "b083da08-835f-458a-9b53-1ee01e3036ba",
    "is_active": True,
    "profile_completed": True,
    "onboarding_completed": True
}

@pytest.fixture
def mock_sankalp():
    return User(**SANKALP_USER)

# --- 1. ROADMAP GENERATION TEST ---

def test_generate_roadmap_success(mock_sankalp):
    """Verifies that a user can successfully trigger AI roadmap generation."""
    
    # Mock Gemini response
    mock_roadmap_json = {
        "title": "Python Mastery",
        "description": "A deep dive into Python",
        "depth_score": 2.5,
        "roadmap_plan": {
            "modules": [
                {
                    "title": "Basics",
                    "outcome": "Learn syntax",
                    "timeline": "Week 1",
                    "proof_of_work_instructions": {
                        "what_to_build": "Simple script",
                        "what_counts_as_evidence": "GitHub link",
                        "eval_criteria": ["Correctness"]
                    },
                    "topics": [
                        {"title": "Variables", "subtopics": [{"title": "Int"}, {"title": "String"}]}
                    ],
                    "resources": []
                }
            ]
        }
    }

    with patch("app.routers.roadmaps.generate_text", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = json.dumps(mock_roadmap_json)
        
        with patch("app.routers.roadmaps.get_supabase_client") as mock_sb_factory:
            mock_sb = MagicMock()
            mock_sb_factory.return_value = mock_sb
            
            # Mock slug check and insert
            mock_sb.table().select().eq().execute.return_value.data = [] # Slug unique
            mock_sb.table().insert().execute.return_value.data = [{
                "id": 60,
                "slug": "python-mastery",
                "created_at": "2026-03-10T00:00:00Z",
                "updated_at": "2026-03-10T00:00:00Z",
                **mock_roadmap_json
            }]
            
            # Override auth
            app.dependency_overrides[get_optional_current_user] = lambda: mock_sankalp
            
            try:
                response = client.post(
                    "/roadmaps/generate",
                    json={
                        "subject": "Python",
                        "goal": "Mastery",
                        "time_value": 4,
                        "time_unit": "weeks"
                    }
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["title"] == "Python Mastery"
                assert data["id"] == 60
                assert mock_gen.called
                assert mock_sb.table("roadmaps").insert.called
# --- 2. COMPLETION FLOW TEST ---

def test_mark_topic_complete(mock_sankalp):
    """Verifies that a user can mark a topic as completed and it updates roadmaps."""
    
    mock_roadmap = {
        "id": 60,
        "email": SANKALP_USER["email"],
        "is_public": True,
        "roadmap_plan": {"modules": [{"topics": [{"title": "Variables"}]}]}
    }

    with patch("app.routers.roadmaps.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        
        # Mock initial roadmap fetch
        mock_sb.table("roadmaps").select().eq().execute.return_value.data = [mock_roadmap]
        
        # Mock module_progress check (not all topics complete yet)
        mock_sb.table("module_progress").select().eq().eq().eq().eq().execute.return_value.data = []

        with patch("app.routers.roadmaps.track_activity", new_callable=AsyncMock) as mock_track:
            app.dependency_overrides[get_current_user] = lambda: mock_sankalp
            try:
                response = client.post(
                    "/roadmaps/60/progress",
                    json={"module_number": 1, "topic_index": 0, "completed": True}
                )
                
                assert response.status_code == 200
                
                # Ensure it updated the roadmap's last_position
                mock_sb.table("roadmaps").update.assert_called_with({
                    "last_position": {"mIdx": 0, "tIdx": 0}
                })
                
                # Ensure it upserted the module_progress
                mock_sb.table("module_progress").upsert.assert_called()
                assert mock_track.called
            # --- 3. SUBMISSION FLOW TEST ---

            def test_submit_proof_of_work_success(mock_sankalp):
                """Verifies that a user can submit work and the AI evaluator passes it."""

                mock_roadmap = {
                    "id": 60, "email": SANKALP_USER["email"],
                    "roadmap_plan": {
                        "modules": [{
                            "title": "Basics",
                            "topics": [{"title": "Variables"}],
                            "proof_of_work_instructions": {"what_to_build": "Test script"}
                        }]
                    }
                }

                mock_ai_eval = {
                    "evaluation": "Excellent work on the Python basics.",
                    "evaluation_level": "Solid",
                    "follow_up_question": "What happens if you re-assign a variable?"
                }

                with patch("app.routers.submissions.get_supabase_client") as mock_get_sb:
                    mock_sb = MagicMock()
                    mock_get_sb.return_value = mock_sb

                    # 1. Fetch roadmap
                    mock_sb.table("roadmaps").select().eq().execute.return_value.data = [mock_roadmap]
                    # 2. Gating: check if topics complete
                    mock_sb.table("module_progress").select().eq().eq().eq().eq().execute.return_value.data = [{"topic_index": 0}]
                    # 3. Cooldown: check recent subs
                    mock_sb.table("submissions").select().eq().eq().eq().order().limit().execute.return_value.data = []
                    # 4. Mock insert submission
                    mock_sb.table("submissions").insert().execute.return_value.data = [{"id": 1001}]

                    with patch("app.routers.submissions.generate_text", new_callable=AsyncMock) as mock_gen:
                        mock_gen.return_value = json.dumps(mock_ai_eval)

                        with patch("app.routers.submissions.calculate_user_skill_scores_for_roadmap") as mock_calc:
                            app.dependency_overrides[get_current_user] = lambda: mock_sankalp
                            try:
                                response = client.post(
                                    "/submissions",
                                    json={
                                        "roadmap_id": 60,
                                        "module_number": 1,
                                        "description": "I built a simple variable assignment script in Python. " * 10, # Meet 300 char requirement
                                        "link": "https://github.com/test/repo"
                                    }
                                )

                                assert response.status_code == 200
                                data = response.json()
                                assert data["evaluation"]["evaluation_level"] == "Solid"

                                # Verify system updates
                                mock_sb.table("module_progress").upsert.assert_called()
                                assert mock_calc.called

# --- 5. UI/PROFILE DATA TEST ---

def test_public_profile_view(mock_sankalp):
    """Verifies that the public profile endpoint returns correct calculated data."""
    
    with patch("app.routers.profiles.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        
        # 1. Mock profile fetch
        mock_sb.table("profiles").select().eq().maybe_single().execute.return_value.data = SANKALP_USER
        
        # 2. Mock skills fetch
        mock_sb.table("user_skills").select().eq().order().execute.return_value.data = [
            {
                "id": "skill-1",
                "canonical_skill_id": "cs-1",
                "confidence_score": 85.0,
                "tier": "B",
                "pow_score": 0.8,
                "practice_score": 0.9,
                "topic_completion": 1.0,
                "depth_score": 0.5,
                "time_invested": 12.5,
                "last_updated": "2026-03-10T00:00:00Z",
                "canonical_skills": {"name": "Python", "category": "Programming", "benchmark_hours": 10.0}
            }
        ]
        
        # 3. Mock other lookups
        mock_sb.table("roadmaps").select().in_().execute.return_value.data = []
        mock_sb.table("submissions").select().eq().in_().in_().order().execute.return_value.data = []
        mock_sb.table("practice_progress").select().eq().eq().execute.return_value.data = []

        response = client.get(f"/profile/{SANKALP_USER['username']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == SANKALP_USER["username"]
        assert len(data["skills"]) == 1
        assert data["skills"][0]["name"] == "Python"
        # The profile endpoint recalculates confidence based on the formula
        # 0.8*40 + 0.9*30 + 1.0*15 + 0.5*15 = 32 + 27 + 15 + 7.5 = 81.5
        assert data["skills"][0]["confidence_score"] == 81.5

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from app.main import app
from app.schemas import User
from app.core.auth import get_current_user

client = TestClient(app)

@pytest.fixture
def mock_user():
    return User(
        id=1,
        email="owner@example.com",
        username="owneruser",
        supabase_uid="owner-uid",
        is_active=True,
        profile_completed=True,
        onboarding_completed=True
    )

@pytest.fixture
def mock_other_user():
    return User(
        id=2,
        email="other@example.com",
        username="otheruser",
        supabase_uid="other-uid",
        is_active=True,
        profile_completed=True,
        onboarding_completed=True
    )

def test_update_progress_private_roadmap_unauthorized(mock_other_user):
    mock_roadmap = {"email": "owner@example.com", "is_public": False}
    
    with patch("app.routers.roadmaps.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [mock_roadmap]
        
        app.dependency_overrides[get_current_user] = lambda: mock_other_user
        try:
            response = client.post("/roadmaps/1/progress", json={"module_number": 1, "topic_index": 0, "completed": True})
            assert response.status_code == 403
        finally:
            app.dependency_overrides = {}

def test_update_progress_public_roadmap_non_owner(mock_other_user):
    mock_roadmap = {
        "email": "owner@example.com", 
        "is_public": True,
        "roadmap_plan": {"modules": [{"topics": ["T1"]}]}
    }
    
    with patch("app.routers.roadmaps.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        
        mock_roadmap_table = MagicMock()
        mock_roadmap_table.select.return_value.eq.return_value.execute.return_value.data = [mock_roadmap]
        
        mock_module_progress_table = MagicMock()
        mock_module_progress_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        
        def get_table(name):
            if name == "roadmaps": return mock_roadmap_table
            if name == "module_progress": return mock_module_progress_table
            return MagicMock()
            
        mock_sb.table.side_effect = get_table
        
        with patch("app.routers.roadmaps.track_activity", return_value=None):
            app.dependency_overrides[get_current_user] = lambda: mock_other_user
            try:
                response = client.post("/roadmaps/1/progress", json={"module_number": 1, "topic_index": 0, "completed": True})
                assert response.status_code == 200
                
                # Verify that update was NOT called on roadmaps for non-owner
                assert not mock_roadmap_table.update.called
                
                # Verify upsert was called on module_progress
                assert mock_module_progress_table.upsert.called
            finally:
                app.dependency_overrides = {}

def test_update_progress_owner(mock_user):
    mock_roadmap = {
        "email": "owner@example.com", 
        "is_public": True,
        "roadmap_plan": {"modules": [{"topics": ["T1"]}]}
    }
    
    with patch("app.routers.roadmaps.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        
        mock_roadmap_table = MagicMock()
        mock_roadmap_table.select.return_value.eq.return_value.execute.return_value.data = [mock_roadmap]
        
        mock_module_progress_table = MagicMock()
        mock_module_progress_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        
        def get_table(name):
            if name == "roadmaps": return mock_roadmap_table
            if name == "module_progress": return mock_module_progress_table
            return MagicMock()
            
        mock_sb.table.side_effect = get_table
        
        with patch("app.routers.roadmaps.track_activity", return_value=None):
            app.dependency_overrides[get_current_user] = lambda: mock_user
            try:
                response = client.post("/roadmaps/1/progress", json={"module_number": 1, "topic_index": 0, "completed": True})
                assert response.status_code == 200
                
                # Verify that update WAS called on roadmaps for owner
                assert mock_roadmap_table.update.called
                
                # Verify upsert was called on module_progress
                assert mock_module_progress_table.upsert.called
            finally:
                app.dependency_overrides = {}

def test_reset_progress_public_roadmap_non_owner(mock_other_user):
    mock_roadmap = {"email": "owner@example.com", "is_public": True}
    
    with patch("app.routers.roadmaps.get_supabase_client") as mock_get_sb:
        mock_sb = MagicMock()
        mock_get_sb.return_value = mock_sb
        
        mock_roadmap_table = MagicMock()
        mock_roadmap_table.select.return_value.eq.return_value.execute.return_value.data = [mock_roadmap]
        
        mock_module_progress_table = MagicMock()
        
        def get_table(name):
            if name == "roadmaps": return mock_roadmap_table
            if name == "module_progress": return mock_module_progress_table
            return MagicMock()
            
        mock_sb.table.side_effect = get_table
        
        app.dependency_overrides[get_current_user] = lambda: mock_other_user
        try:
            response = client.post("/roadmaps/1/progress/reset")
            assert response.status_code == 200
            
            # Verify update was NOT called on roadmaps
            assert not mock_roadmap_table.update.called
            
            # Verify delete was called on module_progress
            assert mock_module_progress_table.delete.called
        finally:
            app.dependency_overrides = {}

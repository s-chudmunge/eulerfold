
import asyncio
import unittest
from unittest.mock import MagicMock, patch
from app.routers.auth import complete_onboarding, UserOnboardingRequest
from app.schemas import User

class TestOnboardingNameResolution(unittest.IsolatedAsyncioTestCase):
    @patch("app.routers.auth.get_supabase_client")
    @patch("app.routers.auth.send_welcome_email")
    async def test_name_resolution(self, mock_send_email, mock_supabase):
        # 1. Setup Mock User from JWT (has name)
        current_user = User(
            id=1,
            supabase_uid="test-uuid",
            email="sankalp@example.com",
            display_name="Sankalp Chudmunge",
            username="user_123",
            profile_completed=False
        )

        # 2. Setup Mock Onboarding Data (frontend doesn't send name)
        onboarding_data = UserOnboardingRequest(username="sankalp_new")

        # 3. Setup Mock Supabase Response (profile has default name)
        mock_db = MagicMock()
        mock_supabase.return_value = mock_db
        
        # Mock Check Username
        mock_db.table().select().eq().neq().execute.return_value.data = []
        
        # Mock Update Profile
        mock_db.table().update().eq().execute.return_value.data = [{
            "email": "sankalp@example.com",
            "display_name": "EulerFold User", # The default from trigger
            "username": "sankalp_new"
        }]

        # 4. Run Onboarding
        await complete_onboarding(onboarding_data, current_user)

        # 5. Verify what name was sent to the email function
        args, kwargs = mock_send_email.call_args
        sent_name = args[1]
        
        print(f"\n[TEST] Name provided in JWT: {current_user.display_name}")
        print(f"[TEST] Name in Database: EulerFold User")
        print(f"[TEST] Name sent to Email: {sent_name}")
        
        # Current logic checks: name = onboarding_data.display_name or profile_data.get("display_name")
        # profile_data.get("display_name") IS "EulerFold User", so it uses that.
        self.assertNotEqual(sent_name, "EulerFold User", "Email should not use the default 'EulerFold User' name")
        self.assertEqual(sent_name, "Sankalp Chudmunge", "Email should have used the name from the JWT/Signup")

if __name__ == "__main__":
    unittest.main()

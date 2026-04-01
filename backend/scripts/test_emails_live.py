import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to the sys.path so we can import app
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from app.utils.resend_client import send_welcome_email, send_onboarding_email

async def main():
    test_email = "jukeask@gmail.com"
    test_name = "Sankalp"
    test_username = "sankalp_test"
    
    print(f"🚀 Starting live email test for {test_email}...")

    # 1. Test Welcome Email
    try:
        print("Sending Welcome Email...")
        welcome_res = await send_welcome_email(
            to=test_email, 
            display_name=test_name, 
            username=test_username
        )
        print(f"✅ Welcome Email Sent! ID: {welcome_res.get('id')}")
    except Exception as e:
        print(f"❌ Failed to send Welcome Email: {e}")

    # 2. Test Roadmap Ready Email
    try:
        print("\nSending Roadmap Ready Email...")
        onboarding_res = await send_onboarding_email(
            to=test_email,
            subject="Quantum Computing",
            goal="Understand Shor's Algorithm and build a simulator",
            modules=[{"title": "Introduction to Qubits"}, {"title": "Quantum Gates"}],
            unsubscribe_link="https://www.eulerfold.com/unsubscribe",
            roadmap_slug="quantum-computing-123",
            display_name=test_name
        )
        print(f"✅ Roadmap Ready Email Sent! ID: {onboarding_res.get('id')}")
    except Exception as e:
        print(f"❌ Failed to send Roadmap Ready Email: {e}")

    print("\n✨ Test complete. Check your inbox!")

if __name__ == "__main__":
    asyncio.run(main())

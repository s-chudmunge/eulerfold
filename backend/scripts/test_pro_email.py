import asyncio
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.utils.emails.pro_activation import send_pro_activation_email
from app.core.config import settings

async def main():
    test_email = "jukeask@gmail.com"
    test_name = "Sankalp"
    
    print(f"--- Sending Pro Activation test email to: {test_email} ---")
    
    if not settings.RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY is not set in environment or .env file.")
        return

    try:
        response = await send_pro_activation_email(test_email, test_name)
        print(f"SUCCESS: Email sent! Response: {response}")
    except Exception as e:
        print(f"FAILED: Could not send email. Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

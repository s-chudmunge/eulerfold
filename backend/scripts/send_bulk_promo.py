import asyncio
import csv
import os
import sys
import logging
import re

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.utils.emails.promotional import send_promo_launch_email
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bulk_email_log.log')
    ]
)
logger = logging.getLogger(__name__)

def extract_name_from_email(email: str) -> str:
    """Derive a first name from email handle (e.g., aayushee.gupta1 -> Aayushee)"""
    handle = email.split('@')[0]
    # Take part before the first dot
    first_part = handle.split('.')[0]
    # Remove any trailing numbers
    name = re.sub(r'\d+', '', first_part)
    # Capitalize
    return name.capitalize() if name else None

async def send_to_email(email: str, name: str):
    """Wrapper to send email with error handling."""
    try:
        response = await send_promo_launch_email(email.strip(), name)
        logger.info(f"✅ SUCCESS: Sent to {email} (Greeting: Hi {name or 'there'}). ID: {response.get('id')}")
        return True
    except Exception as e:
        logger.error(f"❌ FAILED: Could not send to {email}. Error: {e}")
        return False

async def main():
    csv_path = 'backend/scripts/promotion.csv'
    target_column = 'IIIT Banglore'
    start_index = 11  # Resume from the 11th record
    
    if not os.path.exists(csv_path):
        logger.error(f"CSV file not found at {csv_path}")
        return

    if not settings.RESEND_API_KEY:
        logger.error("RESEND_API_KEY is not set.")
        return

    emails = []
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                email = row.get(target_column)
                if email and '@' in email:
                    emails.append(email.strip())
    except Exception as e:
        logger.error(f"Error reading CSV: {e}")
        return

    total = len(emails)
    if total == 0:
        logger.warning(f"No valid emails found in column '{target_column}'")
        return

    logger.info(f"🚀 Resuming bulk send from record {start_index}/{total} from {target_column}...")
    
    success_count = 0
    # Process from start_index (1-based)
    for i in range(start_index - 1, total):
        email = emails[i]
        name = extract_name_from_email(email)
        
        logger.info(f"[{i+1}/{total}] Processing {email}...")
        success = await send_to_email(email, name)
        if success:
            success_count += 1
        
        # Small delay to prevent hitting rate limits aggressively
        await asyncio.sleep(1.0)

    logger.info(f"✨ Resume complete. Successfully sent: {success_count} emails in this batch.")

if __name__ == "__main__":
    asyncio.run(main())

import os
import asyncio
from dotenv import load_dotenv
import markdown

load_dotenv("backend/.env")

import sys
sys.path.append("backend")

from app.utils.emails.base import send_email
from app.utils.emails.newsletter import build_newsletter_email
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

async def send_to_all():
    file_path = "content/newsletters/2026-08-12-meta-wants-its-llama-moment-back.md"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    parts = content.split("---")
    body = parts[2].strip() if len(parts) > 2 else content
    html_body = markdown.markdown(body)
    
    email_html = await build_newsletter_email(
        title="Meta Wants Its Llama Moment Back",
        subtitle="Zuckerberg has a type. And it's called 'open weights, please love us again'.",
        author="Sankalp",
        hero_image_url="https://upload.wikimedia.org/wikipedia/commons/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg",
        content_html=html_body,
        unsubscribe_link="https://www.eulerfold.com/unsubscribe"
    )

    supabase = get_supabase_client()
    response = supabase.table("profiles").select("email").execute()
    users = response.data
    
    if not users:
        print("No users found.")
        return
        
    emails = [u.get("email") for u in users if u.get("email")]
    
    success = 0
    for idx, email in enumerate(emails):
        try:
            await send_email(
                to=email,
                subject="Meta Wants Its Llama Moment Back",
                html=email_html,
                sender=f"Sankalp from EulerFold <{settings.RESEND_SENDER}>",
                reply_to="eulerfold@gmail.com"
            )
            print(f"[{idx+1}/{len(emails)}] Sent successfully to {email}")
            success += 1
            await asyncio.sleep(0.5) 
        except Exception as e:
            print(f"[{idx+1}/{len(emails)}] Failed to send to {email}: {e}")
            
    print(f"Done. Successfully sent {success}/{len(emails)} emails.")

if __name__ == "__main__":
    asyncio.run(send_to_all())

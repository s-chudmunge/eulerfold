import os
import httpx
import logging
from datetime import datetime
from typing import Optional
from app.core.config import settings
from app.core.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)
RESEND_API = "https://api.resend.com/emails"

async def send_email(to: str, subject: str, html: str, sender: str = None) -> dict:
    if not sender:
        sender = settings.RESEND_SENDER

    api_key = settings.RESEND_API_KEY or os.getenv("RESEND_API_KEY")
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")

    payload = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "html": html,
    }

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            r = await client.post(RESEND_API, json=payload, headers=headers)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            print(f"Resend API error: {e.response.status_code} - {e.response.text}")
            raise e

async def get_user_coins(email: str) -> int:
    try:
        sb = get_supabase_client()
        res = sb.table("profiles").select("eulercoins").ilike("email", email).execute()
        if res.data:
            return res.data[0].get("eulercoins", 0)
    except Exception:
        pass
    return 0

async def build_html_email(content_html: str, user_email: str = None, unsubscribe_link: str = None) -> str:
    # Absolute URL for logo (Using the official branding icon)
    logo_url = "https://eulerfold.com/apple-touch-icon.png"
    
    unsub_section = ""
    if unsubscribe_link:
        unsub_section = f"""
            <tr>
                <td style="padding: 32px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #a1a1aa; text-align: center;">
                    <a href="{unsubscribe_link}" style="color: #a1a1aa; text-decoration: none;">Unsubscribe</a>
                </td>
            </tr>
        """

    return f"""
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>ΣulerFold</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td style="padding: 60px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="border-collapse: collapse; background-color: #ffffff;">
                        <tr>
                            <td style="padding: 0 0 40px 0; text-align: left;">
                                <img src="{logo_url}" alt="EulerFold" width="28" height="28" style="display: block; opacity: 0.9;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0; color: #000000; font-size: 15px; line-height: 1.5; letter-spacing: -0.01em;">
                                {content_html}
                            </td>
                        </tr>
                        {unsub_section}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

async def send_onboarding_email(to: str, subject: str, goal: str, modules: list, unsubscribe_link: str, roadmap_id: int = None) -> dict:
    roadmap_url = f"{settings.FRONTEND_URL}/roadmap/{roadmap_id}" if roadmap_id else f"{settings.FRONTEND_URL}/dashboard"

    html_body = f"""
        <p style="margin: 0 0 20px 0; font-weight: 600; font-size: 17px;">Your roadmap for {subject} is ready.</p>
        <p style="margin: 0 0 32px 0; color: #52525b;">We've prepared a structured path to help you achieve your goal: {goal}.</p>
        
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
                <td align="center" bgcolor="#000000" style="border-radius: 4px;">
                    <a href="{roadmap_url}" style="padding: 10px 20px; font-size: 13px; color: #ffffff; text-decoration: none; font-weight: 600; display: inline-block; letter-spacing: 0.02em;">Open Roadmap</a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 48px 0 0 0; font-size: 13px; color: #a1a1aa;">&mdash; The EulerFold Team</p>
    """
    
    final_html = await build_html_email(html_body, to, unsubscribe_link)
    return await send_email(to, f"Roadmap: {subject}", final_html)

async def send_welcome_email(to: str) -> dict:
    html_body = f"""
        <p style="margin: 0 0 20px 0; font-weight: 600; font-size: 17px;">Welcome to EulerFold.</p>
        <p style="margin: 0 0 16px 0; color: #52525b;">Build steady progress with tools designed for deep learning:</p>
        
        <ul style="margin: 0 0 32px 0; padding: 0 0 0 20px; color: #52525b; line-height: 1.6;">
            <li style="margin-bottom: 8px;"><strong>Community Roadmaps:</strong> Clone and master paths from the library.</li>
            <li style="margin-bottom: 8px;"><strong>Research Decoded:</strong> Understand foundational scientific papers.</li>
            <li style="margin-bottom: 8px;"><strong>Proof of Work:</strong> Verify your skills with project audits.</li>
            <li><strong>Technical Profile:</strong> Your verified signature of expertise.</li>
        </ul>
        
        <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            <tr>
                <td align="center" bgcolor="#000000" style="border-radius: 4px;">
                    <a href="{settings.FRONTEND_URL}/dashboard" style="padding: 10px 20px; font-size: 13px; color: #ffffff; text-decoration: none; font-weight: 600; display: inline-block; letter-spacing: 0.02em;">Start Learning</a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 48px 0 0 0; font-size: 13px; color: #a1a1aa;">&mdash; The EulerFold Team</p>
    """
    
    final_html = await build_html_email(html_body)
    return await send_email(to, "Welcome to EulerFold", final_html)

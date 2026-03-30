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
    # Branding assets and colors
    logo_url = "https://www.eulerfold.com/logo_with_text.png"
    bg_color = "#f0f7f6"
    card_bg = "#ffffff"
    text_color = "#1e293b"
    border_color = "#e2e8f0"
    
    unsub_section = ""
    if unsubscribe_link:
        unsub_section = f"""
            <tr>
                <td style="padding: 32px 0 0 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #94a3b8; text-align: center;">
                    <a href="{unsubscribe_link}" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a>
                </td>
            </tr>
        """

    return f"""
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>EulerFold</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: {bg_color}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: {bg_color};">
            <tr>
                <td style="padding: 40px 20px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0 0 32px 0; text-align: center;">
                                <img src="{logo_url}" alt="EulerFold" width="220" style="display: block; margin: 0 auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: {card_bg}; border-radius: 24px; padding: 40px; border: 1px solid {border_color}; color: {text_color}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                                <div style="font-size: 16px; line-height: 1.6;">
                                    {content_html}
                                </div>
                            </td>
                        </tr>
                        {unsub_section}
                        <tr>
                            <td style="padding: 32px 0 0 0; font-family: 'Inter', sans-serif; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
                                You're receiving this because you're an EulerFold member.<br/>
                                If this wasn't you, please ignore this email.
                            </td>
                        </tr>
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

async def send_welcome_email(to: str, display_name: str = None, username: str = None) -> dict:
    # Ensure name is properly formatted if it exists (First Name, Capitalized)
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"
    
    base_url = settings.FRONTEND_URL.rstrip('/')
    profile_url = f"{base_url}/u/{username}" if username else f"{base_url}/dashboard"
    
    # We use a simplified version of the verification template's structure
    # since this is sent via Resend (python) rather than Supabase templates.
    html_body = f"""
        <h2 style="color: #0f766e; font-size: 20px; font-weight: 800; margin: 0 0 24px 0; letter-spacing: -0.025em; text-align: center;">
            Welcome to EulerFold
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi {greeting_name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We're excited to have you onboard. EulerFold is designed to make steady progress in your learning journey and we hope you gain true skills with your time us, Godspeed!
        </p>
        
        <p style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f766e;">
            What you can do with EulerFold:
        </p>

        <ul style="font-size: 15px; line-height: 1.6; padding-left: 20px; margin: 0 0 32px 0; color: #334155;">
            <li style="margin-bottom: 8px;">
                <a href="{base_url}/generate" style="color: #0f766e; text-decoration: underline; font-weight: 600;">Generate a roadmap</a> and start learning
            </li>
            <li style="margin-bottom: 8px;">
                <a href="{base_url}/explore" style="color: #0f766e; text-decoration: underline; font-weight: 600;">Clone roadmaps</a> from users worldwide
            </li>
            <li style="margin-bottom: 8px;">
                Download <a href="{base_url}/archive/exams/previous-year-papers" style="color: #0f766e; text-decoration: underline; font-weight: 600;">previous year papers</a> from our archives
            </li>
            <li style="margin-bottom: 8px;">
                Explore <a href="{base_url}/research-decoded" style="color: #0f766e; text-decoration: underline; font-weight: 600;">Research Decoded</a> for technical insights
            </li>
            <li style="margin-bottom: 8px;">
                <a href="{base_url}/learn" style="color: #0f766e; text-decoration: underline; font-weight: 600;">Practice</a> and earn badges
            </li>
            <li>
                <a href="{profile_url}" style="color: #0f766e; text-decoration: underline; font-weight: 600;">Showcase your work</a> and get audited by our AI
            </li>
        </ul>
        
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{base_url}/dashboard" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px;">
                Go to Dashboard
            </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
    """
    
    final_html = await build_html_email(html_body)
    return await send_email(to, "Welcome to EulerFold", final_html)

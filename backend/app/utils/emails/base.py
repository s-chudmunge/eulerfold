import os
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)
RESEND_API = "https://api.resend.com/emails"

async def send_email(to: str, subject: str, html: str, sender: str = None) -> dict:
    if not sender:
        sender = f"EulerFold <{settings.RESEND_SENDER}>"

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
            logger.error(f"Resend API error: {e.response.status_code} - {e.response.text}")
            raise e

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

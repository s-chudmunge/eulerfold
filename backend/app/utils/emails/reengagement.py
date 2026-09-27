from app.core.config import settings
from .base import send_email, build_html_email

async def send_reengagement_email(
    to: str,
    display_name: str = None,
    roadmap_title: str = None,
    roadmap_slug: str = None,
    next_topic: str = None,
    days_inactive: int = 3,
    unsubscribe_link: str = None
) -> dict:
    """
    Sends a friendly, zero-guilt re-engagement email to a learner who has gone inactive.
    Encourages resuming their active roadmap topic.
    """
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"

    base_url = "https://www.eulerfold.com"
    resume_url = f"{base_url}/roadmap/{roadmap_slug}" if roadmap_slug else f"{base_url}/dashboard"
    if not unsubscribe_link:
        unsubscribe_link = f"{base_url}/unsubscribe?email={to}"

    roadmap_display = roadmap_title or "your current study path"

    next_topic_block = ""
    if next_topic:
        next_topic_block = f"""
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0;">
                Next Up in {roadmap_display}
            </p>
            <p style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 0;">
                {next_topic}
            </p>
        </div>
        """

    html_body = f"""
        <h2 style="color: #0f766e; font-size: 20px; font-weight: 800; margin: 0 0 24px 0; letter-spacing: -0.025em; text-align: center;">
            Pick Up Where You Left Off
        </h2>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #1e293b;">
            Hi {greeting_name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #334155;">
            It's been a few days since your last study session on EulerFold. Learning complex technical topics takes consistent small steps, and your roadmap for <strong>{roadmap_display}</strong> is saved right where you paused.
        </p>

        {next_topic_block}

        <div style="text-align: center; margin-bottom: 28px;">
            <a href="{resume_url}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px;">
                Resume Learning
            </a>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #64748b; text-align: center; margin: 0 0 8px 0;">
            Even a quick 10-minute session keeps your momentum alive without the stress.
        </p>

        <p style="font-size: 15px; color: #64748b; text-align: center; margin-top: 24px;">
            Godspeed!<br/>
            The EulerFold Team
        </p>
    """

    final_html = await build_html_email(html_body, to, unsubscribe_link)
    subject = f"Resume your study path: {roadmap_display}" if roadmap_title else "Pick up where you left off on EulerFold"
    return await send_email(to, subject, final_html)

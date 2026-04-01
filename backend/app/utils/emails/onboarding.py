from app.core.config import settings
from .base import send_email, build_html_email

async def send_onboarding_email(to: str, subject: str, goal: str, modules: list, unsubscribe_link: str, roadmap_slug: str = None, display_name: str = None) -> dict:
    roadmap_url = f"{settings.FRONTEND_URL}/roadmap/{roadmap_slug}" if roadmap_slug else f"{settings.FRONTEND_URL}/dashboard"

    # Ensure name is properly formatted if it exists (First Name, Capitalized)
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"

    html_body = f"""
        <h2 style="color: #0f766e; font-size: 20px; font-weight: 800; margin: 0 0 24px 0; letter-spacing: -0.025em; text-align: center;">
            Your Roadmap is Ready
        </h2>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi {greeting_name},
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #334155;">
            We've prepared a structured path to help you achieve your goal: <strong>{goal}</strong>. Your roadmap for <strong>{subject}</strong> is now live on your dashboard.
        </p>
        
        <div style="text-align: center; margin-bottom: 32px;">
            <a href="{roadmap_url}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px;">
                Open Roadmap
            </a>
        </div>
        
        <p style="font-size: 15px; color: #64748b; text-align: center; margin-top: 32px;">
            Godspeed!<br/>
            The EulerFold Team
        </p>
    """
    
    final_html = await build_html_email(html_body, to, unsubscribe_link)
    return await send_email(to, f"Roadmap: {subject}", final_html)

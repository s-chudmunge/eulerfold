from app.core.config import settings
from .base import send_email, build_html_email

async def send_welcome_email(to: str, display_name: str = None, username: str = None) -> dict:
    # Ensure name is properly formatted if it exists (First Name, Capitalized)
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"
    
    base_url = settings.FRONTEND_URL.rstrip('/')
    profile_url = f"{base_url}/u/{username}" if username else f"{base_url}/dashboard"
    
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

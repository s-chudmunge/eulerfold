from app.core.config import settings
from .base import send_email, build_html_email

async def send_pro_activation_email(to: str, display_name: str = None) -> dict:
    # Ensure name is properly formatted
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"
    
    base_url = settings.FRONTEND_URL.rstrip('/')
    
    html_body = f"""
        <div style="text-align: center; margin-bottom: 16px;">
            <span style="display: inline-block; background-color: #fffbeb; color: #b45309; border: 1px solid #fcd34d; padding: 6px 16px; border-radius: 24px; font-size: 13px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
                ✦ EulerFold Pro
            </span>
        </div>
        <h2 style="color: #0f766e; font-size: 20px; font-weight: 800; margin: 0 0 24px 0; letter-spacing: -0.025em; text-align: center;">
            Welcome to Pro Mode!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi {greeting_name},
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Congratulations! Your account has been upgraded to <strong>EulerFold Pro</strong>. Thank you for trusting us with your learning journey; we are honored to help you achieve your goals.
        </p>
        
        <p style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f766e;">
            What's now unlocked for you:
        </p>

        <ul style="font-size: 15px; line-height: 1.6; padding-left: 20px; margin: 0 0 32px 0; color: #334155;">
            <li style="margin-bottom: 8px;">
                <strong>50 Roadmap Credits:</strong> Create detailed roadmaps for any subject you want to learn.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Unlimited Depth Extensions:</strong> Extend roadmap topics as many times as you need.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Homework Submission & Evaluation:</strong> Submit your work and receive direct, analytical feedback.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>12-Week Strategic Mapping:</strong> Generate extended 12-week study schedules.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Job Market Insights:</strong> Align your learning directly with real job requirements.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Research Lab Paper Decoding:</strong> Break down complex academic papers into understandable formats.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>EulerFold AI Practice Portal:</strong> Test your knowledge and practice what you've learned.
            </li>
            <li style="margin-bottom: 8px;">
                <strong>Priority AI Reasoning Models:</strong> Use more capable AI for better structure and depth.
            </li>
        </ul>
        
        <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://www.eulerfold.com/generate" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px;">
                Start Generating
            </a>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px; font-size: 13px;">
            <a href="https://www.eulerfold.com/research-lab" style="color: #64748b; text-decoration: none; border-bottom: 1px solid #cbd5e1; margin: 0 12px; padding-bottom: 2px;">Research Lab</a>
            <a href="https://www.eulerfold.com/practice" style="color: #64748b; text-decoration: none; border-bottom: 1px solid #cbd5e1; margin: 0 12px; padding-bottom: 2px;">Practice Portal</a>
            <a href="https://www.eulerfold.com/explore" style="color: #64748b; text-decoration: none; border-bottom: 1px solid #cbd5e1; margin: 0 12px; padding-bottom: 2px;">Explore</a>
        </div>
        
        <p style="font-size: 15px; color: #64748b; text-align: center; margin-top: 32px;">
            We can't wait to see what you'll learn next.<br/>
            <strong>Godspeed!</strong>
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 32px 0;">
    """
    
    final_html = await build_html_email(html_body)
    return await send_email(to, "Welcome to EulerFold Pro", final_html)

import logging
from .base import send_email, build_html_email

logger = logging.getLogger(__name__)

async def send_homework_results_email(
    to_email: str,
    module_title: str,
    roadmap_title: str,
    roadmap_slug: str,
    evaluation_level: str,
    summary: str,
    feedback_details: dict
):
    """
    Sends an email to the user with their homework evaluation results.
    """
    subject = f"Review Complete: {module_title}"
    
    # Header logic based on level
    if evaluation_level == "Solid":
        header_title = "Review Complete"
        header_subtitle = f"Criteria met for {module_title}."
        status_color = "#10b981" # Emerald
    elif evaluation_level == "Developing":
        header_title = "Feedback Provided"
        header_subtitle = f"Further iterations required for {module_title}."
        status_color = "#3b82f6" # Blue
    else:
        header_title = "Review Complete"
        header_subtitle = f"Analysis results for {module_title}."
        status_color = "#ef4444" # Red

    roadmap_link = f"https://www.eulerfold.com/roadmap/{roadmap_slug}"
    
    content_html = f"""
    <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">{header_title}</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0;">{header_subtitle}</p>
    </div>

    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: {status_color}; background-color: {status_color}10; padding: 4px 12px; border-radius: 100px; border: 1px solid {status_color}20;">
                Status: {evaluation_level}
            </div>
        </div>
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; font-style: italic; margin: 0;">
            &ldquo;{summary}&rdquo;
        </p>
    </div>

    <div style="margin-bottom: 32px;">
        <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 16px;">Detailed Breakdown</h3>
        
        <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">Technical Accuracy</p>
            <p style="font-size: 14px; color: #334155; margin: 0;">{feedback_details.get('technical', 'N/A')}</p>
        </div>
        
        <div style="margin-bottom: 16px;">
            <p style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">Understanding</p>
            <p style="font-size: 14px; color: #334155; margin: 0;">{feedback_details.get('understanding', 'N/A')}</p>
        </div>
        
        <div>
            <p style="font-size: 12px; font-weight: 800; color: #475569; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.05em;">Alignment</p>
            <p style="font-size: 14px; color: #334155; margin: 0;">{feedback_details.get('relevance', 'N/A')}</p>
        </div>
    </div>

    <div style="text-align: center; padding-top: 8px;">
        <a href="{roadmap_link}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
            Continue Learning
        </a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
            View your full skill inventory and earned record at 
            <a href="https://www.eulerfold.com/dashboard" style="color: #0f172a; text-decoration: underline;">your dashboard</a>.
        </p>
    </div>
    """
    
    html = await build_html_email(content_html, to_email)
    
    try:
        return await send_email(to_email, subject, html)
    except Exception as e:
        logger.error(f"Failed to send homework results email to {to_email}: {e}")
        return {{"status": "failed", "error": str(e)}}

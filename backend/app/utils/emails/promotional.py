from app.core.config import settings
from .base import send_email, build_html_email

async def send_promo_launch_email(to: str, display_name: str = None) -> dict:
    """
    Send a professional, optimistic email about the transition to Agentic AI.
    Includes multiple Deep Dives into Research Decoded (ReAct, RT-2, Toolformer).
    """
    if display_name:
        first_name = display_name.split(' ')[0].strip()
        greeting_name = first_name[0].upper() + first_name[1:].lower() if first_name else "there"
    else:
        greeting_name = "there"
    
    # Standard EulerFold production URL
    base_url = "https://www.eulerfold.com"
    
    html_body = f"""
        <h2 style="color: #0f766e; font-size: 22px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -0.02em; line-height: 1.3;">
            Beyond the Chatbox: The Era of Agents.
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #334155;">
            Hi {greeting_name}, 
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #334155;">
            The release of GPT-5.4 and Gemini 3.1 has confirmed a major shift in the industry. We are moving from "assistive" AI that answers questions to "Agentic" AI that can navigate desktops and execute complex workflows autonomously.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; color: #334155;">
            This transition opens a massive window for those who understand the underlying architecture of these autonomous systems.
        </p>

        <div style="background-color: #f0f7f6; border-left: 4px solid #0f766e; padding: 24px; margin-bottom: 32px; border-radius: 0 12px 12px 0;">
            <p style="font-size: 14px; font-weight: 800; color: #0f766e; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.1em;">Recent Deep Dives</p>
            
            <div style="margin-bottom: 16px;">
                <a href="{base_url}/research-decoded/react-reasoning-and-acting" style="display: block; color: #334155; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 4px;">ReAct: Synergizing Reason + Act →</a>
                <p style="font-size: 14px; color: #64748b; margin: 0;">The foundation of interleaved thought-action loops.</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <a href="{base_url}/research-decoded/rt-2-vision-language-action" style="display: block; color: #334155; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 4px;">RT-2: Vision-Language-Action Models →</a>
                <p style="font-size: 14px; color: #64748b; margin: 0;">How models map vision directly to physical and digital actions.</p>
            </div>
            
            <div>
                <a href="{base_url}/research-decoded/toolformer-self-supervised-tools" style="display: block; color: #334155; text-decoration: none; font-weight: 700; font-size: 16px; margin-bottom: 4px;">Toolformer: Learning to use Tools →</a>
                <p style="font-size: 14px; color: #64748b; margin: 0;">Teaching models to autonomously call APIs and external software.</p>
            </div>
        </div>

        <p style="font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Related Roadmap Categories</p>
        <div style="margin-bottom: 28px;">
            <a href="{base_url}/explore?category=AI/ML" style="display: inline-block; padding: 6px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 8px; margin-bottom: 8px;">AI/ML</a>
            <a href="{base_url}/explore?category=System Design" style="display: inline-block; padding: 6px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 8px; margin-bottom: 8px;">System Design</a>
            <a href="{base_url}/explore?category=Backend" style="display: inline-block; padding: 6px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 8px; margin-bottom: 8px;">Backend</a>
            <a href="{base_url}/explore?category=Open Source" style="display: inline-block; padding: 6px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 8px;">Open Source</a>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #334155;">
            We have added <strong>5 roadmap generations</strong> to your account so you can design your own autonomous workflows.
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
            <a href="{base_url}/generate" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 15px;">
                Start Building
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">
            Godspeed,<br/>
            <strong>Team EulerFold</strong>
        </p>
    """
    
    final_html = await build_html_email(html_body)
    return await send_email(to, "The Era of Agents is here", final_html)

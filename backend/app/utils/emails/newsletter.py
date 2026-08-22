import os
from datetime import datetime

async def build_newsletter_email(
    title: str,
    subtitle: str,
    author: str,
    hero_image_url: str,
    content_html: str,
    date_str: str = None,
    unsubscribe_link: str = None
) -> str:
    if not date_str:
        date_str = datetime.now().strftime("%B %d, %Y")
        
    bg_color = "#fcf9f2"       # Lighter cream grid background base
    card_bg = "#fff4e3"        # Warmer cream/ivory inner card
    header_bg = "#292b36"      # Charcoal header
    footer_bg = "#0047ff"      # Blue footer
    text_color = "#1a1a1a"     # Very dark text for high contrast
    accent_color = "#d92c2c"   # Red accent for author name / links
    grid_css = "background-image: linear-gradient(to right, rgba(128,128,128,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(128,128,128,0.07) 1px, transparent 1px); background-size: 24px 24px;"

    unsub_section = ""
    if unsubscribe_link:
        unsub_section = f"""
            <div style="margin-bottom: 16px;">
                <span style="color: #ffffff;">To unsubscribe from future emails, simply click the "unsubscribe" link.</span>
                <a href="{unsubscribe_link}" style="color: #ff6b6b; text-decoration: none; font-weight: bold; margin-left: 4px;">Unsubscribe</a>
            </div>
        """

    return f"""
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <!-- Google Fonts: Playfair Display for Serif, Inter for Sans-Serif -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
        <style type="text/css">
            /* Basic Reset */
            body {{ margin: 0; padding: 0; background-color: {bg_color}; }}
            table {{ border-spacing: 0; border-collapse: collapse; }}
            td {{ padding: 0; }}
            img {{ border: 0; }}
            
            /* Typography */
            .serif {{ font-family: 'Playfair Display', Georgia, serif; }}
            .sans {{ font-family: 'Inter', -apple-system, Arial, sans-serif; }}
            
            /* Content Styles */
            .content-body p {{ margin: 0 0 20px 0; line-height: 1.8; font-size: 15px; color: {text_color}; }}
            .content-body a {{ color: {accent_color}; text-decoration: none; font-weight: 600; }}
            .content-body img {{ max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; border: 1px solid #e5e7eb; }}
            .content-body h2, .content-body h3 {{ font-family: 'Playfair Display', Georgia, serif; color: {text_color}; margin-top: 32px; margin-bottom: 16px; font-weight: 700; font-size: 22px; }}
            
            /* Responsive */
            @media screen and (max-width: 600px) {{
                .container {{ width: 100% !important; padding: 0 10px !important; }}
                .header-table {{ display: block !important; width: 100% !important; }}
                .header-col {{ display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 15px; }}
                .title {{ font-size: 28px !important; }}
            }}
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: {bg_color}; {grid_css}">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: {bg_color}; {grid_css}">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    
                    <!-- Main Container -->
                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: {card_bg}; border: 1px solid rgba(217, 44, 44, 0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        
                        <!-- Header Block (Charcoal) -->
                        <tr>
                            <td style="background-color: {header_bg}; padding: 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <!-- Logo Side -->
                                        <td class="header-col" width="80" align="center" valign="top" style="padding-right: 20px;">
                                            <a href="https://www.eulerfold.com" style="text-decoration: none;">
                                                <img src="https://www.eulerfold.com/apple-touch-icon.png" alt="EulerFold" width="64" height="64" style="display: block; border: 0;" />
                                            </a>
                                        </td>
                                        <!-- Info Side -->
                                        <td class="header-col" valign="top">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td class="sans" style="color: #ffffff; font-weight: 700; font-size: 14px; margin-bottom: 4px;">
                                                        Weekly Newsletter
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="sans" style="color: #a0a0a0; font-size: 11px; font-weight: 600; padding-bottom: 8px;">
                                                        {date_str}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="serif" style="color: #d1d1d1; font-style: italic; font-size: 13px; line-height: 1.4; max-width: 350px;">
                                                        The bi-weekly newsletter by EulerFold AI that brings the biggest shifts shaping AI and research.
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Title Area -->
                        <tr>
                            <td style="padding: 40px 40px 30px 40px; text-align: center;">
                                <h1 class="serif title" style="margin: 0 0 14px 0; font-size: 28px; color: {text_color}; font-weight: 700; line-height: 1.3; letter-spacing: -0.5px;">
                                    {title}
                                </h1>
                                <p class="serif" style="margin: 0 0 20px 0; font-size: 17px; color: #444444; font-style: italic; line-height: 1.5;">
                                    {subtitle}
                                </p>
                                <div style="margin-top: 12px;">
                                    <a href="https://www.linkedin.com/in/sankalp-chudmunge-a3ba80423/" target="_blank" style="text-decoration: none;">
                                        <img src="https://www.eulerfold.com/author-photo.png" alt="{author}" width="32" height="32" style="border-radius: 50%; vertical-align: middle; margin-right: 8px; border: 1px solid #d1d1d1;" />
                                    </a>
                                    <p class="serif" style="display: inline-block; margin: 0; font-size: 15px; font-weight: 600; color: {text_color}; vertical-align: middle;">
                                        By <a href="https://www.linkedin.com/in/sankalp-chudmunge-a3ba80423/" target="_blank" style="color: {accent_color}; text-decoration: none;">{author}</a>
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Hero Image -->
                        <tr>
                            <td style="padding: 0 40px;">
                                <img src="{hero_image_url}" alt="Hero Image" width="520" style="display: block; width: 100%; height: auto; max-width: 520px;" />
                            </td>
                        </tr>

                        <!-- Main Content Body -->
                        <tr>
                            <td class="content-body serif" style="padding: 40px; color: {text_color}; font-size: 15px; line-height: 1.8;">
                                {content_html}
                            </td>
                        </tr>

                        <!-- Bottom Spacer inside card -->
                        <tr>
                            <td style="padding-bottom: 20px;"></td>
                        </tr>
                    </table>

                    <!-- Footer Block (Blue/Teal) -->
                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="margin-top: 24px;">
                        <tr>
                            <td style="background-color: {footer_bg}; border-radius: 16px; padding: 40px; text-align: center;">
                                <!-- Social Icons -->
                                <div style="margin-bottom: 24px;">
                                    <a href="https://x.com/eulerfold" style="display: inline-block; margin: 0 8px; text-decoration: none; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; line-height: 36px;">
                                        <img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx.png" alt="X" width="16" style="vertical-align: middle;" />
                                    </a>
                                    <a href="https://www.youtube.com/@eulerfold" style="display: inline-block; margin: 0 8px; text-decoration: none; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; line-height: 36px;">
                                        <img src="https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png" alt="YouTube" width="16" style="vertical-align: middle;" />
                                    </a>
                                    <a href="https://www.instagram.com/eulerfold" style="display: inline-block; margin: 0 8px; text-decoration: none; width: 36px; height: 36px; background-color: rgba(255,255,255,0.1); border-radius: 50%; line-height: 36px;">
                                        <img src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png" alt="Instagram" width="16" style="vertical-align: middle;" />
                                    </a>
                                </div>
                                
                                <div class="sans" style="font-size: 13px; color: #ffffff; line-height: 1.6; opacity: 0.9;">
                                    {unsub_section}
                                    <div style="margin-top: 16px;">
                                        © Copyright, {datetime.now().year}, EulerFold • Maharashtra, India
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </body>
    </html>
    """

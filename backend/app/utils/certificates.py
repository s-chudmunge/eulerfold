import io
import uuid
import logging
import os
import requests
from datetime import datetime
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image

logger = logging.getLogger(__name__)

# Branding Colors
TEAL_700 = colors.HexColor("#0F766E")
MINT_WHITE = colors.HexColor("#f0f7f6")
TEXT_PRIMARY = colors.HexColor("#1f2937")

def generate_certificate_pdf(user_name: str, roadmap_title: str, grade: str, time_invested: float, issue_date: datetime, credential_id: str, avatar_url: str = None, profile_url: str = None) -> bytes:
    """
    Generates a PDF certificate in memory and returns it as bytes.
    """
    buffer = io.BytesIO()
    
    # Landscape orientation for certificates
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    c.setTitle(f"EulerFold Certificate - {roadmap_title}")
    
    width, height = landscape(letter)
    
    # Background
    c.setFillColor(MINT_WHITE)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    # Border
    c.setStrokeColor(TEAL_700)
    c.setLineWidth(10)
    c.rect(0.5 * inch, 0.5 * inch, width - 1 * inch, height - 1 * inch)
    
    # Inner border
    c.setLineWidth(2)
    c.rect(0.6 * inch, 0.6 * inch, width - 1.2 * inch, height - 1.2 * inch)
    
    # Title
    c.setFillColor(TEAL_700)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width / 2.0, height - 1.8 * inch, "Certificate of Completion")
    
    # Subtitle
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2.0, height - 2.4 * inch, "This is to certify that")
    
    # Avatar
    if avatar_url:
        try:
            # ReportLab/PIL cannot render SVG directly, so if it's dicebear, request a PNG
            if "api.dicebear.com" in avatar_url and "/svg" in avatar_url:
                avatar_url = avatar_url.replace("/svg", "/png")
                
            resp = requests.get(avatar_url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            
            # If the primary avatar (e.g. Google) is broken/blocked, fallback to initials
            if resp.status_code != 200:
                fallback_url = f"https://api.dicebear.com/9.x/initials/png?seed={user_name}"
                resp = requests.get(fallback_url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
                
            if resp.status_code == 200:
                pil_img = Image.open(io.BytesIO(resp.content)).convert("RGBA")
                # Create white background to handle transparency
                background = Image.new("RGBA", pil_img.size, (255, 255, 255))
                alpha_composite = Image.alpha_composite(background, pil_img)
                rgb_img = alpha_composite.convert("RGB")
                
                img_data = io.BytesIO()
                rgb_img.save(img_data, format="JPEG")
                img_data.seek(0)
                
                img = ImageReader(img_data)
                
                avatar_radius = 0.4 * inch
                avatar_x = width / 2.0
                avatar_y = height - 3.2 * inch
                
                c.saveState()
                path = c.beginPath()
                path.circle(avatar_x, avatar_y, avatar_radius)
                c.clipPath(path, stroke=0)
                c.drawImage(img, avatar_x - avatar_radius, avatar_y - avatar_radius, avatar_radius * 2, avatar_radius * 2, mask='auto')
                c.restoreState()
        except Exception as e:
            logger.error(f"Avatar drawing failed: {e}")
            
    # Name
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width / 2.0, height - 4.1 * inch, user_name)
    
    # Text
    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2.0, height - 4.7 * inch, "has successfully completed the roadmap")
    
    # Roadmap Title (Wrapped)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        name="RoadmapTitle",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=TEAL_700,
        alignment=1, # Center
        leading=26
    )
    p = Paragraph(roadmap_title, title_style)
    max_title_width = width - 2 * inch
    tw, th = p.wrap(max_title_width, height)
    p.drawOn(c, (width - max_title_width) / 2.0, height - 5.1 * inch - th)
    
    # Metrics (Grade & Time Invested)
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 14)
    metrics_text = f"Completed with Grade: {grade}  |  Time Invested: {time_invested:.1f} Hours"
    c.drawCentredString(width / 2.0, height - 6.3 * inch, metrics_text)
    
    # Bottom details (Date & Credential ID)
    c.setFont("Helvetica", 12)
    date_str = issue_date.strftime("%B %d, %Y")
    c.drawString(1.5 * inch, 1.2 * inch, f"Date: {date_str}")
    
    if profile_url:
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.gray)
        c.drawString(1.5 * inch, 0.95 * inch, profile_url)
        
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 12)
    c.drawRightString(width - 1.5 * inch, 1.2 * inch, f"Credential ID: {credential_id}")
    
    # Footer Signature / Brand Logo
    logo_path = "/home/sankalp/Documents/projects/eulerfold/backend/app/static/logo.png"
    if not os.path.exists(logo_path):
        logo_path = "/app/backend/app/static/logo.png"
        
    try:
        # Draw EulerFold Text ABOVE the logo
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(TEAL_700)
        c.drawCentredString(width / 2.0, 1.5 * inch, "EulerFold")
        
        if os.path.exists(logo_path):
            # Draw logo centered at the bottom
            logo = ImageReader(logo_path)
            c.drawImage(logo, width / 2.0 - 0.25 * inch, 0.8 * inch, width=0.5*inch, height=0.5*inch, preserveAspectRatio=True, mask='auto')
    except Exception as e:
        logger.error(f"Logo drawing failed: {e}")
    
    c.save()
    buffer.seek(0)
    return buffer.read()

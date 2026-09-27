from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.utils.emails.base import send_email, build_html_email

router = APIRouter(tags=["misc"])

class EnterpriseInterestRequest(BaseModel):
    email: str
    institution: str
    requirements: str

@router.post("/enterprise-interest")
async def submit_enterprise_interest(request: EnterpriseInterestRequest, background_tasks: BackgroundTasks):
    requirements_formatted = request.requirements.replace('\n', '<br/>')
    content_html = f"""
    <h2 style="color: #0f766e; font-size: 20px; font-weight: 800; margin: 0 0 20px 0;">New Enterprise Interest Submission</h2>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 8px 0;"><strong>Email:</strong> {request.email}</p>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;"><strong>Institution/Company:</strong> {request.institution}</p>
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-top: 16px;">
        <p style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 8px 0;">Requirements / Interest</p>
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0;">{requirements_formatted}</p>
    </div>
    """
    
    full_html = await build_html_email(content_html)

    background_tasks.add_task(
        send_email,
        to="eulerfold@gmail.com",
        subject=f"Enterprise Interest: {request.institution}",
        html=full_html
    )
    
    return {"success": True, "message": "Interest submitted successfully"}

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.utils.emails.base import send_email

router = APIRouter(tags=["misc"])

class EnterpriseInterestRequest(BaseModel):
    email: str
    institution: str
    requirements: str

@router.post("/enterprise-interest")
async def submit_enterprise_interest(request: EnterpriseInterestRequest, background_tasks: BackgroundTasks):
    html_content = f"""
    <h2>New Enterprise Interest Submission</h2>
    <p><strong>Email:</strong> {request.email}</p>
    <p><strong>Institution/Company:</strong> {request.institution}</p>
    <br/>
    <p><strong>Requirements/Interest:</strong></p>
    <p>{request.requirements.replace('\n', '<br/>')}</p>
    """
    
    background_tasks.add_task(
        send_email,
        to="eulerfold@gmail.com",
        subject=f"Enterprise Interest: {request.institution}",
        html=html_content
    )
    
    return {"success": True, "message": "Interest submitted successfully"}

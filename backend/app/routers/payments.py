from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel
from typing import Dict, Any, Optional
import razorpay
import hmac
import hashlib
import json
from datetime import datetime, timezone, timedelta

from app.core.config import settings
from app.core.auth import get_current_user
from app.schemas import User
from app.core.supabase_client import get_supabase_client
from app.utils.resend_client import send_pro_activation_email
import logging
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Payments"])

# Initialize Razorpay
razorpay_client = None
if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def get_current_price():
    """
    Returns (price_in_paise, has_discount)
    Normal price: ₹299 (29900 paise)
    Special discount: 50% off on April 28, 2026, from 2pm to 9pm IST.
    """
    # IST is UTC+5:30
    ist_offset = timedelta(hours=5, minutes=30)
    now_ist = datetime.now(timezone.utc) + ist_offset
    
    # Target date: April 28, 2026
    is_today = now_ist.year == 2026 and now_ist.month == 4 and now_ist.day == 28
    is_within_time = 14 <= now_ist.hour < 21  # 2pm to 9pm (exclusive of 9pm)
    
    if is_today and is_within_time:
        # ₹299 * 0.5 = ₹149.5 -> Rounded to ₹149
        return 14900, True
    
    return 29900, False

class CheckoutRequest(BaseModel):
    currency: str = "INR"

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    user_email = current_user.email
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
    
    price_paise, _ = get_current_price()
    
    try:
        order_data = {
            "amount": price_paise,
            "currency": "INR",
            "receipt": f"receipt_{user_email[:20]}",
            "notes": {
                "email": user_email
            }
        }
        order = razorpay_client.order.create(data=order_data)
        return {
            "provider": "razorpay",
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_payment_success(email: str, payment_id: str, order_id: str = None, signature: str = None, amount: int = None, currency: str = "INR"):
    """
    Handles successful payment: 
    1. Check for duplicate payment_id
    2. Add credits to user profile
    3. Record transaction for audit/idempotency
    """
    sb = get_supabase_client()
    
    # 1. Check for idempotency
    existing = sb.table("payment_transactions").select("id").eq("razorpay_payment_id", payment_id).execute()
    if existing.data:
        logger.info(f"Payment {payment_id} already processed. Skipping.")
        return False

    # 2. Fetch current credits and user info
    res = sb.table("profiles").select("roadmap_credits, display_name").eq("email", email).execute()
    if not res.data:
        logger.error(f"Profile not found for {email} during payment processing")
        return False
        
    profile_data = res.data[0]
    current_credits = profile_data.get("roadmap_credits") or 0
    display_name = profile_data.get("display_name")
    new_credits = current_credits + 5
    
    if amount is None:
        amount, _ = get_current_price()

    # 3. Update credits and record transaction
    try:
        # Update Profile (Add Credits and set is_pro=True)
        sb.table("profiles").update({
            "roadmap_credits": new_credits,
            "is_pro": True
        }).eq("email", email).execute()
        
        # Record Transaction
        sb.table("payment_transactions").insert({
            "razorpay_payment_id": payment_id,
            "razorpay_order_id": order_id,
            "razorpay_signature": signature,
            "email": email,
            "amount": amount,
            "currency": currency,
            "status": "captured"
        }).execute()
        
        logger.info(f"Successfully processed payment {payment_id}. Added 5 credits to {email}.")
        
        # 4. Send Pro Activation Email
        asyncio.create_task(send_pro_activation_email(email, display_name))
        
        return True
    except Exception as e:
        logger.error(f"Error recording transaction for {payment_id}: {e}")
        return False

@router.post("/payments/verify-razorpay")
async def verify_razorpay(req: RazorpayVerifyRequest, current_user: User = Depends(get_current_user)):
    """Frontend calls this after successful Razorpay inline checkout"""
    if not razorpay_client or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
        
    generated_signature = hmac.new(
        bytes(settings.RAZORPAY_KEY_SECRET, 'utf-8'),
        bytes(f"{req.razorpay_order_id}|{req.razorpay_payment_id}", 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    if hmac.compare_digest(generated_signature, req.razorpay_signature):
        success = await process_payment_success(
            email=current_user.email,
            payment_id=req.razorpay_payment_id,
            order_id=req.razorpay_order_id,
            signature=req.razorpay_signature
        )
        if success:
            return {"status": "success", "message": "Payment received and credit added"}
        else:
            return {"status": "success", "message": "Payment already processed or recorded"}
    else:
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

@router.post("/payments/webhook/razorpay")
async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(None)):
    """Optional: Server-to-server webhook for Razorpay to ensure reliability"""
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        return {"status": "ignored", "reason": "No Razorpay webhook secret"}
        
    body = await request.body()
    
    # Verify webhook signature
    expected_signature = hmac.new(
        bytes(settings.RAZORPAY_WEBHOOK_SECRET, 'utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not x_razorpay_signature or not hmac.compare_digest(expected_signature, x_razorpay_signature):
        logger.warning("Invalid Razorpay webhook signature")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
    data = json.loads(body)
    event = data.get("event")
    
    if event == "payment.captured":
        payload = data.get("payload", {}).get("payment", {}).get("entity", {})
        email = payload.get("notes", {}).get("email")
        payment_id = payload.get("id")
        order_id = payload.get("order_id")
        amount = payload.get("amount")
        currency = payload.get("currency", "INR")
        
        if not email:
            logger.error(f"Webhook error: Missing email in notes for payment {payment_id}")
            return {"status": "skipped", "reason": "Missing email in notes"}
            
        await process_payment_success(
            email=email,
            payment_id=payment_id,
            order_id=order_id,
            amount=amount,
            currency=currency
        )
            
    return {"status": "ok"}

@router.get("/payments/transactions")
async def get_transactions(current_user: User = Depends(get_current_user)):
    """Fetch transaction history for the current user"""
    sb = get_supabase_client()
    res = sb.table("payment_transactions")\
        .select("*")\
        .eq("email", current_user.email)\
        .order("created_at", desc=True)\
        .execute()
    
    return res.data

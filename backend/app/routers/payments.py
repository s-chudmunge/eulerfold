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

def get_current_price(coupon_code: Optional[str] = None):
    """
    Returns (price_in_paise, has_discount)
    Normal price: ₹149 (14900 paise)
    Coupon code: #SANKALP21 gives 50% discount.
    """
    # Coupon Logic
    VALID_COUPONS = {
        "#SANKALP21": 0.5, # 50% discount
    }

    coupon_discount = 0
    if coupon_code and coupon_code.upper() in VALID_COUPONS:
        coupon_discount = VALID_COUPONS[coupon_code.upper()]

    if coupon_discount > 0:
        discount = coupon_discount
            
        # ₹149 * (1 - discount)
        final_price_rs = 149 * (1 - discount)
        return int(final_price_rs * 100), True
    
    return 14900, False

class CheckoutRequest(BaseModel):
    currency: str = "INR"
    coupon_code: Optional[str] = None

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    razorpay_payment_id: str
    razorpay_signature: str
    coupon_code: Optional[str] = None

@router.post("/payments/checkout")
async def create_checkout(req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    user_email = current_user.email
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay not configured")
    
    price_paise, _ = get_current_price(req.coupon_code)
    
    try:
        if not settings.RAZORPAY_PLAN_ID:
            raise HTTPException(status_code=500, detail="Razorpay Plan ID not configured. Only subscriptions are supported.")
            
        sb = get_supabase_client()
        # Check if user already has an active subscription
        res = sb.table("payment_transactions")\
            .select("razorpay_order_id")\
            .eq("email", user_email)\
            .like("razorpay_order_id", "sub_%")\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
            
        if res.data:
            try:
                sub = razorpay_client.subscription.fetch(res.data[0]["razorpay_order_id"])
                if sub["status"] in ["active", "authenticated"]:
                    raise HTTPException(status_code=400, detail="You already have an active subscription.")
            except HTTPException:
                raise
            except Exception as e:
                pass # ignore fetch errors and proceed
                
        # Create a Razorpay Customer first (Required for some Subscriptions validations)
        customer_id = None
        try:
            # Just create a new customer for this session to ensure it's fresh and valid
            rcust = razorpay_client.customer.create(data={
                "name": current_user.display_name or "User",
                "email": user_email,
                "contact": "9999999999" # Dummy contact
            })
            customer_id = rcust["id"]
        except Exception as ce:
            logger.warning(f"Failed to create customer, proceeding without it: {ce}")

        sub_data = {
            "plan_id": settings.RAZORPAY_PLAN_ID,
            "total_count": 120, # 10 years max
            "customer_notify": 1,
            "notes": {
                "email": user_email,
                "coupon_code": req.coupon_code
            }
        }
        if customer_id:
            sub_data["customer_id"] = customer_id
            
        subscription = razorpay_client.subscription.create(data=sub_data)
        return {
            "provider": "razorpay",
            "subscription_id": subscription["id"],
            "key": settings.RAZORPAY_KEY_ID
        }
    except Exception as e:
        logger.error(f"Razorpay checkout creation failed: {e}")
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
    new_credits = current_credits + 50
    
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
        
        logger.info(f"Successfully processed payment {payment_id}. Added 50 credits to {email}.")
        
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
        
    if req.razorpay_subscription_id:
        msg = f"{req.razorpay_payment_id}|{req.razorpay_subscription_id}"
    else:
        msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
        
    generated_signature = hmac.new(
        bytes(settings.RAZORPAY_KEY_SECRET, 'utf-8'),
        bytes(msg, 'utf-8'),
        hashlib.sha256
    ).hexdigest()

    if hmac.compare_digest(generated_signature, req.razorpay_signature):
        # Calculate amount with coupon if provided
        amount, _ = get_current_price(req.coupon_code)
        
        success = await process_payment_success(
            email=current_user.email,
            payment_id=req.razorpay_payment_id,
            order_id=req.razorpay_subscription_id or req.razorpay_order_id,
            signature=req.razorpay_signature,
            amount=amount
        )
        if success:
            return {"status": "success", "message": "Payment received and credit added"}
        else:
            return {"status": "success", "message": "Payment already processed or recorded"}
    else:
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

class CouponValidateRequest(BaseModel):
    code: str

@router.post("/payments/validate-coupon")
async def validate_coupon(req: CouponValidateRequest):
    """Validate a coupon code and return discount info"""
    # Coupon Logic (should be synced with get_current_price or moved to a shared util)
    VALID_COUPONS = {
        "#SANKALP21": 0.5, # 50% discount
    }
    
    code = req.code.upper()
    if code in VALID_COUPONS:
        discount = VALID_COUPONS[code]
        new_price_rs = 149 * (1 - discount)
        return {
            "valid": True,
            "discount": discount,
            "new_price": int(new_price_rs),
            "message": f"Coupon applied! {int(discount * 100)}% discount."
        }
    else:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")

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
            # If it's a recurring payment, notes might be missing. We rely on subscription.charged instead.
            logger.info(f"payment.captured missing email for {payment_id}. Likely a recurring charge. Skipping here.")
            return {"status": "skipped", "reason": "Missing email in notes"}
            
        await process_payment_success(
            email=email,
            payment_id=payment_id,
            order_id=order_id,
            amount=amount,
            currency=currency
        )
            
    elif event == "subscription.charged":
        sub_payload = data.get("payload", {}).get("subscription", {}).get("entity", {})
        pay_payload = data.get("payload", {}).get("payment", {}).get("entity", {})
        
        email = sub_payload.get("notes", {}).get("email")
        payment_id = pay_payload.get("id")
        subscription_id = sub_payload.get("id")
        amount = pay_payload.get("amount")
        currency = pay_payload.get("currency", "INR")
        
        if not email:
            logger.error(f"Webhook error: Missing email in notes for subscription.charged {subscription_id}")
            return {"status": "skipped", "reason": "Missing email in notes"}
            
        await process_payment_success(
            email=email,
            payment_id=payment_id,
            order_id=subscription_id,
            amount=amount,
            currency=currency
        )
            
    elif event in ["subscription.halted", "subscription.cancelled", "subscription.completed", "subscription.paused"]:
        payload = data.get("payload", {}).get("subscription", {}).get("entity", {})
        email = payload.get("notes", {}).get("email")
        subscription_id = payload.get("id")
        
        if email:
            sb = get_supabase_client()
            # Check credits before revoking
            profile = sb.table("profiles").select("roadmap_credits").eq("email", email).execute()
            credits = profile.data[0].get("roadmap_credits", 0) if profile.data else 0
            
            if credits <= 0:
                sb.table("profiles").update({"is_pro": False}).eq("email", email).execute()
                logger.info(f"Subscription {subscription_id} {event} for {email}. Revoked Pro status.")
            else:
                logger.info(f"Subscription {subscription_id} {event} for {email}, but user has {credits} credits left. Keeping Pro status.")
        else:
            logger.error(f"Webhook error: Missing email in notes for subscription {subscription_id}")
            
    elif event == "subscription.resumed":
        payload = data.get("payload", {}).get("subscription", {}).get("entity", {})
        email = payload.get("notes", {}).get("email")
        subscription_id = payload.get("id")
        
        if email:
            sb = get_supabase_client()
            # Grant pro status
            sb.table("profiles").update({"is_pro": True}).eq("email", email).execute()
            logger.info(f"Subscription {subscription_id} resumed for {email}. Restored Pro status.")
        else:
            logger.error(f"Webhook error: Missing email in notes for subscription {subscription_id}")
            
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

@router.get("/payments/subscription/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Fetch the current subscription status and renewal date"""
    sb = get_supabase_client()
    if not razorpay_client:
        return {"status": "inactive"}

    # Find the user's latest subscription ID
    res = sb.table("payment_transactions")\
        .select("razorpay_order_id")\
        .eq("email", current_user.email)\
        .like("razorpay_order_id", "sub_%")\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()
        
    if not res.data:
        # Check if they are pro from a legacy one-time purchase
        profile = sb.table("profiles").select("is_pro").eq("email", current_user.email).execute()
        if profile.data and profile.data[0].get("is_pro"):
            import time
            return {
                "status": "active",
                "current_end": int(time.time()) + 30 * 24 * 3600, # 30 days from now
                "cancel_at_cycle_end": False,
                "is_legacy": True
            }
        return {"status": "inactive"}
        
    sub_id = res.data[0]["razorpay_order_id"]
    try:
        sub = razorpay_client.subscription.fetch(sub_id)
        if sub["status"] in ["active", "authenticated"]:
            return {
                "status": sub["status"],
                "current_end": sub.get("current_end"), # timestamp
                "cancel_at_cycle_end": sub.get("cancel_at_cycle_end")
            }
        return {"status": sub["status"]}
    except Exception as e:
        logger.error(f"Failed to fetch subscription {sub_id} status: {e}")
        return {"status": "inactive"}

@router.post("/payments/cancel-subscription")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    sb = get_supabase_client()
    
    if not razorpay_client:
        raise HTTPException(status_code=500, detail="Razorpay not configured")

    # Find the user's latest subscription ID
    res = sb.table("payment_transactions")\
        .select("razorpay_order_id")\
        .eq("email", current_user.email)\
        .like("razorpay_order_id", "sub_%")\
        .order("created_at", desc=True)\
        .limit(1)\
        .execute()
        
    if not res.data:
        profile = sb.table("profiles").select("is_pro").eq("email", current_user.email).execute()
        if profile.data and profile.data[0].get("is_pro"):
            raise HTTPException(status_code=400, detail="You are on a complimentary/legacy plan which does not automatically renew, so there is nothing to cancel.")
        raise HTTPException(status_code=404, detail="No active subscription found.")
        
    sub_id = res.data[0]["razorpay_order_id"]
    try:
        # Cancel at cycle end to allow user to use remaining time
        razorpay_client.subscription.cancel(sub_id, {"cancel_at_cycle_end": 1})
        return {"status": "success", "message": "Subscription cancelled successfully."}
    except Exception as e:
        logger.error(f"Failed to cancel subscription {sub_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription with payment provider.")

async def check_and_revoke_pro_if_no_credits(email: str, sb_client):
    """
    Called when a user's credits reach 0.
    If they have 0 credits AND no active subscription, we set is_pro = False.
    """
    profile = sb_client.table("profiles").select("roadmap_credits, is_pro").eq("email", email).execute()
    if not profile.data: return
    
    credits = profile.data[0].get("roadmap_credits", 0)
    is_pro = profile.data[0].get("is_pro", False)
    
    if credits > 0 or not is_pro:
        return # They still have credits, or already not pro
        
    # Credits are <= 0. Check if they have an active subscription
    has_active = False
    if razorpay_client:
        try:
            res = sb_client.table("payment_transactions").select("razorpay_order_id").eq("email", email).like("razorpay_order_id", "sub_%").order("created_at", desc=True).limit(1).execute()
            if res.data:
                sub_id = res.data[0]["razorpay_order_id"]
                sub = razorpay_client.subscription.fetch(sub_id)
                if sub["status"] in ["active", "authenticated"]:
                    has_active = True
        except Exception as e:
            logger.error(f"Failed to check subscription status for {email}: {e}")
            
    if not has_active:
        sb_client.table("profiles").update({"is_pro": False}).eq("email", email).execute()
        logger.info(f"Revoked Pro status for {email} due to 0 credits and no active subscription.")

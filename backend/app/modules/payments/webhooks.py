from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.modules.payments.repository import PaymentRepository
from app.integrations.razorpay import razorpay_client
from app.core.config import setting
from datetime import datetime

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/razorpay")
async def razorpay_webhook(request: Request, session: Session = Depends(get_session)):
    body = await request.body()
    signature = request.headers.get("x-razorpay-signature")

    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")

    try:
        razorpay_client.utility.verify_webhook_signature(body.decode('utf-8'), signature, setting.RAZORPAY_KEY_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    if payload.get("event") == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = payment_entity.get("order_id")
        
        repo = PaymentRepository(session)
        payment = repo.get_by_provider_order_id(order_id)
        
        if payment and payment.status != "SUCCESS":
            payment.status = "SUCCESS"
            payment.provider_payment_id = payment_entity.get("id")
            payment.paid_at = datetime.utcnow()
            repo.update(payment)

    return {"status": "ok"}
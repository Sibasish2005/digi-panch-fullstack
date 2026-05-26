from sqlmodel import Session
from uuid import UUID
from datetime import datetime
from fastapi import HTTPException, status
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import PaymentCreateRequest, PaymentVerifyRequest
from app.integrations.razorpay import create_razorpay_order, verify_razorpay_signature

def create_payment_order(session: Session, user_id: UUID, data: PaymentCreateRequest):
    repo = PaymentRepository(session)

    # 1. Create a local pending payment record to generate an internal ID
    local_data = {
        "user_id": user_id,
        "application_id": data.application_id,
        "payment_type": data.payment_type,
        "amount": data.amount,
        "currency": "INR",
        "status": "PENDING"
    }
    payment = repo.create(local_data)

    # 2. Call Razorpay
    receipt_id = f"rcpt_{str(payment.id)[:8]}"
    try:
        rp_order = create_razorpay_order(amount_in_rupees=data.amount, receipt=receipt_id)
    except Exception as e:
        payment.status = "FAILED"
        repo.update(payment)
        raise HTTPException(status_code=502, detail=f"Payment gateway error: {str(e)}")

    # 3. Update local payment with Razorpay Order ID
    payment.provider_order_id = rp_order["id"]
    repo.update(payment)

    return {
        "payment_id": payment.id,
        "provider_order_id": payment.provider_order_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status
    }

def verify_payment(session: Session, data: PaymentVerifyRequest):
    repo = PaymentRepository(session)

    payment = repo.get_by_provider_order_id(data.razorpay_order_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment order not found")
        
    if payment.status == "SUCCESS":
        return payment

    is_valid = verify_razorpay_signature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature)
    if not is_valid:
        payment.status = "FAILED"
        repo.update(payment)
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment.status = "SUCCESS"
    payment.provider_payment_id = data.razorpay_payment_id
    payment.provider_signature = data.razorpay_signature
    payment.paid_at = datetime.utcnow()
    repo.update(payment)
    
    # Update the associated application status to SUBMITTED so the officer can see it
    if payment.application_id:
        from app.modules.applications.repository import ApplicationRepository
        app_repo = ApplicationRepository(session)
        app = app_repo.get_by_id(payment.application_id)
        if app and app.status == "PENDING_PAYMENT":
            app.status = "SUBMITTED"
            app_repo.session.add(app)
            app_repo.session.commit()
    
    return payment

def get_user_payments(session: Session, user_id: UUID, skip: int = 0, limit: int = 100):
    return PaymentRepository(session).list_by_user(user_id, skip, limit)
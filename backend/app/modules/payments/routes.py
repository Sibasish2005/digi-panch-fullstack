from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List

from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.users.models import User
from app.modules.payments import service
from app.modules.payments.schemas import (
    PaymentCreateRequest, PaymentOrderResponse, PaymentVerifyRequest, PaymentResponse
)

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/create-order", response_model=PaymentOrderResponse)
def create_order(data: PaymentCreateRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return service.create_payment_order(session, current_user.id, data)

@router.post("/verify", response_model=PaymentResponse)
def verify_payment(data: PaymentVerifyRequest, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return service.verify_payment(session, data)

@router.get("", response_model=List[PaymentResponse])
def get_my_payments(skip: int = 0, limit: int = 100, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    return service.get_user_payments(session, current_user.id, skip, limit)
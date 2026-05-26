from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class PaymentCreateRequest(BaseModel):
    application_id: Optional[UUID] = None
    payment_type: str
    amount: float # Amount in rupees

class PaymentOrderResponse(BaseModel):
    payment_id: UUID
    provider_order_id: str
    amount: float
    currency: str
    status: str

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    id: UUID
    user_id: UUID
    application_id: Optional[UUID]
    payment_type: str
    amount: float
    currency: str
    status: str
    provider_order_id: Optional[str]
    provider_payment_id: Optional[str]
    created_at: datetime
    paid_at: Optional[datetime]
    
    class Config:
        from_attributes = True
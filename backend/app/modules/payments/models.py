from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    application_id: Optional[uuid.UUID] = Field(default=None, foreign_key="document_applications.id", index=True)
    
    payment_type: str = Field(max_length=50) # CERTIFICATE_FEE, UTILITY_BILL, OTHER
    amount: float
    currency: str = Field(default="INR", max_length=10)
    
    provider: str = Field(default="RAZORPAY", max_length=50)
    provider_order_id: Optional[str] = Field(default=None, index=True, max_length=255)
    provider_payment_id: Optional[str] = Field(default=None, index=True, max_length=255)
    provider_signature: Optional[str] = Field(default=None, max_length=255)
    
    status: str = Field(default="PENDING", max_length=20) # PENDING, SUCCESS, FAILED, REFUNDED
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = Field(default=None)
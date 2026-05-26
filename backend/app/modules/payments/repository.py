from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from app.modules.payments.models import Payment

class PaymentRepository:
    def __init__(self, session: Session):
        self.session = session

    def create(self, payment_data: dict) -> Payment:
        payment = Payment(**payment_data)
        self.session.add(payment)
        self.session.commit()
        self.session.refresh(payment)
        return payment

    def get_by_provider_order_id(self, order_id: str) -> Optional[Payment]:
        stmt = select(Payment).where(Payment.provider_order_id == order_id)
        return self.session.execute(stmt).scalar_one_or_none()

    def update(self, payment: Payment) -> Payment:
        self.session.add(payment)
        self.session.commit()
        self.session.refresh(payment)
        return payment

    def list_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Payment]:
        stmt = select(Payment).where(Payment.user_id == user_id).order_by(Payment.created_at.desc()).offset(skip).limit(limit)
        return self.session.execute(stmt).scalars().all()
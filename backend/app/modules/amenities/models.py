from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime, date
from typing import Optional, List, Any
import uuid

class Amenity(SQLModel, table=True):
    __tablename__ = "amenities"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(max_length=255, unique=True)
    slug: str = Field(max_length=255, unique=True, index=True)
    description: Optional[str] = Field(default=None)
    
    # Store dynamic form fields (e.g., [{"name": "Number of Guests", "type": "number"}])
    form_fields: List[dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    
    fee_amount: float = Field(default=0.0)
    allow_multi_day: bool = Field(default=False)
    
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AmenityBooking(SQLModel, table=True):
    __tablename__ = "amenity_bookings"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    booking_number: str = Field(max_length=255, unique=True, index=True)
    
    user_id: uuid.UUID = Field(foreign_key="users.id")
    amenity_id: uuid.UUID = Field(foreign_key="amenities.id")
    assigned_officer_id: Optional[uuid.UUID] = Field(default=None, foreign_key="users.id")
    
    # Specific Booking Date (requested by user)
    booking_date: date = Field(...)
    end_date: Optional[date] = Field(default=None)
    
    # Applicant details
    applicant_name: Optional[str] = Field(default=None, max_length=255)
    contact_number: Optional[str] = Field(default=None, max_length=50)
    identity_proof: Optional[str] = Field(default=None, max_length=255)
    
    status: str = Field(default="PENDING", max_length=50) # PENDING, APPROVED, REJECTED
    remarks: Optional[str] = Field(default=None)
    
    # Answers to dynamic form fields
    form_data: dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

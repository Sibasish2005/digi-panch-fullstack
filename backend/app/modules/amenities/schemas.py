from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
import uuid

class AmenityBase(BaseModel):
    name: str
    description: Optional[str] = None
    form_fields: List[dict[str, Any]] = []
    fee_amount: float = 0.0
    is_active: bool = True

class AmenityCreate(AmenityBase):
    pass

class AmenityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    form_fields: Optional[List[dict[str, Any]]] = None
    fee_amount: Optional[float] = None
    is_active: Optional[bool] = None

class AmenityRead(AmenityBase):
    id: uuid.UUID
    slug: str
    created_at: datetime
    
    class Config:
        orm_mode = True


class AmenityBookingBase(BaseModel):
    booking_date: date
    form_data: dict[str, Any] = {}

class AmenityBookingCreate(AmenityBookingBase):
    pass

class AmenityBookingUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None

class AmenityBookingRead(AmenityBookingBase):
    id: uuid.UUID
    booking_number: str
    user_id: uuid.UUID
    amenity_id: uuid.UUID
    assigned_officer_id: Optional[uuid.UUID] = None
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class AmenityBookingWithAmenity(AmenityBookingRead):
    amenity: AmenityRead
    
    class Config:
        orm_mode = True

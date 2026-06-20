import uuid
from typing import List, Optional
from datetime import datetime, date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.modules.amenities.models import Amenity, AmenityBooking
from app.modules.amenities.schemas import AmenityCreate, AmenityUpdate, AmenityBookingCreate
import re

def generate_unique_slug(db: Session, model_class, base_name: str) -> str:
    slug_base = re.sub(r'[^a-z0-9]+', '-', base_name.lower()).strip('-')
    slug = slug_base
    counter = 1
    while True:
        stmt = select(model_class).where(model_class.slug == slug)
        exists = db.execute(stmt).scalar_one_or_none()
        if not exists:
            return slug
        slug = f"{slug_base}-{counter}"
        counter += 1

def get_amenity_by_slug(db: Session, slug: str) -> Amenity:
    stmt = select(Amenity).where(Amenity.slug == slug)
    amenity = db.execute(stmt).scalar_one_or_none()
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    return amenity

def get_amenity_by_id(db: Session, amenity_id: uuid.UUID) -> Amenity:
    amenity = db.get(Amenity, amenity_id)
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    return amenity

def get_all_amenities(db: Session, active_only: bool = False) -> List[Amenity]:
    stmt = select(Amenity)
    if active_only:
        stmt = stmt.where(Amenity.is_active == True)
    return db.execute(stmt).scalars().all()

def create_amenity(db: Session, data: AmenityCreate) -> Amenity:
    # Check if name exists
    stmt = select(Amenity).where(Amenity.name == data.name)
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Amenity with this name already exists")
        
    slug = generate_unique_slug(db, Amenity, data.name)
    
    amenity = Amenity(
        name=data.name,
        slug=slug,
        description=data.description,
        form_fields=data.form_fields,
        fee_amount=data.fee_amount,
        is_active=data.is_active
    )
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return amenity

def update_amenity(db: Session, amenity_id: uuid.UUID, data: AmenityUpdate) -> Amenity:
    amenity = get_amenity_by_id(db, amenity_id)
    
    update_data = data.dict(exclude_unset=True)
    
    if "name" in update_data and update_data["name"] != amenity.name:
        # Check name collision
        stmt = select(Amenity).where(Amenity.name == update_data["name"]).where(Amenity.id != amenity_id)
        existing = db.execute(stmt).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Amenity with this name already exists")
        amenity.slug = generate_unique_slug(db, Amenity, update_data["name"])
        
    for key, value in update_data.items():
        setattr(amenity, key, value)
        
    db.add(amenity)
    db.commit()
    db.refresh(amenity)
    return amenity


def create_amenity_booking(db: Session, amenity_id: uuid.UUID, user_id: uuid.UUID, data: AmenityBookingCreate) -> AmenityBooking:
    amenity = get_amenity_by_id(db, amenity_id)
    if not amenity.is_active:
        raise HTTPException(status_code=400, detail="This amenity is not currently active for booking")
        
    # Generate booking number
    import random
    import string
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    booking_number = f"BK-{datetime.now().strftime('%Y%m%d')}-{random_str}"
    
    # Optional: logic to assign an officer automatically
    # For now, it stays unassigned or assigned randomly.
    
    booking = AmenityBooking(
        booking_number=booking_number,
        user_id=user_id,
        amenity_id=amenity_id,
        booking_date=data.booking_date,
        form_data=data.form_data,
        status="PENDING"
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

def get_user_bookings(db: Session, user_id: uuid.UUID) -> List[AmenityBooking]:
    stmt = select(AmenityBooking).where(AmenityBooking.user_id == user_id).order_by(AmenityBooking.created_at.desc())
    return db.execute(stmt).scalars().all()

def get_all_bookings(db: Session) -> List[AmenityBooking]:
    stmt = select(AmenityBooking).order_by(AmenityBooking.created_at.desc())
    return db.execute(stmt).scalars().all()

def get_officer_bookings(db: Session, officer_id: uuid.UUID) -> List[AmenityBooking]:
    stmt = select(AmenityBooking).where(AmenityBooking.assigned_officer_id == officer_id).order_by(AmenityBooking.created_at.desc())
    return db.execute(stmt).scalars().all()

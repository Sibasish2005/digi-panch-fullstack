from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.db.session import get_session
from app.api.deps import get_current_user
from app.modules.roles.guards import require_admin, require_officer
from app.modules.users.models import User
from app.modules.amenities import schemas, service

router = APIRouter()

@router.get("", response_model=List[schemas.AmenityRead])
def get_amenities(active_only: bool = False, db: Session = Depends(get_session)):
    """Get all amenities."""
    return service.get_all_amenities(db, active_only=active_only)

@router.get("/{slug}", response_model=schemas.AmenityRead)
def get_amenity(slug: str, db: Session = Depends(get_session)):
    """Get amenity by slug."""
    return service.get_amenity_by_slug(db, slug)

@router.post("", response_model=schemas.AmenityRead, dependencies=[Depends(require_admin)])
def create_amenity(data: schemas.AmenityCreate, db: Session = Depends(get_session)):
    """Create a new amenity (Admin only)."""
    return service.create_amenity(db, data)

@router.patch("/{amenity_id}", response_model=schemas.AmenityRead, dependencies=[Depends(require_admin)])
def update_amenity(amenity_id: uuid.UUID, data: schemas.AmenityUpdate, db: Session = Depends(get_session)):
    """Update an amenity (Admin only)."""
    return service.update_amenity(db, amenity_id, data)

# Bookings

@router.get("/bookings/my", response_model=List[schemas.AmenityBookingWithAmenity])
def get_my_bookings(db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Get bookings for the logged-in citizen."""
    bookings = service.get_user_bookings(db, current_user.id)
    # Prefetch amenities for the response (assuming the ORM will lazy load or we just populate it)
    result = []
    for b in bookings:
        amenity = service.get_amenity_by_id(db, b.amenity_id)
        b_dict = b.dict()
        b_dict["amenity"] = amenity.dict()
        result.append(b_dict)
    return result

@router.post("/{slug}/book", response_model=schemas.AmenityBookingRead)
def book_amenity(slug: str, data: schemas.AmenityBookingCreate, db: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    """Submit a booking request for an amenity."""
    amenity = service.get_amenity_by_slug(db, slug)
    return service.create_amenity_booking(db, amenity.id, current_user.id, data)

@router.get("/bookings/all", response_model=List[schemas.AmenityBookingWithAmenity], dependencies=[Depends(require_officer)])
def get_all_bookings(db: Session = Depends(get_session)):
    """Get all bookings (Admin/Officer)."""
    bookings = service.get_all_bookings(db)
    result = []
    for b in bookings:
        amenity = service.get_amenity_by_id(db, b.amenity_id)
        b_dict = b.dict()
        b_dict["amenity"] = amenity.dict()
        result.append(b_dict)
    return result

@router.patch("/bookings/{booking_id}/status", response_model=schemas.AmenityBookingRead, dependencies=[Depends(require_officer)])
def update_booking_status(booking_id: uuid.UUID, data: schemas.AmenityBookingUpdate, db: Session = Depends(get_session)):
    """Update a booking status (Approve/Reject)."""
    booking = db.get(service.AmenityBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if data.status:
        booking.status = data.status
    if data.remarks is not None:
        booking.remarks = data.remarks
        
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

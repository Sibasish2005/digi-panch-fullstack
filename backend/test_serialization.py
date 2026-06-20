from app.db.session import engine
from sqlmodel import Session
from app.modules.amenities.models import AmenityBooking
from app.modules.amenities.schemas import AmenityBookingWithAmenity
from app.modules.amenities import service

with Session(engine) as db:
    bookings = db.query(AmenityBooking).all()
    result = []
    for b in bookings:
        amenity = service.get_amenity_by_id(db, b.amenity_id)
        b_dict = b.dict()
        b_dict["amenity"] = amenity.dict()
        try:
            # Serialize using Pydantic (parse_obj since we are passing a dict now)
            schema = AmenityBookingWithAmenity.parse_obj(b_dict)
            print("Serialization successful:", schema.json())
        except Exception as e:
            print("Serialization Failed!", e)

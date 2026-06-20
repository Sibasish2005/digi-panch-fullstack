from app.db.session import engine
from sqlmodel import Session
from app.modules.amenities.models import AmenityBooking

with Session(engine) as db:
    bookings = db.query(AmenityBooking).all()
    print("Bookings count:", len(bookings))
    if len(bookings) > 0:
        for b in bookings:
            print(f"Booking {b.id}: {b.form_data}")

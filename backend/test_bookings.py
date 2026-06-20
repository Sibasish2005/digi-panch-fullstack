from app.db.session import engine
from sqlmodel import Session
from app.modules.amenities import service
import uuid

with Session(engine) as db:
    try:
        res = service.get_user_bookings(db, uuid.uuid4())
        print("Success:", res)
    except Exception as e:
        print("Error:", e)

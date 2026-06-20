import uuid
from sqlalchemy.orm import Session
from app.db.session import engine
from app.modules.amenities import service, routes
from app.modules.users.models import User

# fake user
user = User(
    id=uuid.UUID("a443ac37-f7b8-41a4-bd03-1b9c40cfe3d9"),
    clerk_id="user_123",
    email="test@test.com",
    role="CITIZEN",
    first_name="Test",
    last_name="Test"
)

with Session(engine) as db:
    try:
        res = routes.get_my_bookings(db=db, current_user=user)
        print("Function returned:", res)
    except Exception as e:
        print("Function Error:", e)


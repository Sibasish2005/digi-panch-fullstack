import sys
import os

# Add the project root to the python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from sqlalchemy import text
from app.db.session import engine

def main():
    print("Altering payments table to add booking_id...")
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE payments ADD COLUMN IF NOT EXISTS booking_id UUID;'))
        
        # We can add foreign key constraint if desired, but for now just the column is fine
        try:
            conn.execute(text('''
                ALTER TABLE payments 
                ADD CONSTRAINT fk_payments_booking_id 
                FOREIGN KEY (booking_id) 
                REFERENCES amenity_bookings(id);
            '''))
        except Exception as e:
            print("FK constraint might already exist or failed:", e)

    print("Success!")

if __name__ == "__main__":
    main()

import asyncio
from sqlalchemy import text
from app.db.session import engine

def alter_db():
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE document_types ADD COLUMN IF NOT EXISTS form_fields JSON;'))
        conn.execute(text('ALTER TABLE document_applications ADD COLUMN IF NOT EXISTS form_data JSON;'))
        
        # New user profile columns
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(500);'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(10);'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS panchayat VARCHAR(255);'))
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS police_station VARCHAR(255);'))
        
        # Amenities columns
        conn.execute(text('ALTER TABLE amenities ADD COLUMN IF NOT EXISTS allow_multi_day BOOLEAN DEFAULT FALSE;'))
        conn.execute(text('ALTER TABLE amenity_bookings ADD COLUMN IF NOT EXISTS end_date DATE;'))
        conn.execute(text('ALTER TABLE amenity_bookings ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);'))
        conn.execute(text('ALTER TABLE amenity_bookings ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);'))
        conn.execute(text('ALTER TABLE amenity_bookings ADD COLUMN IF NOT EXISTS identity_proof VARCHAR(255);'))
        
        conn.commit()
    print("Database altered successfully")

if __name__ == "__main__":
    alter_db()

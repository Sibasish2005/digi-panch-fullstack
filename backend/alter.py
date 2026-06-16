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
        
        conn.commit()
    print("Database altered successfully")

if __name__ == "__main__":
    alter_db()

import asyncio
from sqlalchemy import text
from app.db.session import engine

def alter_db():
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE document_types ADD COLUMN IF NOT EXISTS form_fields JSON;'))
        conn.execute(text('ALTER TABLE document_applications ADD COLUMN IF NOT EXISTS form_data JSON;'))
        conn.commit()
    print("Database altered successfully")

if __name__ == "__main__":
    alter_db()

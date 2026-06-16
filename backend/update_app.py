from sqlalchemy import text
from app.db.session import engine
import json

def update():
    with engine.connect() as conn:
        conn.execute(
            text("UPDATE document_applications SET form_data = NULL WHERE application_number = :app_no"),
            {'app_no': 'APP-20260616-SN7GZM'}
        )
        conn.commit()
    print('Updated application row successfully!')

if __name__ == "__main__":
    update()

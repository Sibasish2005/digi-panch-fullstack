import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from sqlalchemy import text
from app.db.session import engine

def main():
    print("Altering news_items table to add content...")
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE news_items ADD COLUMN IF NOT EXISTS content TEXT;'))
    print("Success!")

if __name__ == "__main__":
    main()

import sys
import os
import uuid
from datetime import datetime

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from sqlmodel import Session
from app.modules.news.models import NewsItem

def seed_news():
    db = Session(engine)
    try:
        # Check if news already exists
        if db.query(NewsItem).count() > 0:
            print("News items already exist in database.")
            return

        print("Seeding initial news items...")
        
        initial_news = [
            NewsItem(
                title="New AI-Based Grievance System Introduced",
                description="Citizens can now submit and track complaints digitally through the DigiPanch platform.",
                image_url="/images/news/news1.png",
                category="Technology",
                published_date="May 6, 2026",
                is_active=True
            ),
            NewsItem(
                title="Digital Land Record Access for Villagers",
                description="Panchayat residents can securely access land and certificate records online.",
                image_url="/images/news/news2.png",
                category="Governance",
                published_date="May 4, 2026",
                is_active=True
            ),
            NewsItem(
                title="Smart Village Development Initiative",
                description="New smart infrastructure projects launched under the rural digitization mission.",
                image_url="/images/news/news3.png",
                category="Development",
                published_date="May 1, 2026",
                is_active=True
            )
        ]

        db.add_all(initial_news)
        db.commit()
        print("Successfully seeded 3 news items.")
        
    except Exception as e:
        print(f"Error seeding news: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_news()

from sqlmodel import Session, create_engine
from app.core.config import setting

is_dev = setting.ENVIRONMENT == "development"

# Use the synchronous engine with pooling for production
engine = create_engine(
    setting.DATABASE_URL,
    echo=is_dev,
    pool_size=20,          
    max_overflow=10,       
    pool_timeout=30,       
    pool_recycle=1800      
)

def get_session():
    with Session(engine) as session:
        yield session
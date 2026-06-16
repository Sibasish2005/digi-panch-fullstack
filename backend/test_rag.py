import asyncio
from app.db.session import engine
from sqlmodel import Session
from app.modules.rag.ingestion import ingest_document

async def test():
    with Session(engine) as session:
        content = """
        According to the new Panchayat resolution passed on June 2026, 
        all water connection requests must be processed within 48 hours.
        There is a fee of ₹150 for residential water connections.
        """
        try:
            result = await ingest_document(
                session=session,
                title="Water Connection Rules 2026",
                source="Official Resolution",
                content=content.strip()
            )
            print("SUCCESS:", result)
        except Exception as e:
            print("ERROR:", str(e))

if __name__ == "__main__":
    asyncio.run(test())

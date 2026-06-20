from fastapi import APIRouter
from pydantic import BaseModel

class DummyResponse(BaseModel):
    name: int # Intentionally wrong type to cause ValidationError

router = APIRouter()

@router.get("/test-500", response_model=DummyResponse)
def test_500():
    return {"name": "not an integer"}

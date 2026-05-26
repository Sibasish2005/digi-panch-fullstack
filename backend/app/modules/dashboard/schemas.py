from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    total_applications: int
    pending_applications: int
    approved_applications: int
    total_grievances: int
    pending_grievances: int
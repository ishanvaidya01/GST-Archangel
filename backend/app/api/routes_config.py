from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(prefix="/api/config", tags=["config"])

class ThresholdUpdate(BaseModel):
    match_confidence_threshold: int

@router.get("/match-threshold")
async def get_match_threshold(user = Depends(get_current_user)):
    return {"match_confidence_threshold": settings.MATCH_CONFIDENCE_THRESHOLD}

@router.put("/match-threshold")
async def update_match_threshold(data: ThresholdUpdate, user = Depends(get_current_user)):
    settings.MATCH_CONFIDENCE_THRESHOLD = data.match_confidence_threshold
    return {"status": "success", "match_confidence_threshold": settings.MATCH_CONFIDENCE_THRESHOLD}

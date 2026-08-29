import uuid
import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import Case, LlmCall, Run
from app.core.security import get_current_user

router = APIRouter(prefix="/api", tags=["observability"])

@router.get("/audit/{run_id}/summary", dependencies=[Depends(get_current_user)])
async def get_audit_summary(run_id: str, db: AsyncSession = Depends(get_db)):
    from app.core.rate_limit import redis_client
    cache_key = f"summary:{run_id}"
    if redis_client:
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
            
    result = await db.execute(select(Case).where(Case.run_id == uuid.UUID(run_id)))
    cases = result.scalars().all()
    
    summary = {
        "scanned": len(cases),
        "matched": sum(1 for c in cases if c.risk_score == 0),
        "mismatched": sum(1 for c in cases if c.risk_score > 0),
        "high_risk": sum(1 for c in cases if c.risk_score > 70),
        "medium_risk": sum(1 for c in cases if 40 <= c.risk_score <= 70),
        "low_risk": sum(1 for c in cases if 0 < c.risk_score < 40),
        "itc_at_risk_amount": 0 
    }
    
    if redis_client:
        await redis_client.setex(cache_key, 3600, json.dumps(summary))
        
    return summary

@router.get("/observability/llm-calls", dependencies=[Depends(get_current_user)])
async def get_llm_calls(run_id: str, limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)):
    stmt = select(LlmCall).join(Case, LlmCall.case_id == Case.id).where(Case.run_id == uuid.UUID(run_id))
    stmt = stmt.order_by(LlmCall.timestamp.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    calls = result.scalars().all()
    
    return [
        {
            "id": str(c.id),
            "case_id": str(c.case_id),
            "agent_name": c.agent_name,
            "prompt": c.prompt,
            "response": c.response,
            "model_name": c.model_name,
            "input_tokens": c.input_tokens,
            "output_tokens": c.output_tokens,
            "latency_ms": c.latency_ms,
            "timestamp": c.timestamp.isoformat()
        } for c in calls
    ]

@router.get("/observability/summary", dependencies=[Depends(get_current_user)])
async def get_observability_summary(run_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(LlmCall).join(Case, LlmCall.case_id == Case.id).where(Case.run_id == uuid.UUID(run_id))
    result = await db.execute(stmt)
    calls = list(result.scalars().all())
    
    total_calls = len(calls)
    avg_latency = sum(c.latency_ms for c in calls) / total_calls if total_calls > 0 else 0
    total_in = sum(c.input_tokens for c in calls)
    total_out = sum(c.output_tokens for c in calls)
    
    estimated_cost_usd = (total_in / 1000 * 0.01) + (total_out / 1000 * 0.03)
    
    return {
        "total_calls": total_calls,
        "avg_latency_ms": avg_latency,
        "estimated_cost_usd": round(estimated_cost_usd, 4),
        "note": "Estimated cost based on standard pricing."
    }

@router.get("/observability/precision", dependencies=[Depends(get_current_user)])
async def get_observability_precision(run_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Case).where(Case.run_id == uuid.UUID(run_id), Case.human_verdict != None)
    result = await db.execute(stmt)
    cases = list(result.scalars().all())
    
    if not cases:
        return {"precision": 0, "total_evaluated": 0}
        
    correct = sum(1 for c in cases if c.human_verdict == c.current_action)
    
    return {
        "precision": correct / len(cases),
        "total_evaluated": len(cases)
    }

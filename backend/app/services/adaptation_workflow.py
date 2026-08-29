import uuid
from typing import Optional
import asyncio
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.adaptation_agent import AdaptationAgent
from app.db.models import Case, EvidenceLog
from app.core.events import publish_event, AgentEventPayload
from datetime import datetime, timezone
from app.db.session import async_sessionmaker_factory

logger = structlog.get_logger(__name__)

async def run_adaptation(case_id_str: str, evidence_text: str):
    case_id = uuid.UUID(case_id_str)
    try:
        async with async_sessionmaker_factory() as session:
            case = await session.get(Case, case_id)
            if not case:
                return
                
            agent = AdaptationAgent()
            
            old_case = {
                "risk_score": case.risk_score,
                "action": case.current_action
            }
            
            result = await agent.run(case.run_id, case.id, old_case=old_case, evidence_text=evidence_text)
            
            case.risk_score = result.new_risk
            case.current_action = result.new_action
            
            evidence = EvidenceLog(
                case_id=case.id,
                submitted_text=evidence_text,
                resulting_diff=result.model_dump()
            )
            session.add(evidence)
            
            await session.commit()
            
            from app.core.rate_limit import redis_client
            if redis_client:
                await redis_client.delete(f"summary:{str(case.run_id)}")
                
    except Exception as e:
        logger.error("adaptation_failed", error=str(e))
        return None

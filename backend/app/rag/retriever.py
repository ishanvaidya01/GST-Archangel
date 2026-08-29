import structlog
from typing import List, Dict
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import RuleChunk
from app.rag.ingest_corpus import get_embedding

logger = structlog.get_logger(__name__)

async def retrieve_relevant_rules(db: AsyncSession, query: str, top_k: int = 3) -> List[Dict[str, str]]:
    try:
        query_embedding = await get_embedding(query)
        
        stmt = select(RuleChunk).order_by(RuleChunk.embedding.cosine_distance(query_embedding)).limit(top_k)
        result = await db.execute(stmt)
        chunks = result.scalars().all()
        
        return [{"citation": c.citation, "content": c.content} for c in chunks]
    except Exception as e:
        logger.warning("retrieval_failed", error=str(e))
        return []

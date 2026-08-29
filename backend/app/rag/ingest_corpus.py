import os
import asyncio
import httpx
from app.db.session import async_sessionmaker_factory
from app.db.models import RuleChunk
from app.core.config import settings

async def get_embedding(text: str) -> list[float]:
    # Since Gemini is removed, always return mock embeddings
    return [0.01] * 1536

async def ingest():
    corpus_dir = os.path.join(os.path.dirname(__file__), "rules_corpus")
    
    async with async_sessionmaker_factory() as session:
        for filename in os.listdir(corpus_dir):
            if not filename.endswith(".md"):
                continue
                
            filepath = os.path.join(corpus_dir, filename)
            with open(filepath, "r") as f:
                content = f.read()
                
            embedding = await get_embedding(content)
            
            chunk = RuleChunk(
                content=content,
                citation=filename,
                embedding=embedding
            )
            session.add(chunk)
            print(f"Ingested {filename}")
            
        await session.commit()

if __name__ == "__main__":
    asyncio.run(ingest())

import asyncio
import time
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
import structlog
import uuid

from app.db.models import LlmCall
from app.db.session import async_sessionmaker_factory

logger = structlog.get_logger(__name__)

T = TypeVar('T', bound=BaseModel)

async def _log_llm_call_safe(case_id, agent_name, prompt, response, model_name, input_tokens, output_tokens, latency_ms):
    try:
        async with async_sessionmaker_factory() as session:
            call_log = LlmCall(
                case_id=case_id,
                agent_name=agent_name,
                prompt=prompt,
                response=response,
                model_name=model_name,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                latency_ms=latency_ms
            )
            session.add(call_log)
            await session.commit()
    except Exception as e:
        logger.warning("llm_logging_failed", error=str(e))

async def complete_structured(
    prompt: str, 
    schema: Type[T], 
    agent_name: str, 
    case_id: Optional[uuid.UUID] = None
) -> T:
    start_time = time.time()
    model_name = "local-mock-agent"
    
    # Simulate processing time
    await asyncio.sleep(1.0)
    
    # Generate mock response based on schema defaults
    result = schema()
    response_text = result.model_dump_json()
    
    input_tokens = len(prompt.split())
    output_tokens = len(response_text.split())
    
    logger.info("mock_agent_success", agent=agent_name, tokens_out=output_tokens)
    
    latency_ms = int((time.time() - start_time) * 1000)
    asyncio.create_task(_log_llm_call_safe(
        case_id, agent_name, prompt, response_text, model_name, input_tokens, output_tokens, latency_ms
    ))
        
    return result

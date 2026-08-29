from abc import ABC, abstractmethod
from typing import Dict, Any, Type, TypeVar
import uuid
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.events import publish_event, AgentEventPayload
from app.core.llm_client import complete_structured

T = TypeVar('T', bound=BaseModel)

class Agent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.current_run_id = None

    @abstractmethod
    async def perceive(self, case_id: uuid.UUID, **kwargs) -> str:
        pass

    @abstractmethod
    def get_schema(self) -> Type[T]:
        pass

    async def think(self, case_id: uuid.UUID, prompt: str) -> T:
        schema = self.get_schema()
        result = await complete_structured(prompt, schema, self.name, case_id)
        
        publish_event(
            run_id=str(self.current_run_id),
            event=AgentEventPayload(
                run_id=str(self.current_run_id),
                case_id=str(case_id),
                agent_name=self.name,
                step="THINK",
                message=f"{self.name} completed analysis.",
                reasoning=result.model_dump() if hasattr(result, "model_dump") else {},
                timestamp=datetime.now(timezone.utc)
            )
        )
        return result

    @abstractmethod
    async def act(self, case_id: uuid.UUID, thought_result: T) -> Any:
        pass

    async def run(self, run_id: uuid.UUID, case_id: uuid.UUID, **kwargs) -> Any:
        self.current_run_id = run_id
        
        publish_event(
            run_id=str(run_id),
            event=AgentEventPayload(
                run_id=str(run_id),
                case_id=str(case_id),
                agent_name=self.name,
                step="PERCEIVE",
                message=f"{self.name} gathering facts...",
                timestamp=datetime.now(timezone.utc)
            )
        )
        
        prompt = await self.perceive(case_id, **kwargs)
        thought_result = await self.think(case_id, prompt)
        
        publish_event(
            run_id=str(run_id),
            event=AgentEventPayload(
                run_id=str(run_id),
                case_id=str(case_id),
                agent_name=self.name,
                step="ACT",
                message=f"{self.name} executing action...",
                timestamp=datetime.now(timezone.utc)
            )
        )
        
        final_result = await self.act(case_id, thought_result)
        return final_result

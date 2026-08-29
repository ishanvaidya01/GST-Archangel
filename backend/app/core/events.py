import asyncio
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.config import settings

class AgentEventPayload(BaseModel):
    run_id: str
    case_id: Optional[str] = None
    agent_name: str
    step: str
    message: Optional[str] = None
    reasoning: Optional[Dict[str, Any]] = None
    timestamp: datetime
    risk_score_delta: Optional[int] = None

class EventBus(ABC):
    @abstractmethod
    async def publish(self, run_id: str, event: AgentEventPayload):
        pass

    @abstractmethod
    async def subscribe(self, run_id: str) -> asyncio.Queue:
        pass

    @abstractmethod
    async def unsubscribe(self, run_id: str, queue: asyncio.Queue):
        pass

class InMemoryEventBus(EventBus):
    def __init__(self):
        self.subscribers: Dict[str, list[asyncio.Queue]] = {}

    async def publish(self, run_id: str, event: AgentEventPayload):
        if run_id in self.subscribers:
            for queue in self.subscribers[run_id]:
                try:
                    queue.put_nowait(event.model_dump_json())
                except asyncio.QueueFull:
                    pass

    async def subscribe(self, run_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if run_id not in self.subscribers:
            self.subscribers[run_id] = []
        self.subscribers[run_id].append(queue)
        return queue

    async def unsubscribe(self, run_id: str, queue: asyncio.Queue):
        if run_id in self.subscribers and queue in self.subscribers[run_id]:
            self.subscribers[run_id].remove(queue)
            if not self.subscribers[run_id]:
                del self.subscribers[run_id]

class RedisEventBus(EventBus):
    def __init__(self):
        from app.core.rate_limit import redis_client
        self.redis = redis_client

    async def publish(self, run_id: str, event: AgentEventPayload):
        if self.redis:
            asyncio.create_task(self.redis.publish(f"audit_events:{run_id}", event.model_dump_json()))

    async def subscribe(self, run_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if not self.redis:
            return queue

        pubsub = self.redis.pubsub()
        await pubsub.subscribe(f"audit_events:{run_id}")
        
        async def reader():
            try:
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await queue.put(message["data"])
            except Exception:
                pass
                
        task = asyncio.create_task(reader())
        # Store for cleanup
        queue.pubsub = pubsub
        queue.reader_task = task
        return queue

    async def unsubscribe(self, run_id: str, queue: asyncio.Queue):
        if hasattr(queue, "pubsub"):
            await queue.pubsub.unsubscribe(f"audit_events:{run_id}")
            await queue.pubsub.close()
        if hasattr(queue, "reader_task"):
            queue.reader_task.cancel()

event_bus: Optional[EventBus] = None

def get_event_bus() -> EventBus:
    global event_bus
    if event_bus is None:
        if settings.REDIS_URL:
            event_bus = RedisEventBus()
        else:
            event_bus = InMemoryEventBus()
    return event_bus

def publish_event(run_id: str, event: AgentEventPayload):
    bus = get_event_bus()
    asyncio.create_task(bus.publish(run_id, event))

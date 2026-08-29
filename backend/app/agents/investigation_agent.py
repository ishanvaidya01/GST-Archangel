import uuid
from typing import List
from pydantic import BaseModel, Field
from app.agents.base import Agent

class InvestigationResult(BaseModel):
    likely_cause: str = Field(default="", description="The likely cause of the mismatch or risk")
    confidence: int = Field(default=0, description="Confidence score from 0 to 100")
    supporting_facts: List[str] = Field(default_factory=list, description="List of facts supporting this conclusion")

class InvestigationAgent(Agent):
    def __init__(self):
        super().__init__("InvestigationAgent")

    def get_schema(self):
        return InvestigationResult

    async def perceive(self, case_id: uuid.UUID, case_facts: dict = None, **kwargs) -> str:
        return f"Analyze the following case facts for GST mismatches:\n{case_facts}"

    async def act(self, case_id: uuid.UUID, thought_result: InvestigationResult) -> InvestigationResult:
        return thought_result

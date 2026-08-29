import uuid
from pydantic import BaseModel, Field
from app.agents.base import Agent

class AdaptationResult(BaseModel):
    previous_risk: int = Field(default=0)
    new_risk: int = Field(default=0)
    previous_action: str = Field(default="")
    new_action: str = Field(default="")
    explanation: str = Field(default="")

class AdaptationAgent(Agent):
    def __init__(self):
        super().__init__("AdaptationAgent")

    def get_schema(self):
        return AdaptationResult

    async def perceive(self, case_id: uuid.UUID, old_case: dict = None, evidence_text: str = "", **kwargs) -> str:
        return f"Old case state: {old_case}. New evidence: {evidence_text}. Re-evaluate."

    async def act(self, case_id: uuid.UUID, thought_result: AdaptationResult) -> AdaptationResult:
        return thought_result

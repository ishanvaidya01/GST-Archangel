import uuid
from enum import Enum
from pydantic import BaseModel, Field
from app.agents.base import Agent

class DecisionEnum(str, Enum):
    REQUEST_INVOICE = "REQUEST_INVOICE"
    GENERATE_ADVISORY = "GENERATE_ADVISORY"
    RECORD_AUDIT = "RECORD_AUDIT"
    ESCALATE_HUMAN = "ESCALATE_HUMAN"

class DecisionResult(BaseModel):
    action: DecisionEnum = Field(default=DecisionEnum.RECORD_AUDIT, description="The action to take")
    reason: str = Field(default="", description="Reasoning for this decision")

class DecisionAgent(Agent):
    def __init__(self):
        super().__init__("DecisionAgent")

    def get_schema(self):
        return DecisionResult

    async def perceive(self, case_id: uuid.UUID, risk_score: int = 0, investigation: dict = None, rules: dict = None, **kwargs) -> str:
        return f"Risk Score: {risk_score}\nInvestigation: {investigation}\nRules Check: {rules}\nDecide on an action."

    async def act(self, case_id: uuid.UUID, thought_result: DecisionResult) -> DecisionResult:
        return thought_result

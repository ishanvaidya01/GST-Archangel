import uuid
from pydantic import BaseModel, Field
from app.agents.base import Agent
from app.agents.decision_agent import DecisionResult

class ActionResult(BaseModel):
    type: str = Field(default="audit_note", description="The type of action draft")
    content: str = Field(default="", description="The drafted content")
    status: str = Field(default="DRAFT_PENDING_APPROVAL")

class ActionAgent(Agent):
    def __init__(self):
        super().__init__("ActionAgent")

    def get_schema(self):
        return ActionResult

    async def perceive(self, case_id: uuid.UUID, decision: DecisionResult = None, **kwargs) -> str:
        action_val = decision.action.value if decision and decision.action else "UNKNOWN"
        reason_val = decision.reason if decision else ""
        return f"Draft content for action: {action_val}. Reason: {reason_val}"

    async def act(self, case_id: uuid.UUID, thought_result: ActionResult) -> ActionResult:
        thought_result.status = "DRAFT_PENDING_APPROVAL"
        return thought_result

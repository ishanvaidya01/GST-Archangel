import uuid
from typing import List
from pydantic import BaseModel, Field
from app.agents.base import Agent
from app.db.session import async_sessionmaker_factory
from app.rag.retriever import retrieve_relevant_rules

class RuleCheck(BaseModel):
    rule_citation: str = Field(default="")
    compliant: bool = Field(default=True)
    note: str = Field(default="")

class GstRulesResult(BaseModel):
    rule_checks: List[RuleCheck] = Field(default_factory=list)

class GstRulesAgent(Agent):
    def __init__(self):
        super().__init__("GstRulesAgent")

    def get_schema(self):
        return GstRulesResult

    async def perceive(self, case_id: uuid.UUID, case_facts: dict = None, **kwargs) -> str:
        query = f"GST mismatch regarding {case_facts.get('hsn_code', '')} {case_facts.get('supplier_name', '')}"
        
        async with async_sessionmaker_factory() as session:
            retrieved = await retrieve_relevant_rules(session, query)
            
        prompt = f"Case Facts: {case_facts}\nRetrieved Rules: {retrieved}\nCheck compliance."
        return prompt

    async def act(self, case_id: uuid.UUID, thought_result: GstRulesResult) -> GstRulesResult:
        return thought_result

import uuid
import asyncio
from app.agents.investigation_agent import InvestigationAgent
from app.agents.gst_rules_agent import GstRulesAgent
from app.agents.decision_agent import DecisionAgent
from app.agents.action_agent import ActionAgent

async def run_pipeline(run_id: uuid.UUID, case_id: uuid.UUID, case_facts: dict, risk_score: int):
    inv_agent = InvestigationAgent()
    rules_agent = GstRulesAgent()
    
    inv_result, rules_result = await asyncio.gather(
        inv_agent.run(run_id, case_id, case_facts=case_facts),
        rules_agent.run(run_id, case_id, case_facts=case_facts)
    )
    
    dec_agent = DecisionAgent()
    dec_result = await dec_agent.run(
        run_id, case_id, 
        risk_score=risk_score, 
        investigation=inv_result.model_dump() if hasattr(inv_result, "model_dump") else {}, 
        rules=rules_result.model_dump() if hasattr(rules_result, "model_dump") else {}
    )
    
    act_agent = ActionAgent()
    act_result = await act_agent.run(run_id, case_id, decision=dec_result)
    
    return {
        "investigation": inv_result,
        "rules": rules_result,
        "decision": dec_result,
        "action": act_result
    }

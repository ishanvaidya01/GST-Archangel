import asyncio
import uuid
import structlog
from typing import List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import async_sessionmaker_factory
from app.db.models import Run, Transaction, Invoice, Case, SupplierHistory
from app.reconciliation.matcher import match_transaction_to_invoices
from app.reconciliation.risk_engine import compute_risk
from app.agents.orchestrator import run_pipeline
from app.core.events import publish_event, AgentEventPayload
from datetime import datetime, timezone
import json

logger = structlog.get_logger(__name__)

async def process_case(run_id: uuid.UUID, case_id: uuid.UUID, case_facts: dict, risk_score: int):
    if risk_score >= 0: # Process all for demo
        await run_pipeline(run_id, case_id, case_facts, risk_score)

async def run_full_audit(run_id_str: str):
    run_id = uuid.UUID(run_id_str)
    
    publish_event(run_id_str, AgentEventPayload(
        run_id=run_id_str,
        agent_name="System",
        step="WORKFLOW_STARTED",
        timestamp=datetime.now(timezone.utc)
    ))
    
    try:
        async with async_sessionmaker_factory() as session:
            tx_res = await session.execute(select(Transaction).where(Transaction.run_id == run_id))
            transactions = list(tx_res.scalars().all())
            
            inv_res = await session.execute(select(Invoice).where(Invoice.run_id == run_id))
            invoices = list(inv_res.scalars().all())
            
            sh_res = await session.execute(select(SupplierHistory).where(SupplierHistory.run_id == run_id))
            histories = list(sh_res.scalars().all())
            hist_dict = {h.supplier_name: h for h in histories}
            
            matched, unmatched = match_transaction_to_invoices(transactions, invoices)
            
            all_raw_cases = matched + unmatched
            cases_to_create = []
            
            for c in all_raw_cases:
                t = c.get("transaction")
                i = c.get("invoice")
                
                supplier = None
                if i:
                    supplier = i.supplier_name
                elif t:
                    supplier = t.counterparty
                    
                sh = hist_dict.get(supplier) if supplier else None
                
                case_facts = {
                    "transaction": t,
                    "invoice": i,
                    "supplier_history": sh
                }
                
                risk_result = compute_risk(case_facts)
                
                db_case = Case(
                    run_id=run_id,
                    transaction_id=t.id if t else None,
                    invoice_id=i.id if i else None,
                    status="pending",
                    risk_score=risk_result["score"],
                    risk_breakdown=risk_result["breakdown"]
                )
                session.add(db_case)
                cases_to_create.append({"db_case": db_case, "facts": case_facts})
                
            await session.flush()
            
            tasks = []
            for item in cases_to_create:
                db_case = item["db_case"]
                facts = item["facts"]
                
                facts_dict = {}
                if facts["transaction"]:
                    facts_dict["transaction"] = {"amount": str(facts["transaction"].amount), "counterparty": facts["transaction"].counterparty}
                if facts["invoice"]:
                    facts_dict["invoice"] = {"total": str(facts["invoice"].total), "supplier_name": facts["invoice"].supplier_name, "hsn_code": facts["invoice"].hsn_code}
                    
                tasks.append(process_case(run_id, db_case.id, facts_dict, db_case.risk_score))
                
            await asyncio.gather(*tasks)
            
            run = await session.get(Run, run_id)
            if run.ingestion_errors:
                run.status = "completed_with_errors"
            else:
                run.status = "completed"
                
            await session.commit()
            
    except Exception as e:
        logger.exception("audit_workflow_failed", run_id=run_id_str, error=str(e))
        async with async_sessionmaker_factory() as session:
            run = await session.get(Run, run_id)
            if run:
                run.status = "failed"
                await session.commit()
    finally:
        publish_event(run_id_str, AgentEventPayload(
            run_id=run_id_str,
            agent_name="System",
            step="WORKFLOW_COMPLETED",
            timestamp=datetime.now(timezone.utc)
        ))

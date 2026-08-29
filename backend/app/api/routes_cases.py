import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Case, AgentEvent, EvidenceLog, Transaction, Invoice
from app.core.security import get_current_user
from app.core.rate_limit import evidence_rate_limit

router = APIRouter(prefix="/api/cases", tags=["cases"])

class EvidenceRequest(BaseModel):
    text: str

class VerdictRequest(BaseModel):
    verdict: str

def _risk_tier_label(score: int) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"

def _recommended_action(action_code: str | None) -> str:
    mapping = {
        "REQUEST_INVOICE": "Request Invoice",
        "REVERSE_ITC": "Reverse ITC",
        "MARK_DUPLICATE": "Mark as Duplicate",
        "CORRECT_FILE": "Correct & File",
        "CA_REVIEW": "CA Review",
    }
    return mapping.get(action_code or "", "Review & Verify")

@router.get("/all/list")
async def list_all_cases(
    sort_by: str = "risk_score",
    sort_dir: str = "desc",
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List cases across all runs — used by the dashboard overview."""
    stmt = select(Case)
    if sort_dir == "desc":
        stmt = stmt.order_by(Case.risk_score.desc())
    else:
        stmt = stmt.order_by(Case.risk_score.asc())
    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    cases = result.scalars().all()

    out = []
    for c in cases:
        tx = await db.get(Transaction, c.transaction_id) if c.transaction_id else None
        inv = await db.get(Invoice, c.invoice_id) if c.invoice_id else None
        out.append(_format_case_summary(c, tx, inv))

    return {"cases": out, "total": len(out)}


@router.get("/{run_id}")
async def list_cases(
    run_id: str,
    sort_by: str = "risk_score",
    sort_dir: str = "desc",
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List all cases for a specific run, returning the full summary shape."""
    try:
        run_uuid = uuid.UUID(run_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid run_id format")

    stmt = select(Case).where(Case.run_id == run_uuid)
    if sort_dir == "desc":
        stmt = stmt.order_by(Case.risk_score.desc())
    else:
        stmt = stmt.order_by(Case.risk_score.asc())
    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    cases = result.scalars().all()

    out = []
    for c in cases:
        tx = await db.get(Transaction, c.transaction_id) if c.transaction_id else None
        inv = await db.get(Invoice, c.invoice_id) if c.invoice_id else None
        out.append(_format_case_summary(c, tx, inv))

    return {"cases": out, "total": len(out)}


def _format_case_summary(c: Case, tx: Transaction | None, inv: Invoice | None) -> dict:
    """Build the full CaseSummary shape from DB models."""
    counterparty = (
        (tx.counterparty if tx else None)
        or (inv.supplier_name if inv else None)
        or "Unknown Supplier"
    )
    amount = float(tx.amount) if tx else (float(inv.total) if inv else 0.0)
    
    # Determine the primary issue from risk_breakdown
    breakdown: dict = c.risk_breakdown or {}
    top_issue = "Discrepancy detected"
    if breakdown:
        # risk_breakdown is a dict of {issue_label: score}; pick the highest
        top_issue = max(breakdown, key=lambda k: breakdown[k], default="Discrepancy detected")

    return {
        "case_id": str(c.id),
        "run_id": str(c.run_id),
        "counterparty": counterparty,
        "gstin": inv.gstin if inv else None,
        "amount": amount,
        "issue": top_issue,
        "risk_score": c.risk_score,
        "risk_tier": _risk_tier_label(c.risk_score),
        "status": c.status,
        "recommended_action": _recommended_action(c.current_action),
        "invoice_no": inv.invoice_no if inv else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.get("/detail/{case_id}")
async def get_case_detail(case_id: str, db: AsyncSession = Depends(get_db)):
    try:
        case_uuid = uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid case_id format")

    case = await db.get(Case, case_uuid)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    tx = await db.get(Transaction, case.transaction_id) if case.transaction_id else None
    inv = await db.get(Invoice, case.invoice_id) if case.invoice_id else None

    ev_result = await db.execute(
        select(AgentEvent).where(AgentEvent.case_id == case_uuid).order_by(AgentEvent.timestamp)
    )
    agent_events = ev_result.scalars().all()

    ev_log_res = await db.execute(
        select(EvidenceLog).where(EvidenceLog.case_id == case_uuid).order_by(EvidenceLog.submitted_at)
    )
    evidence_log = ev_log_res.scalars().all()

    counterparty = (
        (tx.counterparty if tx else None)
        or (inv.supplier_name if inv else None)
        or "Unknown Supplier"
    )
    amount = float(tx.amount) if tx else (float(inv.total) if inv else 0.0)
    breakdown: dict = case.risk_breakdown or {}
    top_issue = max(breakdown, key=lambda k: breakdown[k], default="Discrepancy detected") if breakdown else "Discrepancy detected"

    # Build risk_factors from risk_breakdown
    risk_factors = [
        {"label": label, "score": score, "description": f"{label} detected for this transaction."}
        for label, score in breakdown.items()
    ]

    # Build action preview
    action_type = case.current_action or "audit_note"
    action_preview = {
        "action_type": action_type,
        "title": f"{_recommended_action(action_type)} — {counterparty}",
        "explanation": (
            f"No valid invoice matching this ₹{amount:,.0f} bank debit was found. "
            f"ITC cannot be claimed without a GST-compliant invoice. "
            f"Recommended action: {_recommended_action(action_type)}."
        ),
        "draft_content": (
            f"Dear {counterparty},\n\n"
            f"This is to inform you that we have identified a payment of ₹{amount:,.0f} "
            f"(Case: {str(case.id)[:8].upper()}) debited from our account for which no "
            f"corresponding GST-compliant invoice has been received.\n\n"
            f"As per Section 16 of the CGST Act, input tax credit can only be claimed against "
            f"a valid invoice. We request you to provide the relevant invoice or documentation "
            f"at your earliest convenience.\n\n"
            f"Regards,\nGST Compliance Team"
        ),
        "status": case.status if case.status in ["DRAFT", "APPROVED", "SENT"] else "DRAFT",
    }

    return {
        "case_id": str(case.id),
        "run_id": str(case.run_id),
        "counterparty": counterparty,
        "gstin": inv.gstin if inv else None,
        "amount": amount,
        "issue": top_issue,
        "risk_score": case.risk_score,
        "risk_tier": _risk_tier_label(case.risk_score),
        "status": case.status,
        "risk_factors": risk_factors,
        "action_preview": action_preview,
        "invoice_no": inv.invoice_no if inv else None,
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "agent_events": [
            {
                "agent_name": e.agent_name,
                "step": e.step,
                "reasoning": e.reasoning,
                "timestamp": e.timestamp.isoformat(),
            }
            for e in agent_events
        ],
        "evidence_log": [
            {
                "text": l.submitted_text,
                "timestamp": l.submitted_at.isoformat(),
                "diff": l.resulting_diff,
            }
            for l in evidence_log
        ],
    }


@router.post("/{case_id}/new-evidence", dependencies=[Depends(get_current_user), Depends(evidence_rate_limit)])
async def submit_evidence(case_id: str, data: EvidenceRequest, db: AsyncSession = Depends(get_db)):
    case = await db.get(Case, uuid.UUID(case_id))
    if not case:
        raise HTTPException(status_code=404)

    old_risk = case.risk_score
    old_action = case.current_action

    from app.agents.adaptation_agent import AdaptationAgent
    agent = AdaptationAgent()
    result = await agent.run(
        case.run_id,
        case.id,
        old_case={"risk_score": old_risk, "action": old_action},
        evidence_text=data.text
    )

    case.risk_score = result.new_risk
    case.current_action = result.new_action

    evidence = EvidenceLog(
        case_id=case.id,
        submitted_text=data.text,
        resulting_diff=result.model_dump() if hasattr(result, "model_dump") else {}
    )
    db.add(evidence)
    await db.commit()

    from app.core.rate_limit import redis_client
    if redis_client:
        await redis_client.delete(f"summary:{str(case.run_id)}")

    return {
        "previous_risk": old_risk,
        "new_risk": result.new_risk,
        "new_risk_tier": _risk_tier_label(result.new_risk),
        "previous_action": old_action,
        "new_action": result.new_action,
        "explanation": result.explanation if hasattr(result, "explanation") else ""
    }


@router.post("/{case_id}/approve-action", dependencies=[Depends(get_current_user)])
async def approve_action(case_id: str, db: AsyncSession = Depends(get_db)):
    case = await db.get(Case, uuid.UUID(case_id))
    if not case:
        raise HTTPException(status_code=404)
    case.status = "APPROVED"
    await db.commit()
    return {"status": "APPROVED", "case_id": case_id}


@router.post("/{case_id}/verdict", dependencies=[Depends(get_current_user)])
async def submit_verdict(case_id: str, data: VerdictRequest, db: AsyncSession = Depends(get_db)):
    case = await db.get(Case, uuid.UUID(case_id))
    if not case:
        raise HTTPException(status_code=404)
    case.human_verdict = data.verdict
    await db.commit()
    return {"status": "ok"}

import uuid
import os
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Run, Transaction, Invoice
from app.core.security import get_current_user
from app.core.rate_limit import upload_rate_limit
from app.ingestion.csv_parser import parse_bank_csv
from app.ingestion.pdf_extractor import parse_invoice_pdfs
from app.services.audit_workflow import run_full_audit

router = APIRouter(prefix="/api", tags=["upload"])

@router.post("/upload", dependencies=[Depends(get_current_user), Depends(upload_rate_limit)])
async def upload_files(
    bank_csv: UploadFile = File(...),
    purchase_invoices: List[UploadFile] = File(default=[]),
    sale_invoices: List[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db)
):
    if not bank_csv.filename.endswith(".csv"):
        raise HTTPException(status_code=422, detail="bank_csv must be a CSV file")
        
    csv_content = await bank_csv.read()
    if len(csv_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
        
    txs, csv_errs = parse_bank_csv(csv_content)
    
    pdf_contents = []
    for pdf in purchase_invoices:
        if not pdf.filename.endswith(".pdf"):
            continue
        content = await pdf.read()
        if len(content) <= 10 * 1024 * 1024:
            pdf_contents.append((pdf.filename, content))
            
    errors = csv_errs
    
    run = Run(
        business_name="Uploaded Run",
        status="pending",
        ingestion_errors=errors if errors else None
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    
    for tx in txs:
        db_tx = Transaction(run_id=run.id, **tx.model_dump())
        db.add(db_tx)
        
    # Save PDFs to a temporary directory for the background task
    if pdf_contents:
        run_dir = os.path.join("/tmp", f"run_{run.id}")
        os.makedirs(run_dir, exist_ok=True)
        for filename, content in pdf_contents:
            with open(os.path.join(run_dir, filename), "wb") as f:
                f.write(content)
                
    await db.commit()
    
    return {"run_id": str(run.id), "status": run.status}


@router.post("/audit/run/{run_id}", dependencies=[Depends(get_current_user)])
async def run_audit(run_id: str, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    run = await db.get(Run, uuid.UUID(run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    if run.status in ["processing", "completed", "completed_with_errors"]:
        return {"status": "processing"}
        
    run.status = "processing"
    await db.commit()
    
    background_tasks.add_task(run_full_audit, run_id)
    return {"status": "processing"}

from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional

class ExtractedTransaction(BaseModel):
    date: date
    amount: Decimal
    counterparty: str
    source: str
    raw_ref: Optional[str] = None

class ExtractedInvoice(BaseModel):
    type: str # 'purchase' | 'sale'
    invoice_no: str
    gstin: Optional[str] = None
    hsn_code: Optional[str] = None
    cgst: Decimal
    sgst: Decimal
    igst: Decimal
    total: Decimal
    supplier_name: str
    raw_ref: Optional[str] = None

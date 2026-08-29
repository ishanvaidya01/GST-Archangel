from app.reconciliation.risk_engine import compute_risk
from app.db.models import Transaction, Invoice, SupplierHistory
from decimal import Decimal
import uuid
from datetime import date

def test_missing_invoice_risk():
    tx = Transaction(id=uuid.uuid4(), run_id=uuid.uuid4(), date=date.today(), amount=Decimal("1000"), counterparty="Test", source="bank")
    facts = {"transaction": tx, "invoice": None, "supplier_history": None}
    risk = compute_risk(facts)
    assert risk["score"] >= 25
    assert any(b["rule"] == "Missing Invoice" for b in risk["breakdown"])

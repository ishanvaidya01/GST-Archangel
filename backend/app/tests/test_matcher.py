from decimal import Decimal
from datetime import date
from app.reconciliation.matcher import amount_within_tolerance, fuzzy_supplier_match

def test_amount_within_tolerance():
    assert amount_within_tolerance(Decimal("100.00"), Decimal("100.50"), Decimal("0.01")) == True
    assert amount_within_tolerance(Decimal("100.00"), Decimal("102.00"), Decimal("0.01")) == False

def test_fuzzy_supplier_match():
    assert fuzzy_supplier_match("Google Cloud", "Google Cloud Platform") > 70
    assert fuzzy_supplier_match("Amazon", "Microsoft") < 50

from decimal import Decimal
from typing import Dict, Any, List

def compute_risk(case_facts: Dict[str, Any]) -> Dict[str, Any]:
    score = 0
    breakdown = []
    
    t = case_facts.get("transaction")
    i = case_facts.get("invoice")
    sh = case_facts.get("supplier_history")
    
    if t and not i:
        score += 25
        breakdown.append({"rule": "Missing Invoice", "points": 25})
    
    if i and not t:
        score += 15
        breakdown.append({"rule": "Unmatched Invoice", "points": 15})
        
    if t and i:
        if abs(t.amount - i.total) > max(t.amount, i.total) * Decimal("0.01"):
            score += 20
            breakdown.append({"rule": "Large Amount Mismatch", "points": 20})
            
        computed_tax = i.cgst + i.sgst + i.igst
        expected_tax = i.total - (i.total / Decimal("1.18"))
        if abs(computed_tax - expected_tax) > max(computed_tax, expected_tax) * Decimal("0.1"):
            score += 15
            breakdown.append({"rule": "GST Inconsistency", "points": 15})
            
        if i.hsn_code and not str(i.hsn_code).isdigit():
            score += 15
            breakdown.append({"rule": "Invalid HSN Code Format", "points": 15})
            
    if sh and sh.prior_mismatch_count > 0:
        score += 15
        breakdown.append({"rule": "Supplier Has Prior Mismatches", "points": 15})
        
    if score > 100:
        score = 100
        
    return {"score": score, "breakdown": breakdown}

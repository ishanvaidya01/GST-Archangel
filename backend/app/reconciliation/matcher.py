from decimal import Decimal
from datetime import date, timedelta
from rapidfuzz import fuzz
from typing import List, Dict, Any, Tuple
from app.db.models import Transaction, Invoice
from app.core.config import settings

def fuzzy_supplier_match(sup1: str, sup2: str) -> int:
    return int(fuzz.token_sort_ratio(sup1.lower(), sup2.lower()))

def amount_within_tolerance(amt1: Decimal, amt2: Decimal, tolerance_pct: Decimal = Decimal("0.01")) -> bool:
    diff = abs(amt1 - amt2)
    max_diff = max(amt1, amt2) * tolerance_pct
    return diff <= max_diff

def date_within_window(date1: date, date2: date, window_days: int = 5) -> bool:
    return abs((date1 - date2).days) <= window_days

def match_transaction_to_invoices(transactions: List[Transaction], invoices: List[Invoice]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    threshold = settings.MATCH_CONFIDENCE_THRESHOLD
    matched_cases = []
    unmatched_transactions = []
    
    used_invoices = set()
    
    for t in transactions:
        best_match = None
        best_score = 0
        
        for i in invoices:
            if i.id in used_invoices:
                continue
                
            supplier_score = fuzzy_supplier_match(t.counterparty, i.supplier_name)
            
            score = supplier_score * 0.5
            if amount_within_tolerance(t.amount, i.total):
                score += 30
            elif amount_within_tolerance(t.amount, i.total, Decimal("0.05")):
                score += 10
                
            score += 20 
            
            if score > best_score:
                best_score = score
                best_match = i
                
        if best_score >= threshold and best_match:
            matched_cases.append({"transaction": t, "invoice": best_match, "match_score": best_score})
            used_invoices.add(best_match.id)
        else:
            unmatched_transactions.append({"transaction": t, "invoice": None, "match_score": best_score})
            
    unmatched_invoices = [{"transaction": None, "invoice": i, "match_score": 0} for i in invoices if i.id not in used_invoices]
    
    return matched_cases, unmatched_transactions + unmatched_invoices

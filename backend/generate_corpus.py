import os

corpus_dir = "d:/Projects/CODEYGEN/backend/app/rag/rules_corpus"
os.makedirs(corpus_dir, exist_ok=True)

rules = [
    ("itc_eligibility.md", "# ITC Eligibility\nInput Tax Credit (ITC) can only be claimed if you have the tax invoice, received the goods/services, and the supplier has paid the tax to the government.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("time_limit_itc.md", "# Time Limit for ITC\nITC must be claimed by the 30th of November of the next financial year or the date of filing the annual return, whichever is earlier.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("cgst_sgst_applicability.md", "# CGST/SGST Applicability\nCGST and SGST apply to intra-state supplies (supplier and place of supply are in the same state). They are split equally.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("igst_applicability.md", "# IGST Applicability\nIGST applies to inter-state supplies (supplier and place of supply are in different states) and imports.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("hsn_code_structure.md", "# HSN Code Structure\nHSN codes must be 4, 6, or 8 digits. 4 digits are mandatory for B2B supplies for taxpayers with turnover up to Rs 5 crores.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("hsn_mismatch.md", "# HSN Mismatch Causes\nA mismatch in HSN codes often occurs when suppliers use a different classification than the buyer. It must be resolved if it affects the tax rate.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("invoice_matching.md", "# Invoice Matching\nBuyers can only claim ITC on invoices that have been successfully uploaded by the supplier in their GSTR-1 and appear in the buyer's GSTR-2B.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("duplicate_invoices.md", "# Duplicate Invoices\nClaiming ITC on the same invoice multiple times is strictly prohibited and can lead to penalties.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("tax_rate_mismatch.md", "# Tax Rate Mismatch\nIf the supplier charged 18% but the item should be 12%, the buyer can only claim the legally applicable 12% ITC or request a credit note.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("missing_invoice.md", "# Missing Invoices\nIf an invoice is missing from GSTR-2B, the buyer should follow up with the supplier to file it in their next return before claiming ITC.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("reverse_charge.md", "# Reverse Charge Mechanism (RCM)\nUnder RCM, the recipient of the goods/services is liable to pay GST instead of the supplier (e.g., GTA services).\nNote: illustrative summary, not a substitute for official GST rules."),
    ("blocked_credit.md", "# Blocked Credit (Section 17(5))\nITC is blocked on items like motor vehicles (with exceptions), food and beverages, club memberships, and goods lost or stolen.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("credit_note.md", "# Credit Notes\nA supplier issues a credit note to reduce the tax liability of an earlier invoice. The buyer must reverse the corresponding ITC.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("debit_note.md", "# Debit Notes\nA debit note is issued to increase the tax liability. The buyer can claim additional ITC based on this document.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("e_invoicing.md", "# E-invoicing Requirements\nE-invoicing (generating IRN) is mandatory for B2B transactions for taxpayers exceeding the notified turnover threshold.\nNote: illustrative summary, not a substitute for official GST rules."),
    ("place_of_supply.md", "# Place of Supply\nThe place of supply determines whether the transaction is intra-state (CGST+SGST) or inter-state (IGST).\nNote: illustrative summary, not a substitute for official GST rules."),
]

for filename, content in rules:
    with open(os.path.join(corpus_dir, filename), "w") as f:
        f.write(content)

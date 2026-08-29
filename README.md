<div align="center">

# GST ARCHANGEL
**AI Powered. Finance Perfected. GST Compliant.**

*An AI accountant that finds GST problems, decides what to do, takes action, and adapts.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Docker Support](https://img.shields.io/badge/docker-ready-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100-teal)](#)

</div>

---

## THE PROBLEM
**GST Compliance Has a Data Problem and an Action Problem.**

Disconnected sources of financial data (Bank Statements, Purchase Invoices, Sales Invoices, GST Records like 2B/3B) lead to significant compliance gaps:
- Missing legitimate Input Tax Credit (ITC)
- Invoice mismatches and missing invoices
- GSTIN, HSN, or rate inconsistencies
- Excessive manual reconciliation work
- Difficulty in spotting which risks matter most

**The real problem isn't just finding errors — it's that workflows stop after detection.** Rule-based software flags issues, but human work starts exactly where detection ends. 

---

## OUR SOLUTION
**GST ARCHANGEL** goes further: Detect -> Understand -> Investigate -> Decide -> Act -> Adapt

It is an autonomous, multi-agent GST compliance system that reconciles financial data, identifies and investigates discrepancies, assesses ITC risk, and recommends actionable resolutions. It doesn't just detect discrepancies — it understands them and moves toward resolution.

> "Detection is not the end. It is the beginning of action."

---

## THE AGENTIC BRAIN
Archangel operates on **7 Specialized Agents + 1 Adaptive Loop**:

```mermaid
graph TD
    A[PERCEIVE <br/> @DataExtractorAgent] --> B[THINK <br/> @TaxNormParserAgent]
    B --> C[RECONCILE <br/> @ReconciliationAgent]
    C --> D[INVESTIGATE <br/> @InvestigationAgent]
    D --> E[ANALYZE RISK <br/> @RiskScoringAgent]
    E --> F[DECIDE <br/> @DecisionAgent]
    F --> G[ACT <br/> @ActionDraftAgent]
    
    H[ADAPTIVE LOOP] -.-> C
    H -.-> B
```

1. **PERCEIVE (@DataExtractorAgent):** OCR and extraction from bank and invoice documents.
2. **THINK (@TaxNormParserAgent):** Validates GSTIN, HSN codes, and tax rates.
3. **RECONCILE (@ReconciliationAgent):** 3-way match between bank, invoices, and GST records.
4. **INVESTIGATE (@InvestigationAgent):** Examines supplier history and compliance signals.
5. **ANALYZE RISK (@RiskScoringAgent):** Explainable risk scoring and ITC exposure quantification.
6. **DECIDE (@DecisionAgent):** Chooses the next action (request, reverse, escalate).
7. **ACT (@ActionDraftAgent):** Drafts the recommended communication for human review.
8. **ADAPT (Adaptive Loop):** Reassesses when new evidence arrives without manual restart.

---

## SYSTEM ARCHITECTURE

```mermaid
flowchart TD
    subgraph Inputs
    B[Bank Statements]
    P[Purchase Invoices]
    S[Sales Invoices]
    G[GST Records]
    end

    subgraph Intelligence Layer
    EX[Extraction] --> TN[Tax Norm Validation]
    TN --> REC[Reconciliation]
    REC --> INV[Investigation]
    INV --> RSK[Risk Analysis]
    RSK --> DEC[Decision Engine]
    DEC --> ACT[Action Generation]
    end

    subgraph Outputs
    O1[Risk Score & ITC Exposure]
    O2[Compliance Cases]
    O3[Recommended Actions]
    O4[Action Drafts]
    O5[Audit Trace]
    end

    B & P & S & G --> EX
    ACT --> O1 & O2 & O3 & O4 & O5
```

---

## BENEFITS & IMPACT

**For Accountants:**
- Less manual reconciliation
- Faster discrepancy identification
- Explainable audit trails

**For Businesses:**
- Reduce potential ITC leakage
- Earlier risk identification
- Better compliance visibility

**For Compliance Teams:**
- Centralized case management
- Risk-based prioritization
- Action-ready recommendations

---

## TECHNOLOGY STACK

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons  
**Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL (pgvector), Redis  
**AI / Agent Layer:** Specialized autonomous agents for extraction, reconciliation, risk, and decisioning (powered by local Donut models)  
**Data Layer:** Financial documents (PDF, CSV) and structured transaction data  

---

## KEY FEATURES
- **Automated Document Ingestion:** Upload bulk Bank Statements and Purchase Invoices.
- **Intelligent OCR:** Extracts highly accurate structured data from messy PDFs using state-of-the-art vision models.
- **RAG for Tax Law Validation:** A built-in Retrieval-Augmented Generation (RAG) system checks cases against the latest official GST rules corpus.
- **Explainable Risk AI:** Every case flagged includes a clear breakdown of the reasoning behind the risk score.
- **Real-Time Agentic Workflow:** Live WebSockets stream updates to the frontend dashboard, offering real-time visibility into the multi-agent pipeline as it processes your data.
- **Action-Ready Output:** Automatically generates draft notices and replies for compliance officers to review.

---

## GETTING STARTED

The entire platform is containerized for a one-click local deployment.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ishanvaidya01/GST-Archangel.git
   cd GST-Archangel
   ```

2. **Start the platform via Docker:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend Dashboard: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`

---

## FUTURE SCOPE
- Real-time integrations with government GST portals
- Automated supplier response loops
- Continuous compliance monitoring
- Production-grade accounting integrations

<div align="center">
  <br/>
  <strong>Find. Understand. Decide. Act. Adapt.</strong>
</div>

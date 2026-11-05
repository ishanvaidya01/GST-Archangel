<div align="center">

# GST Archangel

**GST reconciliation, risk triage, and human-in-the-loop action drafting for finance teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/github/actions/workflow/status/ishanvaidya01/GST-Archangel/test.yml?branch=master&label=tests)](https://github.com/ishanvaidya01/GST-Archangel/actions/workflows/test.yml)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Data-PostgreSQL%20%2B%20pgvector-4169E1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Redis](https://img.shields.io/badge/Cache-Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker Compose](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

</div>

---

## Overview

GST compliance work usually starts after a discrepancy has already been detected. Finance teams still have to reconcile bank transactions against purchase invoices, judge whether input tax credit (ITC) is exposed, decide what to do, and draft the follow-up. GST Archangel is a prototype that connects those steps in one workflow:

- ingest a bank statement CSV and purchase invoice PDFs;
- fuzzy-match transactions to invoices;
- score GST and ITC risk with configurable rules;
- create reviewable cases with an agent workflow;
- stream progress to a Next.js dashboard;
- let a human submit new evidence, re-score the case, and approve a drafted action.

The project is a working prototype, not a production compliance product. See [Project status and limitations](#project-status-and-limitations) before evaluating or deploying it.

## Key features

- **Bank statement ingestion** — CSV upload with column detection for `Date`, `Amount`, `Counterparty`, and `Reference` (with positional fallback).
- **Purchase invoice ingestion** — PDF upload, text/rule-based extraction, and an optional Donut vision-model fallback for scanned documents.
- **Fuzzy reconciliation** — supplier-name similarity (RapidFuzz), amount tolerance, and a configurable date window.
- **Explainable risk scoring** — rule-based signals such as missing invoice, unmatched invoice, amount mismatch, GST inconsistency, invalid HSN, and prior supplier mismatches. Scores and weights are configurable.
- **Case workflow** — per-run case lists, case detail, investigation/rules/decision/action agents, and a human approval step.
- **Adaptive re-evaluation** — submitting new evidence invokes the adaptation agent and updates the case risk score and recommended action.
- **Live progress** — WebSocket events at `/ws/audit/{run_id}` feed the processing dashboard.
- **Operational views** — run summary, LLM-call observability, and a human-verdict precision endpoint.
- **Container-first setup** — PostgreSQL with pgvector, Redis, FastAPI, and Next.js run together through Docker Compose.

## Architecture

```mermaid
flowchart LR
    subgraph Client["Next.js dashboard"]
        UI[Upload, run dashboard, case detail]
    end

    subgraph Backend["FastAPI backend"]
        API[REST API + WebSocket]
        AUTH[Auth and rate limiting]
        WF[Audit workflow]
        MATCH[Fuzzy matcher]
        RISK[Risk engine]
        AGENTS[Agent orchestrator]
    end

    DB[(PostgreSQL + pgvector)]
    CACHE[(Redis)]
    CSV[Bank statement CSV]
    PDF[Purchase invoice PDFs]

    UI --> API
    CSV --> API
    PDF --> API
    API --> WF
    WF --> MATCH
    MATCH --> RISK
    RISK --> AGENTS
    API --> AUTH
    AUTH --> DB
    AUTH --> CACHE
    WF --> DB
    API --> DB
    API -. live events .-> UI
```

### Audit pipeline

1. `POST /api/upload` parses the bank CSV, stores transactions, and saves uploaded purchase PDFs to a per-run directory.
2. `POST /api/audit/run/{run_id}` starts `run_full_audit` as a FastAPI background task.
3. Invoice PDFs are extracted and persisted; transactions and invoices are matched.
4. `compute_risk` attaches rule-based risk factors to every matched or unmatched case.
5. The orchestrator runs investigation and GST-rules agents in parallel, then decision and action agents.
6. Case status, risk score, evidence log, and actions are exposed through the case endpoints; the dashboard receives live events over WebSocket.

## Tech stack

| Layer | Technology | Role in this project |
| :--- | :--- | :--- |
| Frontend | Next.js 16.3.3, React 19.2.8, TypeScript | App-router dashboard, upload flow, case views |
| UI | Tailwind CSS 4, Radix UI, Framer Motion, Recharts | Styling, dialogs, motion, charts |
| Backend | FastAPI, Uvicorn, TanStack Query | REST API, background tasks, WebSocket endpoint, client queries |
| Persistence | SQLAlchemy 2 (async), asyncpg, Alembic | ORM, migrations, PostgreSQL access |
| Data | PostgreSQL + pgvector, Redis | Relational/vector storage, rate limits, summary cache |
| Extraction | pdfplumber, PyMuPDF, pypdfium2, pandas, RapidFuzz | PDF/CSV parsing and supplier-name matching |
| Optional ML | PyTorch, Transformers, Donut | Vision fallback for scanned invoices; optional fine-tuning |
| Infrastructure | Docker Compose, GitHub Actions | Local stack and CI test workflow |

## Project structure

```text
GST_ARCHANGEL/
├── backend/
│   ├── app/
│   │   ├── agents/           # Investigation, rules, decision, action, adaptation
│   │   ├── api/              # Auth, upload, cases, config, ML, observability, WS
│   │   ├── core/             # Settings, security, rate limiting, events, LLM client
│   │   ├── db/               # Models, session factory, seed data
│   │   ├── ingestion/        # CSV parser and PDF extractor
│   │   ├── rag/              # GST rules corpus and retriever
│   │   ├── reconciliation/   # Matcher and risk engine
│   │   ├── services/         # Audit workflow and ML inference
│   │   └── tests/            # Pytest suite
│   ├── alembic/              # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend main/src/        # App router, components, hooks, API and WS clients
├── ml_pipeline/              # Optional Donut training entry point
├── docker-compose.yml
├── Makefile
└── .github/workflows/test.yml
```

The frontend directory name contains a space. Quote it in shell commands: `cd "frontend main"`.

## Prerequisites

- **Docker path:** Docker Desktop with Compose v2.
- **Local path:** Python 3.11, Node.js 20+, PostgreSQL with the `vector` extension, and Redis.
- **Optional ML training:** a CUDA-capable GPU is strongly recommended for Donut fine-tuning.

## Getting started with Docker

```bash
git clone https://github.com/ishanvaidya01/GST-Archangel.git
cd GST-Archangel
docker compose up --build
```

Frontend: http://localhost:3000 · Backend: http://localhost:8000 · API docs: http://localhost:8000/docs · Redis: `localhost:6379`.

The backend container runs `alembic upgrade head`, seeds demo data, then starts Uvicorn. The Compose file uses development credentials and a demo JWT secret; replace them before any shared deployment.

Make targets: `make up`, `make logs`, `make seed`, `make test`, and `make down` (stops services and deletes the database volume).

## Local development

Start PostgreSQL and Redis first, for example with `docker compose up -d db redis`. Then run the backend:

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env with your local connection strings and a strong JWT secret
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

On Windows, `copy .env.example .env` replaces `cp`. The Dockerfile installs CPU-only PyTorch wheels explicitly; a plain `pip install -r requirements.txt` may download a much larger default build. If you do not need the optional vision fallback, you can remove `torch`, `torchvision`, `transformers`, and `accelerate` from your local environment.

Run the frontend in a second terminal:

```bash
cd "frontend main"
npm install
npm run dev
```

Create `frontend main/.env.local` when the API is not on the default port:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000
```

The frontend dev server runs at http://localhost:3000.

## Environment variables

The backend reads settings through `pydantic-settings` (`backend/app/core/config.py`). A root `.env.example` documents the main options; for local runs, place the file at `backend/.env`.

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | — | Async SQLAlchemy URL, e.g. `postgresql+asyncpg://user:password@localhost:5432/gst_archangel` |
| `REDIS_URL` | Yes | — | Redis URL, e.g. `redis://localhost:6379/0` |
| `JWT_SECRET` | Yes | — | HS256 signing secret; must be changed when `ENV=production` |
| `ENV` | No | `development` | Set to `production` to enable HSTS and stricter secret validation |
| `DEMO_MODE` | No | `false` | Demo-mode flag exposed to the app |
| `DEFAULT_BUSINESS_NAME` | No | `Business` | Business name attached to new runs |
| `MATCH_CONFIDENCE_THRESHOLD` | No | `80` | Minimum fuzzy-match score for a match |
| `MATCH_AMOUNT_TOLERANCE_PCT` | No | `0.01` | Tight amount tolerance (1%) |
| `MATCH_AMOUNT_TOLERANCE_PCT_WIDE` | No | `0.05` | Wide amount tolerance (5%) |
| `MATCH_DATE_WINDOW_DAYS` | No | `5` | Maximum invoice/transaction date gap |
| `RISK_GST_RATE` | No | `0.18` | GST rate used by the risk engine |
| `RISK_TAX_TOLERANCE` | No | `0.10` | Allowed relative tax inconsistency |
| `RISK_AMOUNT_MISMATCH_TOL` | No | `0.01` | Amount-mismatch tolerance |
| `RISK_*_POINTS` | No | see `config.py` | Points assigned to missing invoice, mismatch, HSN, and prior-history rules |
| `GST_MODELS_DIR` | No | `<repo>/models` | Optional Donut checkpoint directory |
| `GST_DATASETS_DIR` | No | `datasets` | Dataset directory used by training code |
| `GST_RUN_DIR` | No | `/tmp/run_<run_id>` | Temporary directory for uploaded invoice PDFs |
| `NEXT_PUBLIC_API_BASE_URL` | No | `http://localhost:8000` | Frontend API base URL |
| `NEXT_PUBLIC_WS_BASE_URL` | No | `ws://localhost:8000` | Frontend WebSocket base URL |

Never commit a real `.env` file or production secrets.

## Usage

1. Open http://localhost:3000 and register or sign in.
2. Upload a bank CSV and purchase invoice PDFs. The CSV parser accepts headers `Date`, `Amount`, `Counterparty`, and `Reference`; without headers it uses the first three columns positionally. Extraction tries deterministic OCR/rules first, then the optional Donut model.
3. Start the audit for the returned run ID. The processing page consumes live WebSocket events.
4. Review the run summary and case list. Open a case to inspect risk factors, agent steps, and the draft action.
5. Submit new evidence to trigger re-evaluation, then approve the action or record a human verdict.

Example CSV (see the format accepted by `parse_bank_csv`):

```csv
Date,Amount,Counterparty,Reference
2026-04-01,1180.00,Apollo HealthCare,UPI-8821
2026-04-02,5000.00,Fast Logistics Ltd,NEFT-4410
```

Start an audit from the API with `curl -X POST http://localhost:8000/api/audit/run/<run_id>`.

### API authentication note

The routes declare authentication dependencies, but the current security module returns a fixed mock user from `get_current_user`. Bearer-token validation is therefore **not enforced** in this prototype. Do not treat the current API as authenticated.

## API reference

Interactive documentation is available at `/docs` (Swagger UI) and `/redoc`. The table below is derived from the routers in `backend/app/api/`; paths and methods are exact.

| Method | Endpoint | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check with database/Redis flags | Public |
| `POST` | `/api/auth/register` | Create a user and return an access token | Public |
| `POST` | `/api/auth/login` | Authenticate and return an access token; rate-limited | Public |
| `GET` | `/api/auth/me` | Return the current user | Declared auth (mock user) |
| `POST` | `/api/upload` | Upload bank CSV and invoice PDFs; creates a run | Declared auth (mock user) |
| `POST` | `/api/audit/run/{run_id}` | Start the audit workflow for a run | Declared auth (mock user) |
| `GET` | `/api/audit/{run_id}/summary` | Run summary, cached in Redis | Declared auth (mock user) |
| `GET` | `/api/cases/all/list` | List cases across all runs | Public |
| `GET` | `/api/cases/{run_id}` | List cases for one run | Public |
| `GET` | `/api/cases/detail/{case_id}` | Full case detail, risk factors, draft action, evidence | Public |
| `POST` | `/api/cases/{case_id}/new-evidence` | Submit evidence and re-score via the adaptation agent | Declared auth (mock user) |
| `POST` | `/api/cases/{case_id}/approve-action` | Mark the case action as approved | Declared auth (mock user) |
| `POST` | `/api/cases/{case_id}/verdict` | Record a human verdict | Declared auth (mock user) |
| `GET` | `/api/config/match-threshold` | Read the active match threshold | Declared auth (mock user) |
| `PUT` | `/api/config/match-threshold` | Update the in-memory match threshold | Declared auth (mock user) |
| `GET` | `/api/observability/llm-calls?run_id=` | Paginated LLM-call log | Declared auth (mock user) |
| `GET` | `/api/observability/summary?run_id=` | Call count, latency, estimated cost | Declared auth (mock user) |
| `GET` | `/api/observability/precision?run_id=` | Agreement between human verdict and action | Declared auth (mock user) |
| `POST` | `/api/v1/ml/extract-invoice` | Extract fields from a PDF, PNG, or JPEG invoice | Public |
| `WS` | `/ws/audit/{run_id}` | Live audit events for a run | Public |

Example invoice extraction:

```bash
curl -X POST http://localhost:8000/api/v1/ml/extract-invoice \
  -F "file=@sample-invoice.pdf"
```

## ML extraction and training

The runtime extraction path in `backend/app/services/ml_inference.py` is:

1. deterministic OCR plus field rules (`ml_pipeline.extract_rules`), which is the primary path;
2. an optional Donut vision-language fallback for scanned or image-heavy invoices;
3. GSTIN, HSN, and tax-consistency validation on extracted fields.

The Donut path loads `models/donut_gst_finetuned_final` when present, otherwise `naver-clova-ix/donut-base`. Optional training entry point: `python ml_pipeline/train_donut.py`. It requires a GPU for practical runtimes, an invoice dataset, and helper modules that are **not all committed to this repository**. No accuracy or benchmark claims are published for the extraction or risk models; treat the ML pipeline as experimental and validate outputs against your own documents.

## Testing

The test suite lives in `backend/app/tests` (API auth, matcher, risk engine). It requires PostgreSQL with pgvector and Redis.

```bash
cd backend
pytest app/tests -v
```

Inside the Docker stack:

```bash
make test
# equivalent:
docker compose exec -T backend pytest app/tests -v
```

CI runs the same tests in `.github/workflows/test.yml` with a `pgvector/pgvector:pg16` service, Redis, and `alembic upgrade head`. The workflow sets `PYTHONPATH`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, and `DEMO_MODE`.

The frontend exposes `npm run lint` (ESLint); no frontend test runner is configured.

## Deployment notes

- Both applications have multi-stage Dockerfiles. The frontend uses Next.js `output: "standalone"`.
- The backend image includes a health check against `/api/health`.
- Compose is suitable for local or demo use. It publishes development credentials and a placeholder JWT secret, so it is not a production deployment template.
- For production, set `ENV=production`, provide a strong `JWT_SECRET`, terminate TLS in front of the API, restrict CORS (currently `localhost:3000` and `localhost:5173`), and run database migrations before starting the app.
- No Kubernetes, cloud, or reverse-proxy configuration is included in this repository.

## Project status and limitations

This is an actively developed prototype. The following gaps are visible in the current code and should be understood before relying on results:

- **Authentication is stubbed.** `get_current_user` returns a fixed mock user, so declared auth dependencies do not validate tokens.
- **The LLM layer is mocked.** `complete_structured` returns default structured objects after a simulated delay; it does not call an external model.
- **Some runtime modules are untracked.** In the current working tree, files such as `backend/app/services/risk_scorer.py` and parts of `ml_pipeline/` exist locally but are not committed. A clean clone may fail at import time until they are added.
- **Agent events are not persisted.** Live events are broadcast over Redis/WebSocket, but no code writes `AgentEvent` rows; the case-detail `agent_events` list can therefore be empty.
- **RAG retrieval uses placeholder embeddings.** `get_embedding` returns a constant vector, so rule retrieval is not semantic yet.
- **Frontend/backend paths are not fully aligned.** The frontend client in `src/lib/api-client.ts` calls some evidence and approval paths that differ from the backend routers. Use `/docs` as the canonical API reference.
- **Sales invoices and GST portal records are not ingested.** Although the upload endpoint accepts a `sale_invoices` field, the workflow processes purchase invoice PDFs only.
- **No accuracy claims.** There is no committed evaluation dataset, benchmark, or model card for extraction, matching, or risk scoring.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, branch naming, Conventional Commits, and the pull-request checklist. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md). Do not open a public issue for a suspected secret or auth bypass.

## License

Released under the MIT License. See [LICENSE](LICENSE).

## Acknowledgements

Built with [FastAPI](https://fastapi.tiangolo.com/), [Next.js](https://nextjs.org/), and [pgvector](https://github.com/pgvector/pgvector). The optional extraction fallback uses [Naver Donut](https://github.com/clovaai/donut). The GST rules corpus in `backend/app/rag/rules_corpus` is illustrative material, not a substitute for official GST guidance.

Maintained by [Ishan Vaidya](https://github.com/ishanvaidya01). For questions, open a GitHub issue.

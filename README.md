# GST Archangel Backend

Autonomous GST compliance and reconciliation agent for small businesses.

## Architecture

This is a FastAPI backend leveraging async SQLAlchemy with Postgres (pgvector) for data persistence and RAG, and Redis for rate-limiting and Pub/Sub event broadcasting.

## What's Real vs Simulated vs Future

- **Real**: 
  - Full OAuth2/JWT auth.
  - Asynchronous Database architecture.
  - WebSocket event streaming.
  - Deterministic reconciliation engine.
  - Core API schema and integration with frontend.
- **Simulated (Demo Mode)**:
  - If `DEMO_MODE=true` is set, LLM calls are simulated with pre-configured delay to ensure demo stability on stage. RAG chunk embedding is also mocked.
- **Future**: 
  - Integration with actual LLM endpoints via httpx.
  - Complex OCR (like Document AI) for invoices instead of basic PDF extraction.

## Getting Started

1. `cp .env.example .env`
2. `make up`

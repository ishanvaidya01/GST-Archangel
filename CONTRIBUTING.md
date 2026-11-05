# Contributing to GST Archangel

Thanks for your interest in improving GST Archangel. This project is a prototype and contributions that improve correctness, test coverage, documentation, and safety are especially welcome.

## Before you start

- Read the [README](README.md), including the project-status and limitations section.
- Search existing issues and pull requests before opening a new one.
- For a substantial change, open an issue first so the approach can be discussed.
- Never commit real credentials, `.env` files, customer data, invoice PDFs, or model weights.

## Development setup

### Docker (recommended)

```bash
git clone https://github.com/ishanvaidya01/GST-Archangel.git
cd GST-Archangel
docker compose up --build
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd "frontend main"
npm install
npm run dev
```

The frontend directory name contains a space, so quote the path.

## Branch naming

Use a short, descriptive branch name:

- `feat/case-filtering`
- `fix/csv-date-parsing`
- `docs/api-reference`
- `test/risk-engine`
- `chore/dependency-cleanup`

Do not work directly on `master`.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <short description>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.

Examples:

```text
feat(api): add case status filter
fix(matcher): handle missing counterparty names
docs(readme): document local PostgreSQL setup
```

Keep commits focused. Avoid mixing formatting-only changes with behavior changes.

## Tests and checks

Run the backend suite before opening a pull request:

```bash
cd backend
pytest app/tests -v
```

The suite needs PostgreSQL with the `vector` extension and Redis. The CI workflow environment variables are a useful reference:

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/gst_archangel_test
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=testing-secret
DEMO_MODE=true
```

Run the frontend linter:

```bash
cd "frontend main"
npm run lint
```

If you change database models, add an Alembic migration and run `alembic upgrade head` before testing.

## Pull-request checklist

- [ ] The change is scoped to one problem and linked to an issue where applicable.
- [ ] Tests pass locally, and new behavior has test coverage where practical.
- [ ] `npm run lint` passes for frontend changes.
- [ ] Database changes include an Alembic migration.
- [ ] API changes are reflected in the README or OpenAPI-visible docstrings.
- [ ] No secrets, `.env` files, datasets, model weights, or generated artifacts are included.
- [ ] Documentation is updated when setup, commands, or behavior changes.
- [ ] The PR description explains what changed, why, and how it was verified.

## Code style

- Follow the existing Python formatting and import style; keep functions typed where the surrounding code is typed.
- Prefer configuration from `backend/app/core/config.py` over hard-coded thresholds.
- Keep frontend components consistent with the existing TypeScript and Tailwind patterns.
- Do not add a dependency unless it is needed and the reason is clear in the PR.

## Reporting bugs and security issues

Use the issue templates for bugs and feature requests. Report security vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

# Mbamager — Project State & Roadmap
*A living documentation of the Mbamager AI Financial Operating System for the Unbanked and Underbanked.*

---

## 1. Project Vision
Mbamager is designed as a secure, non-custodial **AI-powered Financial Operating System** tailored for the unbanked and underbanked population of Cameroon. By removing the barrier of traditional bank integrations, Mbamager empowers users to capture cash transactions, understand expenditure, protect against mobile money scams, and grow wealth through local informal mechanisms like Njangis.

---

## 2. Product Pitch
For millions of Cameroonians, Mobile Money (MTN MoMo, Orange Money) is their bank, yet they lack tools to analyze, secure, and plan their cash flow. Mbamager fills this gap by reading unstructured SMS confirmations, turning them into clean structured financial statements, alerting users to rampant fraud patterns, and acting as a bilingual financial advisor that respects local contexts.

---

## 3. Tagline
> **Understand it. Protect it. Grow it.**

---

## 4. Architecture Status
The technical architecture of Mbamager is **frozen** and follows a strictly decoupled **Clean Architecture**:

*   **Frontend:** React (SPA) + Tailwind CSS + Lucide Icons. Built with desktop precision and a responsive, warm mobile-first layout.
*   **Backend:** FastAPI (Python 3.12). Replaced the temporary Express node layer with Vite development static proxying to directly route API calls.
*   **Database:** PostgreSQL 16 (via Docker Compose, `postgresql+asyncpg://` async driver), mapped via SQLAlchemy 2.0 ORM.
*   **Migrations:** Alembic configured with auto-generation support, mapped models, and custom database URL properties.
*   **Cognitive Services:** Server-side Gemini API SDK (`@google/genai` or `google-genai` Python library) driving the AI Layer with isolated prompts.

---

## 5. Frozen Engineering Rules

1.  **AI Never Owns Money (Core Engineering Law):** Under no circumstances may AI compute, calculate, write, or modify financial ledger balances, budgets, nets, or transactions. All calculations must be performed by deterministic Python business services. The AI is restricted strictly to text parsing, scam risk classification, insight suggestions, translation, and coaching.
2.  **Financial Precision:** The `float` data type is banned for financial values. All money, transactions, fees, and balances must be stored and calculated using Python's `decimal.Decimal` class and PostgreSQL `Numeric(precision=18, scale=2)` configurations.
3.  **Two-Stage Parsing Pipeline:** The SMS transaction parsing system must always attempt fast, local, and free regular expression matches (Stage 1) from `app/constants/sms_patterns.py` first. It may only fallback to Gemini API parsing (Stage 2) if regex confidence is zero, minimizing API latency and preserving free-tier quotas.
4.  **Modular, Layered Responsibility:**
    *   **Routers:** Handle HTTP transport only; no calculations.
    *   **Services:** Implement deterministic business algorithms.
    *   **Repositories:** Execute database CRUD operations.
    *   **Models:** Define SQLAlchemy database tables only.
    *   **Schemas:** Handle validation using strict Pydantic configurations.
    *   **AI Layer:** Implement isolated cognitive services translating raw metrics to conversational guidance.

---

## 6. Current Sprint
*   **Active Sprint:** Sprint 3 — Domain Model Design (Completed)
*   **Goal:** Design and implement robust SQLAlchemy 2.0 domain models for User, FinancialProfile, Account, Transaction, and Budget with strict indexation, typing, decimal precision, and relationships.

---

## 7. Completed Tasks
*   [x] Created complete folder structure for backend (`backend/app/`) and frontend (`frontend/src/`).
*   [x] Initialized all package namespaces with `__init__.py` files and documentation headers.
*   [x] Built the application configuration engine (`core/config.py`) and bcrypt/JWT security utilities (`core/security.py`).
*   [x] Built the database integration files (`database/base.py` and `database/session.py`) mapped to Pydantic settings.
*   [x] Generated constants files containing payment providers, transaction categories, currency rules (FCFA), and Mobile Money regex patterns.
*   [x] Generated standard Python cognitive class blueprints for all 5 product tools: M-PARSE, SENTINEL, COMPASS, PULSE, and GUIDE.
*   [x] Isolated AI Prompt assets into standalone markdown files inside `app/prompts/` to ensure clear separation of concerns.
*   [x] Fully configured Alembic framework (`alembic.ini`, `env.py`, `script.py.mako`) for schema migrations.
*   [x] Integrated a Vite dev server proxy middleware inside `vite.config.ts` to mock fast `/health` and `/` REST responses directly during frontend preview testing.
*   [x] Deleted default template source directories to maintain pristine workspace hygiene.
*   [x] Designed a professional, responsive React landing dashboard centering a real-time health indicator, architectural descriptions, and an interactive Stage 1 regex sandbox playground.
*   [x] Designed and implemented five modular SQLAlchemy 2.0 models: `User`, `FinancialProfile`, `Account`, `Transaction`, and `Budget`.
*   [x] Explicitly imported and exported all SQLAlchemy models inside `app/models/__init__.py` and registered them inside Alembic `env.py` to ensure reliable migration auto-generations.

---

## 8. Pending Tasks

### Sprint 3 — JWT Authentication & Schemas
*   [ ] Build Pydantic validation schemas (`app/schemas/`) for user signup, logins, and transaction forms.
*   [ ] Build repositories (`app/repositories/`) to abstract database operations.
*   [ ] Implement authentication routers and registration endpoints utilizing bcrypt hashing.

### Sprint 4 — Transaction Ingestion & Ledger Services
*   [ ] Implement Stage 1 & Stage 2 SMS parser pipelines, mapping inputs to clean Transaction records.
*   [ ] Implement deterministic transaction services (calculating balances, daily category sums, and fee aggregations).
*   [ ] Integrate active database writes.

### Sprint 5 — Automated Coaching & Scam Alerts
*   [ ] Integrate prompt templates from `app/prompts/` with the Gemini SDK client.
*   [ ] Implement background scam monitoring (Scam Sentinel) with warnings surfaced inside response payloads.
*   [ ] Implement budget coaching feedback calculations.

---

## 9. Next Immediate Task
*   **Sprint 3 Part B:** Design and implement Pydantic schemas (`app/schemas/`) for User register/login payload validations and secure Transaction entry inputs.

---

## 10. Technical Decisions
*   **No Express dependency:** Removed Node Express server to keep FastAPI as the single source of truth for backend services, reducing project complexity.
*   **Single CSS File:** Preserved Tailwind v4 standard config (`@import "tailwindcss";` inside `index.css`) for high performance.
*   **PostgreSQL as Primary Store:** Runs via Docker Compose (`postgres:16-alpine`) with the async `asyncpg` driver for the app and sync `psycopg2-binary` for Alembic migrations. Superseded the earlier SQLite plan once Alembic and concurrent-write requirements made Postgres the better fit.

---

## 11. AI Services Overview

| Code Identifier | Product Name | Main Responsibility | Target Prompt Asset |
| :--- | :--- | :--- | :--- |
| **`sms_parser.py`** | **M-PARSE** | Text classification & transactional parameter extraction. | `sms_parser.md` |
| **`scam_analyzer.py`** | **SENTINEL** | Identifying social engineering, phishing, and fake cashout requests. | `scam_analyzer.md` |
| **`budget_coach.py`** | **COMPASS** | Contextual, localized expenditure advice based on deterministic metrics. | `budget_coach.md` |
| **`insight_generator.py`** | **PULSE** | Detecting recurring behavioral patterns and provider fee drains. | `insight_generator.md` |
| **`financial_assistant.py`** | **GUIDE** | Bilingual conversational learning helper (Njangis, security advice). | `financial_assistant.md` |

---

## 12. Folder Structure Status
The workspace directory is fully structured and frozen:

```
mbamager/
├── backend/
│   ├── alembic/              # Database migration version files
│   ├── app/
│   │   ├── ai/               # AI Cognitive services (M-PARSE, COMPASS, etc.)
│   │   ├── constants/        # static values (providers, categories, currencies)
│   │   ├── core/             # JWT, Bcrypt security, and global configuration
│   │   ├── database/         # Session managers and ORM Declarative Base
│   │   ├── logs/             # Logs directory
│   │   ├── models/           # SQLAlchemy Database tables
│   │   ├── prompts/          # System prompts for Gemini
│   │   ├── repositories/     # SQLAlchemy Database CRUD wrappers
│   │   ├── routers/          # FastAPI HTTP request handlers
│   │   ├── schemas/          # Pydantic request-response schemas
│   │   ├── services/         # Deterministic business logic services
│   │   └── main.py           # FastAPI entrypoint
│   ├── alembic.ini           # Alembic Configuration file
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Template environment configurations
│   └── .gitignore            # Git exclusions
├── docs/
│   ├── ARCHITECTURE.md       # Core engineering laws and precision directives
│   ├── PROJECT_STATE.md      # Active state (This file)
│   └── README.md             # Project quickstart
└── frontend/
    └── src/
        ├── App.tsx           # React view
        ├── index.css         # Styling styles
        └── main.tsx          # Client-side mounting
```

---

## 13. Known Limitations (Sprint 2)
*   **Simulated Backend Connection:** Frontend handles Stage 1 regex logic in an interactive playground mock interface during dev server runtime, as the active database write APIs are scheduled for Sprint 3/4.
*   **Placeholder Prompts:** Prompts in `app/prompts/` exist as markdown structural headers; full instruction matrices will be finalized in Sprint 5.

---

## 14. Future Versions (Post-MVP)
*   **Offline Voice Assistance:** Support voice transcripts in Cameroon Pidgin English and Camfranglais.
*   **Peer-to-Peer Syncing:** Mesh-network based synchronization for remote village transactions without cellular network coverages.

---

## 15. Changelog
*   **2026-06-30:** Removed Express and consolidated to Vite server mock endpoints for development runtime. Renamed `transaction_categories.py` to `categories.py`. Generated core safety architectures, security crypt engines, Alembic migration systems, and created `docs/PROJECT_STATE.md` to persist the roadmap across development turns.
*   **2026-07-26:** Corrected this document's database references from SQLite to PostgreSQL — the actual running database, per `core/config.py`, `docker-compose.yml`, and `requirements.txt`, has been Postgres (`asyncpg`/`psycopg2-binary`) all along; the SQLite references were stale. Also added the previously-missing `accounts` router, fixed the SMS-import frontend call to hit `/sms/import` instead of a nonexistent `/sms/parse`, and added a `GET /transactions/` list-all endpoint.

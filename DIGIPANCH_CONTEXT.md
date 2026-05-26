# DIGIPANCH — MASTER CONTEXT WINDOW
> Paste this at the start of every AI session. Keep it updated as phases complete.

---

## PROJECT IDENTITY

| Field | Value |
|---|---|
| Project name | DigiPanch |
| Type | Full-stack civic-tech e-governance platform |
| Purpose | Digitize Panchayat services — certificates, grievances, payments, AI assistant |
| Roles | User (citizen) · Officer · Admin |
| Dev stage | Phase 10 — RAG (active) |

---

## LOCKED TECH STACK

### Frontend — `apps/web` (already built, do not change)

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | App Router, SSR |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Styling |
| shadcn/ui | ^4.7.0 | Component library |
| Clerk | ^7.3.1 | Auth (identity provider) |
| Framer Motion | ^12.38.0 | Animations |
| Recharts | ^3.8.0 | Charts |
| Lucide React | ^1.14.0 | Icons |
| Radix UI | ^1.4.3 | Headless primitives |
| Boneyard | ^1.0.0 | Skeleton loading screens |

**Fonts:** DynaPuff (primary), Supermercado One, Inter

### Backend — `apps/api` (under active development)

| Tool | Version | Purpose |
|---|---|---|
| FastAPI | 0.116.1 | API framework |
| Uvicorn | 0.35.0 | ASGI server |
| SQLModel | 0.0.24 | ORM (wraps SQLAlchemy + Pydantic) |
| psycopg | 3.2.9 | PostgreSQL driver |
| pydantic-settings | 2.10.1 | Env var management |
| python-jose | 3.5.0 | JWT verification (Clerk tokens) |
| httpx | 0.28.1 | Async HTTP client |
| redis | 6.4.0 | Caching + rate limiting |
| python-dotenv | 1.1.1 | .env loading |
| razorpay | latest | Payment gateway SDK |

### Data Layer

| Service | Purpose |
|---|---|
| Supabase PostgreSQL | Primary relational database |
| Supabase pgvector | Vector embeddings for RAG |
| Redis (Upstash) | Cache, rate limiting, session |

### AI / ML

| Tool | Purpose |
|---|---|
| Google Gemini API | LLM — chatbot + RAG answers |
| LangChain | RAG chain orchestration |
| LangGraph | Agentic workflow routing |
| pgvector | Vector similarity search |

### External Services

| Service | Purpose |
|---|---|
| Clerk | Auth identity provider (frontend) |
| ImageKit | File/image/PDF storage |
| Razorpay | Payment gateway + webhooks |
| Resend / SMTP | Email notifications |
| WeasyPrint | Server-side PDF generation |

### Deployment

| Target | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render or Railway |
| Database | Supabase (hosted) |
| Cache | Upstash Redis |

---

## ARCHITECTURE PATTERN

**Modular Layered Monolith** (not microservices)

```
Next.js Frontend (Vercel)
        ↓  Authorization: Bearer <clerk_token>
FastAPI Backend (Render/Railway)
        ↓
  API Routes → Dependencies → Service Layer → Repository Layer
        ↓
  SQLModel ORM → Supabase PostgreSQL
        ↓
  Integrations: Clerk · Redis · ImageKit · Razorpay · Gemini · pgvector
```

---

## AUTH ARCHITECTURE (CRITICAL — DO NOT CHANGE)

**Clerk = Identity Provider. FastAPI = Resource Server.**

- Frontend handles all login/signup via Clerk
- Frontend sends `Authorization: Bearer <clerk_jwt>` on every request
- FastAPI verifies the Clerk JWT (using `python-jose` + Clerk public key)
- FastAPI syncs user to local DB on first request
- FastAPI enforces RBAC from local user role

**NEVER build:**
- Custom login/signup endpoints
- Password hashing
- Custom JWT issuance
- Refresh token logic

**Auth flow:**
```
User logs in (Clerk) → Frontend gets token → Sends to FastAPI
→ FastAPI verifies token → Syncs user to DB → Injects current_user → RBAC check
```

---

## CURRENT PROJECT STATE

### Frontend (already done — source of truth)

**Existing pages:**
- `/` — landing page (Navbar, Hero, Services, About, Latest, Footer)
- `/(protected)/dashboard` — dashboard UI (wired to fetch user data dynamically from backend)
- `/(protected)/profile` — Clerk user profile
- `/(protected)/chatbot` — chatbot UI (Gemini integrated)

**Recent UI Enhancements:**
- **Skeleton Screen Integration**: Added `boneyard-js` skeleton screens to support smooth, flicker-free layouts during loading states on protected views (admin users/document-types, citizen dashboard/applications/grievances, officer dashboard/grievances).
- **Navigation Cleanup**: Removed "Audit Logs" from navigation menus to simplify administrative routing.
- **Layout Alignment**: Centered navigation links in the primary Header/Navbar and fixed the top layout overlapping in the Hero section of the homepage.

**Clerk already integrated:**
- `ClerkProvider` wraps root layout
- Auth on protected routes via Clerk middleware (`middleware.ts` configured)
- `auth()` and `getToken()` imported from `@clerk/nextjs/server` in dashboard to authorize backend requests

**Frontend gaps (to build later):**
- Application submission forms
- Proof upload UI
- Grievance submission UI
- Payment UI
- Application tracking page
- Officer dashboard
- Admin dashboard

### Backend (under development)

**Already completed (✅):**
- FastAPI project structure, virtual environment, dependencies
- `app/main.py` — FastAPI instance, API router mounted, `/health` endpoint
- `app/core/config.py` — pydantic-settings with all env vars
- `app/db/session.py` — SQLModel synchronous engine + `get_session` dependency
- `app/db/base.py` — SQLModel base
- Supabase PostgreSQL connection verified
- **Phase 2 — Auth + RBAC** (fully complete)
- **Phase 3 — Documents** (fully complete)
- **Phase 4 — Applications** (fully complete)
- **Phase 5 — Officer Workflow** (fully complete)
- **Phase 6 — Admin Workflow & Audit** (fully complete)
- **Phase 7 — Grievances** (fully complete)
- **Phase 8 — Payments** (fully complete)

**Current phase: Phase 10 — RAG**

**Immediate next task:** `app/modules/rag/models.py`

---

## BACKEND FOLDER STRUCTURE

```
backend/
└── app/
    ├── main.py                    ← ✅ done
    ├── core/
    │   ├── config.py              ← ✅ done
    │   ├── security.py            ← verify Clerk JWT
    │   ├── exceptions.py          ← global error handlers
    │   ├── redis.py               ← Redis client
    │   ├── logging.py
    │   └── constants.py
    ├── db/
    │   ├── session.py             ← ✅ done
    │   └── base.py                ← ✅ done
    ├── api/
    │   ├── deps.py                ← ✅ done
    │   └── router.py              ← ✅ done
    ├── integrations/
    │   ├── clerk.py               ← ✅ done
    │   ├── gemini.py              ← ✅ done
    │   ├── imagekit.py
    │   ├── razorpay.py            ← ✅ done
    │   └── embeddings.py
    └── modules/
        ├── auth/
        │   ├── deps.py
        │   ├── service.py
        │   └── schemas.py
        ├── users/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── roles/
        │   ├── guards.py          ← ✅ done
        │   └── service.py
        ├── documents/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── applications/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── officer/
        │   ├── schemas.py         ← ✅ done
        │   ├── service.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── admin/
        │   ├── service.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── audit/
        │   ├── models.py          ← ✅ done
        │   └── service.py         ← ✅ done
        ├── grievances/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── payments/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   ├── routes.py          ← ✅ done
        │   └── webhooks.py        ← ✅ done
        ├── uploads/
        │   ├── service.py         ← ✅ done
        │   ├── routes.py          ← ✅ done
        │   └── schemas.py
        ├── chat/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   ├── schemas.py         ← ✅ done
        │   └── routes.py          ← ✅ done
        ├── rag/
        │   ├── models.py          ← ✅ done
        │   ├── repository.py      ← ✅ done
        │   ├── service.py         ← ✅ done
        │   └── ingestion.py       ← ✅ done
        ├── dashboard/
        │   ├── service.py         ← ✅ done
        │   ├── routes.py          ← ✅ done
        │   └── schemas.py         ← ✅ done
        └── notifications/
            ├── models.py          ← ✅ done
            └── service.py         ← ✅ done
```

---

## DATABASE MODELS (domain entities)

### User
```
id, clerk_user_id, email, full_name, phone, avatar_url
role: USER | OFFICER | ADMIN
is_active, created_at, updated_at
```

### DocumentType
```
id, name, slug, description
required_documents (JSON), fee_amount, processing_days
is_active, created_at
```

### DocumentApplication
```
id, application_number, user_id, document_type_id, assigned_officer_id
status: DRAFT | SUBMITTED | UNDER_REVIEW | MORE_INFO_REQUIRED | APPROVED | REJECTED | DOCUMENT_ISSUED
remarks, submitted_at, reviewed_at, approved_at, rejected_at, completed_at
```

### ApplicationProof
```
id, application_id, file_url, mime_type, file_type, uploaded_by, created_at
```

### FinalIssuedDocument
```
id, application_id, pdf_url, document_number, issued_by, issued_at
verification_code, checksum
```

### Grievance
```
id, ticket_number, user_id, assigned_officer_id, subject, description, category
status: OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED
resolution_notes, created_at, resolved_at
```

### Payment
```
id, user_id, application_id, payment_type, amount, currency
provider, provider_order_id, provider_payment_id, provider_signature
status: PENDING | SUCCESS | FAILED | REFUNDED
type: CERTIFICATE_FEE | UTILITY_BILL | OTHER
paid_at
```

### ChatSession
```
id, user_id, title, created_at, updated_at
```

### ChatMessage
```
id, session_id, role, message, metadata, created_at
```

### KnowledgeDocument + KnowledgeChunk (RAG)
```
KnowledgeDocument: id, title, source, content, metadata, created_at
KnowledgeChunk: id, document_id, chunk_text, embedding (pgvector), metadata
```

### Notification
```
id, user_id, title, message, is_read, type, created_at
```

### AuditLog
```
id, actor_user_id, action, resource_type, resource_id, metadata_info, created_at
```

---

## API SURFACE

Base: `/api/v1`

| Group | Endpoints |
|---|---|
| Auth | `GET /auth/me` · `POST /auth/sync` |
| Documents | `GET /document-types` · `GET /document-types/{slug}` |
| Applications | `POST /applications` · `GET /applications` · `GET /applications/{id}` |
| Officer | `GET /officer/applications` · `POST /officer/applications/{id}/approve` · `POST /officer/applications/{id}/reject` · `POST /officer/applications/{id}/issue-document` |
| Admin | `GET /admin/users` · `GET /admin/officers` · `GET /admin/admins` · `GET /admin/audit-logs` |
| Grievances | `POST /grievances` · `GET /grievances` · `GET /grievances/{id}` · `POST /grievances/{id}/resolve` |
| Payments | `POST /payments/create-order` · `POST /payments/verify` · `GET /payments` · `POST /webhooks/razorpay` |
| Uploads | `POST /uploads/sign` |
| Chat | `POST /chat/sessions` · `GET /chat/messages` · `GET /chat/history` |
| Dashboard | `GET /dashboard/summary` |

---

## ENV VARIABLES

### Backend `.env`
```env
DATABASE_URL=postgresql+psycopg://...supabase...
REDIS_URL=redis://...

CLERK_SECRET_KEY=sk_...
CLERK_JWT_ISSUER=https://...clerk.accounts.dev

GEMINI_API_KEY=...

IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

APP_NAME=DigiPanch Backend
APP_VERSION=1.0.0
ENVIRONMENT=development
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## IMPLEMENTATION PHASES

| Phase | Module | Status |
|---|---|---|
| 1 | Foundation — FastAPI, DB, config, health | ✅ Done |
| 2 | Auth + RBAC — User model, Clerk verify, role guards | ✅ Done |
| 3 | Documents — DocumentType model + APIs | ✅ Done |
| 4 | Applications — submission, proof upload, status tracking | ✅ Done |
| 5 | Officer workflow — review, approve/reject, issue PDF | ✅ Done |
| 6 | Admin — staff management, audit visibility | ✅ Done |
| 7 | Grievances — full lifecycle | ✅ Done |
| 8 | Payments — Razorpay integration + webhooks | ✅ Done |
| 9 | Chatbot — Gemini integration | ✅ Done |
| 10 | RAG — knowledge ingestion + pgvector search | ✅ Done |

---

## REDIS USAGE
- Dashboard summary cache (TTL: 5 min)
- Document type cache (TTL: 1 hr)
- Rate limiting per user per endpoint
- RAG response cache (same query)
- Chat throttling

## IMAGEKIT UPLOAD FLOW
```
Frontend → POST /uploads/sign → Backend signs request
→ Frontend uploads directly to ImageKit
→ Frontend sends back URL → Backend stores URL in DB
```

## RAZORPAY PAYMENT FLOW
```
POST /payments/create-order → Razorpay order created
→ Frontend opens Razorpay checkout
→ Payment success → POST /payments/verify → signature verified
→ POST /webhooks/razorpay → DB updated → receipt generated
```

## RAG FLOW
```
Question → embed query (Gemini embeddings)
→ pgvector similarity search → retrieve top-k chunks
→ build prompt with chunks → Gemini → answer
```

---

## WORKING RULES
1. Architecture first, code second — no random coding
2. One module at a time, in phase order
3. Every module = models → repository → service → schemas → routes
4. Never touch auth (Clerk handles it on frontend)
5. Always add audit logs for officer/admin actions
6. All file uploads go through ImageKit signed URL flow
7. Redis cache every expensive DB read

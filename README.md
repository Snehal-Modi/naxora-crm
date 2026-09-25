# Naxora CRM

Enterprise Internal CRM & Operations Management System for **Nexora Staffing LLP** (Staffing, Recruitment, Career Services, Training, and Placement).

---

## Architecture Overview

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui components, Lucide icons, TanStack Query (React Query), React Hook Form, Zod.
* **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0 ORM, Alembic migrations.
* **Database:** PostgreSQL (running locally on port 5432).
* **Security:** Argon2id password hashing, short-lived JWT access tokens (15m), secure database-tracked refresh tokens (7d), HttpOnly cookies, and database-driven granular RBAC.

---

## Current Status: Phase 1 Complete

* **Phase 1A — Foundation:** Project initialized, PostgreSQL connected, Alembic configured.
* **Phase 1B — Authentication & RBAC:** Users, roles, permissions, refresh tokens, Argon2id hashing, dual-token auth flow, permission enforcement dependencies.
* **Phase 1C — Basic CRM Shell:** Desktop sidebar + topbar, mobile drawer navigation, role-aware dashboard (Admin vs Staff), meaningful empty states (no fake numbers), live database RBAC inspector.

---

## Local Development Quick Start

### 1. Prerequisites
* Node.js `v22.x` and npm `11.x`
* Python `3.12.x`
* PostgreSQL `18.x` running on `localhost:5432` with database `naxora_crm`

---

### 2. Backend Setup & Run

```powershell
# Navigate to backend directory
cd d:\naxora-crm\backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run database migrations
alembic upgrade head

# Seed initial roles and accounts (if not already seeded)
python -m app.seed

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

* API Root: `http://127.0.0.1:8000`
* Swagger OpenAPI Docs: `http://127.0.0.1:8000/api/v1/docs`
* Health Check: `http://127.0.0.1:8000/api/v1/health`

---

### 3. Frontend Setup & Run

```powershell
# Navigate to frontend directory
cd d:\naxora-crm\frontend

# Start Next.js development server
npm run dev
```

* Frontend Web App: `http://localhost:3000`
* Login Page: `http://localhost:3000/login`

---

## Pre-Configured Development Test Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@nexorastaffing.com` | `NexoraAdmin@2026!` | Full system administration, RBAC inspector, all modules |
| **Staff Consultant** | `staff@nexorastaffing.com` | `NexoraStaff@2026!` | Operational recruitment access (leads, candidates, employers, jobs) |

*(Quick-login buttons are also provided on the login page for development convenience).*

---

## Running Automated Tests & Verification

### Backend Tests
```powershell
cd d:\naxora-crm\backend
.\.venv\Scripts\pytest.exe -v
```
*(All 13 tests covering Argon2id hashing, login, invalid credentials, token rotation, logout, me endpoint, and RBAC permission enforcement pass).*

### Frontend Verification
```powershell
cd d:\naxora-crm\frontend
npx tsc --noEmit
npm run lint
npm run build
```
*(TypeScript check, ESLint check, and Next.js production build pass with 0 errors).*


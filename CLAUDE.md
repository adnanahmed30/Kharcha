# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Kharcha is a personal expense tracker: a FastAPI + SQLite backend (`backend/`) and a React + TypeScript + Vite + Tailwind v4 frontend (`frontend/`). Expenses can be entered in several currencies and are converted to INR at the historical rate for the expense's date (Frankfurter API, no key needed).

## Commands

Run the backend and frontend in separate terminals.

Backend (http://127.0.0.1:8000, docs at `/docs`) — run from `backend/`, because the SQLite URL is relative (`sqlite:///./kharcha.db`) and the database file is created in the current directory:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows; macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
python -m pytest                # backend tests (use a throwaway DB, never kharcha.db)
```

The backend refuses to start without `JWT_SECRET_KEY` in `backend/.env` (git-ignored; never commit it or copy its value anywhere). To create one on a fresh checkout:

```bash
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(64))" > .env
```

Frontend (http://localhost:5173):

```bash
cd frontend
npm install
npm run dev       # dev server
npm run build     # tsc -b type-check + vite build
npm run lint      # oxlint (config: frontend/.oxlintrc.json)
```

Backend tests live in `backend/tests/` (pytest + FastAPI `TestClient`). `conftest.py` sets `KHARCHA_DATABASE_URL` to a temp SQLite file before importing the app and recreates tables per test; it provides `alice`/`bob` clients (separate cookie jars) and `add_expense()` (INR, so no network). The client uses `https://testserver` because the session cookie is `Secure`. There are no frontend tests.

## Architecture

### Money model (the core invariant)
- All amounts are **integers in minor units** (paise/cents), never floats. `amount_minor` is in the original currency; `amount_inr_paise` is the converted INR amount.
- Each expense stores the `rate` used at creation time, so historical totals never change when rates do.
- `amount_inr_paise` is denormalized onto the row so monthly summaries are a single `SUM ... GROUP BY`. When adding write paths, keep it in sync: `routes/expenses.py` `update_expense` re-fetches the rate and recomputes it whenever `amount_minor`, `currency` or `spent_on` changes.
- Conversion lives in `backend/app/services/exchange_rates.py` (uses `requests`, 5s timeout). It raises `RateNotFoundError` (mapped to HTTP 422) or `RateServiceError` (mapped to HTTP 502) — routes translate these, the service never raises `HTTPException`.

### Backend
- `main.py` calls `Base.metadata.create_all` at import time; there are no migrations, so schema changes to `models.py` require deleting `kharcha.db` (or migrating by hand).
- Month filtering uses half-open date ranges from `dates.month_range("YYYY-MM")` (`spent_on >= start AND < next month start`) so the `spent_on` index is usable. Reuse it instead of string/`strftime` matching.
- `ExpenseUpdate` (PATCH) uses `model_dump(exclude_unset=True)`; its validators reject explicit `null` for required fields, while `note` may be set to `null`.
- Domain errors are mapped to HTTP responses in one place, `error_handler.py` (`ERROR_RESPONSES`: status + user-facing message; the technical message is only logged). Services raise their own exceptions, never `HTTPException`.

### Authentication and ownership
- Users register/log in with email + password (`routes/auth.py`: `register`, `login`, `logout`, `me`). Emails are stored lowercased; passwords are hashed with Argon2 via `pwdlib` (`services/security.py`; the salt is inside the hash string). Login gives the same 401 for unknown email and wrong password, and checks a dummy hash for unknown emails so timing matches.
- The session is a JWT (HS256, `sub` = user id, 1-day expiry, settings in `config.py`) in an **httpOnly, Secure, SameSite=Strict cookie** `kharcha_session` (path `/api`). JavaScript never sees the token. Logout deletes the cookie; JWTs can't be revoked early, so rotating `JWT_SECRET_KEY` logs everyone out.
- `deps.get_current_user` reads the cookie and loads the `User` (401 otherwise). **Every expense/summary route must take `current_user` and filter by `Expense.user_id`**; single expenses go through `get_owned_expense`, which returns 404 (not 403) for other users' expenses. `create_expense` takes `user_id` from the session, never the body.
- CSRF: besides SameSite=Strict, `deps.check_origin` (app-wide dependency in `main.py`) rejects POST/PATCH/DELETE whose `Origin` isn't in `config.ALLOWED_ORIGINS` (403). Requests without an Origin (curl, tests) are allowed.
- Rate limiting (`services/rate_limit.py`, limits in `config.py`): failed logins per email (5 / 15 min) and per IP (20 / 15 min), registrations per IP (10 / hour). Login checks the limits *before* the password, so a locked account stays locked even for the right password; a successful login resets the per-email count. Over the limit → 429 with `Retry-After`. Counters are in memory: single process only, reset on restart. Behind the Vite proxy every request comes from 127.0.0.1, so per-IP limits are shared in development; behind a real proxy, run uvicorn with `--proxy-headers` so `request.client.host` is the visitor. Tests clear the counters in `conftest.fresh_database`.
- There is no CORS middleware: the browser only talks to the Vite dev server, which proxies `/api` to FastAPI. Serving the frontend from another origin in future means revisiting the cookie, Origin list and CORS together.

### Frontend
- `src/api/` is the only place that talks to the backend. `src/api/client.ts` has `send()` (relative `/api` URLs via the Vite proxy in `vite.config.ts`, sends the cookie, turns network/proxy failures into "Can't reach server" (user-facing; don't mention the backend), reports 401s to `AuthProvider`) and `getErrorMessage()` (FastAPI `detail`, first item for 422 lists). `expenses.ts` and `auth.ts` build on it.
- Login state: `src/auth/AuthProvider.tsx` asks `GET /api/auth/me` on load and exposes `useAuth()` (`src/auth/authContext.ts`: `user`, `isLoading`, `signIn`, `signOut`). Any 401 clears `user`. `components/RequireAuth.tsx` is the parent route for pages that need login and redirects to `/login` (remembering the page in router state).
- `src/hooks/useFetch.ts` is the data-loading pattern (`useFetch(fetcher, deps)` with an ignore flag for stale responses). Pages force a reload by bumping a `refreshCounter` included in `deps`.
- Dashboard state (`month`, `category`) lives in the URL search params, not React state.
- Amount conversion between user input and minor units goes through `src/utils/money.ts` (`toMinorUnits`, `toInputText`, `formatPaise`, `formatAmount`); month strings are `YYYY-MM` handled by `src/utils/dates.ts`.

### Duplicated contracts
The category and currency lists, the expense/summary/user shapes, and the input limits are defined twice and must be kept in sync by hand:
- Backend: `Category` / `Currency` literals and Pydantic models (`ExpenseCreate`, `RegisterIn`, `LoginIn`, `UserOut`, …) in `backend/app/schemas.py`
- Frontend: `CATEGORIES` / `CURRENCIES` and interfaces (`Credentials`, `UserOut`, …) in `frontend/src/types.ts`
- Limits: `amount_minor` max (`MAX_AMOUNT_MINOR` in `src/utils/money.ts`), password 8–128 chars (`AuthForm`/`RegisterPage`), and the earliest month 2000-01 (`MIN_YEAR` in `dates.py`, `MIN_MONTH` in `src/utils/dates.ts`)

## Design
Style is inspired by `design/inspo.png` (take the look, never its logos, images or text): near-monochrome, borderless cards, black pill buttons.
- Colour tokens live in the `@theme` block of `frontend/src/index.css` (`canvas`, `canvas-alt`, `surface`, `ink`, `ink-soft`, `muted`, `subtle`, `line`); use them (`bg-surface`, `text-muted`) instead of raw Tailwind greys. DM Sans is loaded by a Google Fonts `<link>` in `frontend/index.html`.
- Green (`emerald-500`) is reserved for the category bars in `SummaryBox`; buttons and selected states are `ink` (black).
- Reused patterns: cards are `rounded-2xl bg-surface` with no border or shadow; primary actions are a black pill with a white circle icon (header "Add expense" in `App.tsx`, Save in `ExpenseForm.tsx`); small labels are `text-xs uppercase tracking-wider text-muted`; headings are `font-medium tracking-tight`.
- Pitfalls: `text-subtle` fails contrast for small text on white (use `text-muted`); a `canvas-alt` hover is nearly invisible on the `canvas` page background; `ExpenseForm`'s `inputClass` deliberately has no width, so each field adds its own (two width classes on one element conflict).

## Gotchas
- `backend/requirements.txt` is UTF-8. Regenerate it with `python -m pip freeze > requirements.txt` from Git Bash, not PowerShell 5.1 (whose `>` writes UTF-16).
- On Windows, stopping `npm run dev` can leave the Vite `node.exe` listening on port 5173; check the port and stop that process if the next start fails.


## How to work on this project
- I am a beginner. Before changing code, explain what you plan to do and why, in plain terms. 
- Make small changes, one step at a time. Do not change files I didn't ask about without asking first. 
- Never delete files, install new packages, or change the database/config without asking me. 
- Some existing code may or may not follow best practices. Don't assume a pattern is correct just because it exists. 
- If something looks wrong, point it out and explain why, but don't change it unless I agree. 
- After each change, tell me how to check it works by hand (what to run, what to enter, what result to expect).
- Do not add a test framework or new test files without asking me first. 
- Before writing or running any test, explain in plain terms what it checks, why that matters, and how the test works. 
- Once tests exist, run them after every change and tell me the result. 
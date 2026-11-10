# Kharcha

**Kharcha** (Hindi for *expense*) is a personal expense tracker that understands more than one currency. Add an expense in rupees, dollars or another supported currency, and Kharcha converts it to Indian rupees using the exchange rate on the day you spent it. The dashboard then shows a month at a glance, with a breakdown by category.

Built as a learning project with **FastAPI + SQLite** on the backend and **React + TypeScript + Tailwind CSS** on the frontend.

<!-- Add a screenshot: save it as docs/dashboard.png and uncomment the next line -->
<!-- ![Kharcha dashboard](docs/dashboard.png) -->

## Features

- **Add, edit and delete expenses**, each with an amount, currency, category, date and an optional note.
- **Automatic currency conversion to INR** using the historical rate for the expense's date ([Frankfurter API](https://frankfurter.dev/), free, no key needed).
- **Monthly dashboard**: move between months, filter by category, and see totals with each category's share of the month.
- **Shareable views**: the selected month and category live in the URL, so a filtered view can be bookmarked or refreshed.
- **Clear error handling**: invalid input is rejected with a helpful message (422), and a failed exchange-rate lookup is reported separately (502).

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Pydantic, SQLite, requests |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS v4 |
| External API | Frankfurter (exchange rates) |

## How it works

- **Money is stored as whole numbers in the smallest unit** (paise, cents), never as floating-point values, so totals never pick up rounding errors such as `0.30000000000000004`.
- **The exchange rate is saved with each expense.** Converting once, at the rate for that day, means past totals never change when today's rates do.
- **The rupee amount is stored alongside the original** (`amount_inr_paise`), so monthly totals are a single fast `SUM ... GROUP BY` query. It is recalculated whenever the amount, currency or date is edited.
- **Months are filtered with date ranges** (`spent_on >= first day AND < first day of next month`), so the date column's index can be used.

## Project structure

```
kharcha/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routers
│   │   ├── database.py          # engine, session, Base, get_db
│   │   ├── models.py            # Expense table
│   │   ├── schemas.py           # Pydantic input/output schemas
│   │   ├── dates.py             # month → date range helper
│   │   ├── routes/
│   │   │   ├── expenses.py      # CRUD endpoints
│   │   │   └── summary.py       # monthly totals by category
│   │   └── services/
│   │       └── exchange_rates.py  # Frankfurter client + conversion
│   └── requirements.txt
└── frontend/
    └── src/
        ├── api/expenses.ts      # typed API client
        ├── hooks/useFetch.ts    # data-loading hook
        ├── utils/               # money and date helpers
        ├── components/          # summary, list, rows, chips, form
        └── pages/               # dashboard, add, edit
```

## Getting started

You need **Python 3** and **Node.js** installed. Run the backend and the frontend in two separate terminals.

### 1. Backend (http://127.0.0.1:8000)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The SQLite database file (`kharcha.db`) is created automatically on first run. Interactive API docs are at http://127.0.0.1:8000/docs.

### 2. Frontend (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/expenses?month=YYYY-MM&category=...` | List expenses, optionally filtered |
| `POST` | `/api/expenses` | Create an expense (converted to INR) |
| `GET` | `/api/expenses/{id}` | Get one expense |
| `PATCH` | `/api/expenses/{id}` | Update only the fields sent |
| `DELETE` | `/api/expenses/{id}` | Delete an expense (204) |
| `GET` | `/api/summary?month=YYYY-MM` | Monthly total and per-category totals |
| `GET` | `/api/health` | Health check |

## Known limitations

- An invalid month in the URL (for example `?month=abc`) is not handled gracefully on the dashboard yet.
- While a new month loads, the previous month's data is briefly visible.
- Data is stored locally in SQLite; there are no user accounts.

## What I learned

- Designing a REST API with FastAPI routers, Pydantic validation and the right status codes (201, 204, 404, 422, 502).
- Modelling money correctly and storing a snapshot of external data instead of re-fetching it.
- Aggregating data with SQL (`GROUP BY`, `SUM`, `COUNT`) through SQLAlchemy.
- CORS and preflight requests between a React app and an API on another port.
- Building a typed React frontend: a custom data-loading hook, controlled forms, URL-driven filters and Tailwind styling.
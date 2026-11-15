import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# backend/.env holds secrets and is git-ignored; never hardcode them here.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _require(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"{name} is not set. Add it to backend/.env (see CLAUDE.md).")
    return value


JWT_SECRET_KEY = _require("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME = timedelta(days=1)

SESSION_COOKIE_NAME = "kharcha_session"
# Browsers accept Secure cookies on http://localhost, so this stays on in development too.
# Set COOKIE_SECURE=false in .env only if your browser refuses the cookie locally.
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"

# Rate limits as (attempts, window in seconds). See services/rate_limit.py.
# Behind the Vite dev proxy every request comes from 127.0.0.1, so per-IP limits are shared by
# everyone in development; keep them generous. Counts live in memory and reset on restart.
LOGIN_FAILURES_PER_EMAIL = (5, 15 * 60)
LOGIN_FAILURES_PER_IP = (20, 15 * 60)
REGISTRATIONS_PER_IP = (10, 60 * 60)

# Sites allowed to send requests that change data (checked against the Origin header).
ALLOWED_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",   # /docs
    "http://127.0.0.1:8000",   # /docs
}

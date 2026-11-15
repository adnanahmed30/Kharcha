import os
import tempfile
from pathlib import Path

import pytest

# Must happen before "app" is imported: point the app at a throwaway database
# so tests never touch the real kharcha.db.
_test_dir = tempfile.mkdtemp(prefix = "kharcha-tests-")
os.environ["KHARCHA_DATABASE_URL"] = f"sqlite:///{Path(_test_dir) / 'test.db'}"

from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.services.rate_limit import ALL_LIMITERS  # noqa: E402

# The session cookie is Secure, so the fake client must use https or it won't send it back.
BASE_URL = "https://testserver"
PASSWORD = "correct horse battery"


@pytest.fixture(autouse = True)
def fresh_database():
    """Every test starts with empty tables and empty rate-limit counters."""
    Base.metadata.drop_all(bind = engine)
    Base.metadata.create_all(bind = engine)
    for limiter in ALL_LIMITERS:
        limiter.clear()
    yield


def make_client() -> TestClient:
    """A separate client per user, so each has its own cookie jar (like separate browsers)."""
    return TestClient(app, base_url = BASE_URL)


def register(client: TestClient, email: str, password: str = PASSWORD, name: str = "Test User"):
    return client.post("/api/auth/register", json = {"name": name, "email": email, "password": password})


@pytest.fixture
def alice() -> TestClient:
    client = make_client()
    assert register(client, "alice@example.com").status_code == 201
    return client


@pytest.fixture
def bob() -> TestClient:
    client = make_client()
    assert register(client, "bob@example.com").status_code == 201
    return client


def add_expense(client: TestClient, **overrides):
    # INR needs no exchange-rate lookup, so tests don't use the internet.
    body = {
        "amount_minor": 50_000,
        "currency": "INR",
        "category": "Food",
        "note": "lunch",
        "spent_on": "2026-11-01",
    }
    body.update(overrides)
    return client.post("/api/expenses", json = body)

from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import select

from app.config import JWT_ALGORITHM, JWT_SECRET_KEY, SESSION_COOKIE_NAME
from app.database import SessionLocal
from app.models import User
from tests.conftest import PASSWORD, make_client, register


def test_register_sets_httponly_cookie_and_hides_password():
    client = make_client()
    response = register(client, "Alice@Example.com")

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"  # stored lowercased
    assert "password" not in body and "password_hash" not in body

    set_cookie = response.headers["set-cookie"].lower()
    assert SESSION_COOKIE_NAME in set_cookie
    assert "httponly" in set_cookie
    assert "secure" in set_cookie
    assert "samesite=strict" in set_cookie


def test_password_is_stored_as_salted_argon2_hash():
    register(make_client(), "a@example.com")
    register(make_client(), "b@example.com")  # same password as a@

    with SessionLocal() as db:
        hashes = [user.password_hash for user in db.scalars(select(User))]

    assert all(h.startswith("$argon2id$") for h in hashes)
    assert all(PASSWORD not in h for h in hashes)
    # Same password, different random salt -> different hashes.
    assert hashes[0] != hashes[1]


def test_name_is_trimmed_returned_and_required():
    client = make_client()
    created = register(client, "alice@example.com", name = "  Alice  ")
    assert created.status_code == 201
    assert created.json()["name"] == "Alice"
    assert client.get("/api/auth/me").json()["name"] == "Alice"

    blank = register(make_client(), "blank@example.com", name = "   ")
    assert blank.status_code == 422
    assert "Name cannot be empty" in blank.json()["detail"][0]["msg"]


def test_duplicate_email_is_rejected_case_insensitively():
    register(make_client(), "alice@example.com")
    response = register(make_client(), "ALICE@example.com")
    assert response.status_code == 409


def test_short_password_and_bad_email_are_rejected():
    assert register(make_client(), "a@example.com", password = "short").status_code == 422
    assert register(make_client(), "not-an-email").status_code == 422


def test_wrong_password_and_unknown_email_look_the_same():
    register(make_client(), "alice@example.com")
    client = make_client()

    wrong_password = client.post("/api/auth/login", json = {"email": "alice@example.com", "password": "nope-nope"})
    unknown_email = client.post("/api/auth/login", json = {"email": "ghost@example.com", "password": PASSWORD})

    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_login_then_me_then_logout():
    register(make_client(), "alice@example.com")
    client = make_client()

    login = client.post("/api/auth/login", json = {"email": "alice@example.com", "password": PASSWORD})
    assert login.status_code == 200
    assert client.get("/api/auth/me").json()["email"] == "alice@example.com"

    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/auth/me").status_code == 401


def test_requests_without_valid_session_are_rejected():
    client = make_client()
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/expenses").status_code == 401

    client.cookies.set(SESSION_COOKIE_NAME, "not-a-real-token", domain = "testserver", path = "/api")
    assert client.get("/api/auth/me").status_code == 401


def test_token_signed_with_another_key_is_rejected(alice):
    me = alice.get("/api/auth/me").json()
    forged = jwt.encode(
        {"sub": str(me["id"]), "exp": datetime.now(timezone.utc) + timedelta(hours = 1)},
        "an-attacker-guessed-key-that-is-not-the-real-one",
        algorithm = JWT_ALGORITHM,
    )
    client = make_client()
    client.cookies.set(SESSION_COOKIE_NAME, forged, domain = "testserver", path = "/api")
    assert client.get("/api/auth/me").status_code == 401


def test_expired_token_is_rejected(alice):
    me = alice.get("/api/auth/me").json()
    expired = jwt.encode(
        {"sub": str(me["id"]), "exp": datetime.now(timezone.utc) - timedelta(minutes = 1)},
        JWT_SECRET_KEY,
        algorithm = JWT_ALGORITHM,
    )
    client = make_client()
    client.cookies.set(SESSION_COOKIE_NAME, expired, domain = "testserver", path = "/api")
    assert client.get("/api/auth/me").status_code == 401


def test_data_changing_request_from_another_website_is_blocked(alice):
    response = alice.post(
        "/api/expenses",
        json = {"amount_minor": 100, "currency": "INR", "category": "Food", "spent_on": "2026-11-01"},
        headers = {"Origin": "https://evil.example"},
    )
    assert response.status_code == 403

    allowed = alice.post(
        "/api/expenses",
        json = {"amount_minor": 100, "currency": "INR", "category": "Food", "spent_on": "2026-11-01"},
        headers = {"Origin": "http://localhost:5173"},
    )
    assert allowed.status_code == 201

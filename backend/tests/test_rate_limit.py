import pytest

from app.config import LOGIN_FAILURES_PER_EMAIL, LOGIN_FAILURES_PER_IP, REGISTRATIONS_PER_IP
from app.services.rate_limit import RateLimitedError, RateLimiter
from tests.conftest import PASSWORD, make_client, register


def try_login(client, email: str, password: str):
    return client.post("/api/auth/login", json = {"email": email, "password": password})


def test_account_locks_after_too_many_wrong_passwords_even_for_correct_password():
    register(make_client(), "alice@example.com")
    client = make_client()
    max_failures, _ = LOGIN_FAILURES_PER_EMAIL

    for _ in range(max_failures):
        assert try_login(client, "alice@example.com", "wrong-password").status_code == 401

    locked = try_login(client, "alice@example.com", PASSWORD)
    assert locked.status_code == 429
    assert int(locked.headers["Retry-After"]) > 0
    assert "Too many attempts" in locked.json()["detail"]


def test_lockout_is_per_email():
    register(make_client(), "alice@example.com")
    register(make_client(), "bob@example.com")
    client = make_client()
    max_failures, _ = LOGIN_FAILURES_PER_EMAIL

    for _ in range(max_failures):
        try_login(client, "alice@example.com", "wrong-password")

    assert try_login(client, "bob@example.com", PASSWORD).status_code == 200


def test_successful_login_resets_the_failure_count():
    register(make_client(), "alice@example.com")
    client = make_client()
    max_failures, _ = LOGIN_FAILURES_PER_EMAIL

    for _ in range(max_failures - 1):
        try_login(client, "alice@example.com", "wrong-password")
    assert try_login(client, "alice@example.com", PASSWORD).status_code == 200

    for _ in range(max_failures - 1):
        assert try_login(client, "alice@example.com", "wrong-password").status_code == 401
    assert try_login(client, "alice@example.com", PASSWORD).status_code == 200


def test_one_address_trying_many_emails_is_limited():
    client = make_client()
    max_failures, _ = LOGIN_FAILURES_PER_IP

    # A different email each time, so only the per-IP limit can trigger.
    for i in range(max_failures):
        assert try_login(client, f"user{i}@example.com", "wrong-password").status_code == 401

    assert try_login(client, "someone-new@example.com", "wrong-password").status_code == 429


def test_registrations_per_address_are_limited():
    max_registrations, _ = REGISTRATIONS_PER_IP
    for i in range(max_registrations):
        assert register(make_client(), f"user{i}@example.com").status_code == 201

    assert register(make_client(), "one-too-many@example.com").status_code == 429


def test_limiter_allows_again_after_the_window_passes():
    now = [1000.0]
    limiter = RateLimiter(limit = 2, window_seconds = 60, clock = lambda: now[0])

    limiter.hit("key")
    limiter.hit("key")
    with pytest.raises(RateLimitedError) as error:
        limiter.check("key")
    assert error.value.retry_after_seconds == 60

    now[0] += 30
    with pytest.raises(RateLimitedError) as error:
        limiter.check("key")
    assert error.value.retry_after_seconds == 30

    now[0] += 30  # the first hits are now exactly one window old
    limiter.check("key")  # no error


def test_limiter_keys_are_independent():
    limiter = RateLimiter(limit = 1, window_seconds = 60)
    limiter.hit("a")
    with pytest.raises(RateLimitedError):
        limiter.check("a")
    limiter.check("b")  # no error

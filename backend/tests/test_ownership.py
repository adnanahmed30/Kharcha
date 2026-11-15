from tests.conftest import add_expense


def test_users_only_see_their_own_expenses(alice, bob):
    add_expense(alice, note = "alice lunch")
    add_expense(bob, note = "bob lunch", amount_minor = 20_000)

    alice_notes = [e["note"] for e in alice.get("/api/expenses").json()]
    bob_notes = [e["note"] for e in bob.get("/api/expenses").json()]

    assert alice_notes == ["alice lunch"]
    assert bob_notes == ["bob lunch"]


def test_summary_only_counts_own_expenses(alice, bob):
    add_expense(alice, amount_minor = 50_000)
    add_expense(bob, amount_minor = 20_000)

    summary = bob.get("/api/summary", params = {"month": "2026-11"}).json()
    assert summary["total_inr_paise"] == 20_000
    assert summary["count"] == 1


def test_other_users_expense_looks_missing(alice, bob):
    expense_id = add_expense(alice).json()["id"]

    assert bob.get(f"/api/expenses/{expense_id}").status_code == 404
    assert bob.patch(f"/api/expenses/{expense_id}", json = {"note": "hacked"}).status_code == 404
    assert bob.delete(f"/api/expenses/{expense_id}").status_code == 404

    # Alice's expense is untouched.
    still_there = alice.get(f"/api/expenses/{expense_id}")
    assert still_there.status_code == 200
    assert still_there.json()["note"] == "lunch"


def test_owner_can_update_and_delete(alice):
    expense_id = add_expense(alice).json()["id"]

    updated = alice.patch(f"/api/expenses/{expense_id}", json = {"note": "dinner"})
    assert updated.status_code == 200
    assert updated.json()["note"] == "dinner"

    assert alice.delete(f"/api/expenses/{expense_id}").status_code == 204
    assert alice.get(f"/api/expenses/{expense_id}").status_code == 404


def test_user_id_in_request_body_is_ignored(alice, bob):
    bob_id = bob.get("/api/auth/me").json()["id"]

    created = add_expense(alice, user_id = bob_id)
    assert created.status_code == 201

    assert len(alice.get("/api/expenses").json()) == 1
    assert bob.get("/api/expenses").json() == []

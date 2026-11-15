from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Expense, User
from app.schemas import Category, ExpenseCreate, ExpenseOut, ExpenseUpdate
from app.services.exchange_rates import (get_rate_to_inr, to_inr_paise,)
from app.dates import month_range

router = APIRouter(prefix = "/api/expenses", tags = ["expenses"])


def get_owned_expense(db: Session, expense_id: int, user: User) -> Expense:
    """Return the expense only if it belongs to user.

    Someone else's expense gets the same 404 as a missing one, so other users
    can't even find out which ids exist.
    """
    expense = db.get(Expense, expense_id)
    if expense is None or expense.user_id != user.id:
        raise HTTPException(status_code = 404, detail = "Expense not found.")
    return expense


@router.post("", response_model = ExpenseOut, status_code = 201)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rate = get_rate_to_inr(payload.currency, payload.spent_on)

    expense = Expense(
        user_id = current_user.id,   # from the session, never from the request body
        amount_minor = payload.amount_minor,
        currency = payload.currency,
        rate = rate,
        amount_inr_paise = to_inr_paise(payload.amount_minor, rate),
        category = payload.category,
        note = payload.note,
        spent_on = payload.spent_on,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model = list[ExpenseOut])
def list_expenses(
    month: str | None = Query(default = None, pattern = r"^\d{4}-\d{2}$"),
    category: Category | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Expense).where(Expense.user_id == current_user.id)
    if month:
        start, end = month_range(month)
        query = query.where(Expense.spent_on >= start, Expense.spent_on < end)

    if category:
        query = query.where(Expense.category == category)

    query = query.order_by(Expense.spent_on.desc(), Expense.id.desc())
    return db.scalars(query).all()


@router.patch("/{expense_id}", response_model = ExpenseOut)
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_owned_expense(db, expense_id, current_user)
    changes = payload.model_dump(exclude_unset = True)
    for name, value in changes.items():
        setattr(expense, name, value)

    if any(field in changes for field in ("amount_minor", "currency", "spent_on")):
        expense.rate = get_rate_to_inr(expense.currency, expense.spent_on)
        expense.amount_inr_paise = to_inr_paise(expense.amount_minor, expense.rate)

    db.commit()
    db.refresh(expense)
    return expense


@router.get("/{expense_id}", response_model = ExpenseOut)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_expense(db, expense_id, current_user)


@router.delete("/{expense_id}", status_code = 204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_owned_expense(db, expense_id, current_user)
    db.delete(expense)
    db.commit()

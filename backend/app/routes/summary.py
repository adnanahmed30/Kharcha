from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Query, Depends

from app.schemas import SummaryOut
from app.database import get_db
from app.dates import month_range
from app.models import Expense

router = APIRouter(prefix = "/api/summary", tags = ["summary"])



@router.get("", response_model = SummaryOut)
def get_month_summary(
    month : str = Query(pattern = r"^\d{4}-\d{2}$"),
    db: Session = Depends(get_db)
):
    start, end = month_range(month)
    query = (
        select(
            Expense.category,
            func.sum(Expense.amount_inr_paise).label("total_inr_paise"),
            func.count(Expense.id).label("count"),
        )
        .where(Expense.spent_on >= start, Expense.spent_on < end)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount_inr_paise).desc())
    )
    rows = db.execute(query).all()
    by_category = []
    for row in rows:
        by_category.append({
            "category": row.category,
            "total_inr_paise": row.total_inr_paise,
            "count": row.count,
        })

    month_total = sum(entry["total_inr_paise"] for entry in by_category)
    month_count = sum(entry["count"] for entry in by_category)

    return {
        "month": month,
        "total_inr_paise": month_total,
        "count": month_count,
        "by_category": by_category
    }
    

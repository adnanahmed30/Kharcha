from datetime import date, datetime
from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[int] = mapped_column(primary_key = True)
    amount_minor: Mapped[int]
    currency: Mapped[str] = mapped_column(String(3))
    rate: Mapped[float]
    amount_inr_paise: Mapped[int]
    category: Mapped[str] = mapped_column(String(20), index = True)
    note: Mapped[str | None] = mapped_column(Text)
    spent_on: Mapped[date] = mapped_column(index = True)
    created_at: Mapped[datetime] = mapped_column(server_default = func.now())

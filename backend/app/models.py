from datetime import date, datetime
from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key = True)
    # Stored lowercased (see schemas.py) so "A@x.com" and "a@x.com" are one account.
    email: Mapped[str] = mapped_column(String(254), unique = True)
    # Display name shown in the header; limits are in schemas.RegisterIn.
    name: Mapped[str] = mapped_column(String(50))
    # Argon2 hash string from pwdlib; it contains the salt. Never the plain password.
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(server_default = func.now())


class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[int] = mapped_column(primary_key = True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index = True)
    amount_minor: Mapped[int]
    currency: Mapped[str] = mapped_column(String(3))
    rate: Mapped[float]
    amount_inr_paise: Mapped[int]
    category: Mapped[str] = mapped_column(String(20), index = True)
    note: Mapped[str | None] = mapped_column(Text)
    spent_on: Mapped[date] = mapped_column(index = True)
    created_at: Mapped[datetime] = mapped_column(server_default = func.now())

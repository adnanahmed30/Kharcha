from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Category = Literal[
    "Food", "Transport", "Rent", "Shopping", "Bills", "Health", "Entertainment", "Other"
]

Currency = Literal["INR", "USD", "EUR", "GBP", "AED"]


class ExpenseCreate(BaseModel):
    amount_minor: int = Field(gt = 0, le = 1_000_000_000)
    currency: Currency
    category: Category
    note: str | None = Field(default = None, max_length = 200)
    spent_on: date
    @field_validator("spent_on")
    @classmethod
    def not_in_future(cls, value:date) -> date:
        if value > date.today():
            raise ValueError("Date cannot be in the future.")
        return value


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)
    id: int
    amount_minor: int
    currency: str
    rate: float
    amount_inr_paise: int
    category: str
    note: str | None
    spent_on: date
    created_at: datetime


class ExpenseUpdate(BaseModel):
    amount_minor: int | None = Field(default = None, gt = 0, le = 1_000_000_000)
    currency: Currency | None = None
    category: Category | None = None
    note: str | None = Field(default = None, max_length = 200)
    spent_on: date | None = None
    @field_validator("amount_minor", "category", "currency", "spent_on")
    @classmethod
    def not_null(cls, value):
        if value is None:
            raise ValueError("Value cannot be empty.")
        return value
    
    @field_validator("spent_on")
    @classmethod
    def not_in_future(cls, value:date) -> date:    
        if value > date.today():
            raise ValueError("Date cannot be in the future.")
        return value  



class LoginIn(BaseModel):
    email: EmailStr
    # max_length stops someone making the server hash a huge string.
    password: str = Field(min_length = 1, max_length = 128)
    @field_validator("email")
    @classmethod
    def lowercase_email(cls, value: str) -> str:
        return value.strip().lower()


NAME_MAX_LENGTH = 50


class RegisterIn(LoginIn):
    name: str
    password: str = Field(min_length = 8, max_length = 128)
    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        # Trim first, so "   " counts as empty and stray spaces don't count towards the limit.
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty.")
        if len(value) > NAME_MAX_LENGTH:
            raise ValueError(f"Name must be at most {NAME_MAX_LENGTH} characters.")
        return value


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes = True)
    id: int
    name: str
    email: str
    created_at: datetime


class CategoryTotal(BaseModel):
    category: str
    total_inr_paise: int
    count: int


class SummaryOut(BaseModel):
    month: str
    total_inr_paise: int
    count: int
    by_category: list[CategoryTotal]

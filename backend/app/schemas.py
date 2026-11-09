from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator

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



class CategoryTotal(BaseModel):
    category: str
    total_inr_paise: int
    count: int


class SummaryOut(BaseModel):
    month: str
    total_inr_paise: int
    count: int
    by_category: list[CategoryTotal]

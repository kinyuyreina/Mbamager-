"""
Mbamager Recurring Transaction Schemas

This module defines Pydantic validation schemas for RecurringTransaction operations.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import Field

from app.models.recurring_transaction import RecurringFrequency
from app.models.transaction import TransactionCategory, TransactionDirection
from app.schemas.common import BaseSchema, TimestampSchema

class RecurringTransactionCreate(BaseSchema):
    account_id: int = Field(..., description="ID of the account for these transactions")
    amount: Decimal = Field(..., gt=0, description="Transaction amount")
    category: TransactionCategory = Field(..., description="The transaction category tag")
    direction: TransactionDirection = Field(..., description="CREDIT or DEBIT direction")
    frequency: RecurringFrequency = Field(..., description="DAILY, WEEKLY, MONTHLY, or YEARLY")
    start_date: date = Field(..., description="Start date of recursion")
    end_date: Optional[date] = Field(default=None, description="Optional termination date")
    narrative: Optional[str] = Field(default=None, max_length=255, description="Optional template description")

class RecurringTransactionUpdate(BaseSchema):
    account_id: Optional[int] = Field(default=None, description="ID of the account")
    amount: Optional[Decimal] = Field(default=None, gt=0, description="Transaction amount")
    category: Optional[TransactionCategory] = Field(default=None, description="The transaction category tag")
    direction: Optional[TransactionDirection] = Field(default=None, description="CREDIT or DEBIT direction")
    frequency: Optional[RecurringFrequency] = Field(default=None, description="DAILY, WEEKLY, MONTHLY, or YEARLY")
    start_date: Optional[date] = Field(default=None, description="Start date of recursion")
    end_date: Optional[date] = Field(default=None, description="Optional termination date")
    active: Optional[bool] = Field(default=None, description="Whether the schedule is enabled")
    narrative: Optional[str] = Field(default=None, max_length=255, description="Optional template description")

class RecurringTransactionResponse(TimestampSchema):
    id: int
    user_id: int
    account_id: int
    amount: Decimal
    category: TransactionCategory
    direction: TransactionDirection
    frequency: RecurringFrequency
    start_date: date
    end_date: Optional[date]
    last_processed: Optional[date]
    active: bool
    narrative: Optional[str]

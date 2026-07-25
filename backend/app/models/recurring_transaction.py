"""
Mbamager Recurring Transaction Domain Model

This module defines the SQLAlchemy 2.0 RecurringTransaction model.
"""

import enum
from datetime import datetime, date
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, DateTime, Date, Enum as SQLEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.transaction import TransactionCategory, TransactionDirection

class RecurringFrequency(str, enum.Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"

class RecurringTransaction(Base):
    """
    RecurringTransaction entity representing a template/rule for transactions that repeat over time.
    """
    __tablename__ = "recurring_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        nullable=False
    )
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory, name="recurring_transactioncategory_enum"),
        nullable=False
    )
    direction: Mapped[TransactionDirection] = mapped_column(
        SQLEnum(TransactionDirection, name="recurring_transactiondirection_enum"),
        nullable=False
    )
    frequency: Mapped[RecurringFrequency] = mapped_column(
        SQLEnum(RecurringFrequency, name="recurringfrequency_enum"),
        nullable=False
    )
    
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    last_processed: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    narrative: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<RecurringTransaction(id={self.id}, user_id={self.user_id}, frequency={self.frequency.value})>"

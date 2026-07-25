"""
Mbamager Transaction Domain Model

This module defines the SQLAlchemy 2.0 Transaction model representing individual changes of state.
It adheres strictly to storing precise decimal monetary metrics and bans storing calculated balances.
"""

import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.constants import categories
from app.database.base import Base

class TransactionDirection(str, enum.Enum):
    CREDIT = "CREDIT"  # Inflow
    DEBIT = "DEBIT"    # Outflow

class TransactionCategory(str, enum.Enum):
    INCOME_SALARY = categories.INCOME_SALARY
    INCOME_BUSINESS = categories.INCOME_BUSINESS
    INCOME_REMITTANCE = categories.INCOME_REMITTANCE
    EXPENSE_FOOD = categories.EXPENSE_FOOD
    EXPENSE_UTILITIES = categories.EXPENSE_UTILITIES
    EXPENSE_HEALTH = categories.EXPENSE_HEALTH
    EXPENSE_EDUCATION = categories.EXPENSE_EDUCATION
    EXPENSE_TRANSPORT = categories.EXPENSE_TRANSPORT
    EXPENSE_COMMISSION = categories.EXPENSE_COMMISSION
    SAVINGS = categories.SAVINGS
    INVESTMENT = categories.INVESTMENT

class Transaction(Base):
    """
    Transaction entity representing individual financial changes. Does not store balances.
    All balances are aggregated dynamically via Python service components.
    """
    __tablename__ = "transactions"

    __table_args__ = (
        # Reserved for future indexes and integrity constraints
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        nullable=False
    )
    fee: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        default=lambda: Decimal("0.00"),
        nullable=False
    )
    direction: Mapped[TransactionDirection] = mapped_column(
        SQLEnum(TransactionDirection, name="transactiondirection_enum"),
        nullable=False
    )
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory, name="transactioncategory_enum"),
        index=True,
        nullable=False
    )
    # May contain:
    # - a user-entered note
    # - an SMS description
    # - an AI-generated parsing summary
    narrative: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tx_id_external: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True) # Operator Transaction ID Reference
    ai_confidence: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(precision=5, scale=2, asdecimal=True),
        nullable=True
    )

    # The actual physical time the financial event occurred.
    # This may differ from created_at when historical SMS messages are imported or
    # when historical transactions are manually backdated and entered at a later stage.
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
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

    # Relationships
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount}, direction={self.direction})>"

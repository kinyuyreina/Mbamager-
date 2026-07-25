"""
Mbamager Account Domain Model

This module defines the SQLAlchemy 2.0 Account model representing separate storage silos
such as mobile wallets, cash, or banks.
"""

import enum
from datetime import datetime
from typing import List

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base

class AccountType(str, enum.Enum):
    CASH = "CASH"
    MOBILE_MONEY = "MOBILE_MONEY"
    BANK = "BANK"
    OTHER = "OTHER"

class AccountProvider(str, enum.Enum):
    MTN_MOMO = "MTN_MOMO"
    ORANGE_MONEY = "ORANGE_MONEY"
    CASH = "CASH"
    BANK = "BANK"
    OTHER = "OTHER"

class Account(Base):
    """
    Account entity representing financial repositories (mobile wallets, physical cash, or banks).
    """
    __tablename__ = "accounts"

    __table_args__ = (
        # Reserved for future indexes and constraints
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    # User-defined display name (e.g. "Main Wallet", "Savings Cash", "Orange SIM 2")
    # independent of the provider.
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    account_type: Mapped[AccountType] = mapped_column(
        SQLEnum(AccountType, name="accounttype_enum"),
        nullable=False
    )
    provider: Mapped[AccountProvider] = mapped_column(
        SQLEnum(AccountProvider, name="accountprovider_enum"),
        nullable=False
    )
    currency: Mapped[str] = mapped_column(String(3), default="XAF", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="accounts")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction",
        back_populates="account",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Account(id={self.id}, name='{self.name}', type={self.account_type})>"

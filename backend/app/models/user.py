"""
Mbamager User Domain Model

This module defines the SQLAlchemy 2.0 User model representing registered system users.

NOTE: Integer primary keys are intentionally used for the MVP to keep the implementation
simple. UUIDs are planned for a future major version if synchronization or distributed
deployments require globally unique identifiers.
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base

class User(Base):
    """
    User entity representing registered individuals or households using Mbamager.
    """
    __tablename__ = "users"

    __table_args__ = (
        # Reserved for future indexes and constraints
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Canonical format: +2376XXXXXXXX
    # All phone numbers must eventually be normalized to this format during schema
    # validation before being stored in the database.
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), unique=True, index=True, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(128), unique=True, index=True, nullable=True)
    username: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
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
    financial_profile: Mapped["FinancialProfile"] = relationship(
        "FinancialProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    accounts: Mapped[List["Account"]] = relationship(
        "Account",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    budgets: Mapped[List["Budget"]] = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    sms_messages: Mapped[List["SMSMessage"]] = relationship(
        "SMSMessage",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, phone={self.phone_number})>"

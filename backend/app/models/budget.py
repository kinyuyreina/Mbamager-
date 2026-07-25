"""
Mbamager Budget Domain Model

This module defines the SQLAlchemy 2.0 Budget model representing spending limit boundaries over
defined intervals.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.transaction import TransactionCategory

class Budget(Base):
    """
    Budget entity representing spending boundaries over given intervals.
    """
    __tablename__ = "budgets"

    __table_args__ = (
        # Reserved for future indexes and constraints
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    category: Mapped[TransactionCategory] = mapped_column(
        SQLEnum(TransactionCategory, name="budgetcategory_enum"),
        index=True,
        nullable=False
    )

    limit_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

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
    user: Mapped["User"] = relationship("User", back_populates="budgets")

    def __repr__(self) -> str:
        return f"<Budget(user_id={self.user_id}, category={self.category})>"

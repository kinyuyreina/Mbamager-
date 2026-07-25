"""
Mbamager Savings Goal Domain Model

This module defines the SQLAlchemy 2.0 SavingsGoal model.
"""

import enum
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import DateTime, Date, Enum as SQLEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base

class SavingsGoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class SavingsGoal(Base):
    """
    SavingsGoal entity representing a target saving bucket with target dates.
    """
    __tablename__ = "savings_goals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    target_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        nullable=False
    )
    current_amount: Mapped[Decimal] = mapped_column(
        Numeric(precision=18, scale=2, asdecimal=True),
        default=Decimal("0.00"),
        nullable=False
    )
    target_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[SavingsGoalStatus] = mapped_column(
        SQLEnum(SavingsGoalStatus, name="savingsgoalstatus_enum"),
        default=SavingsGoalStatus.ACTIVE,
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

    def __repr__(self) -> str:
        return f"<SavingsGoal(id={self.id}, name={self.name}, status={self.status.value})>"

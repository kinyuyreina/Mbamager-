"""
Mbamager Notification Domain Model

This module defines the SQLAlchemy 2.0 Notification model.
"""

import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base

class NotificationType(str, enum.Enum):
    LOW_BALANCE = "LOW_BALANCE"
    BUDGET_WARNING = "BUDGET_WARNING"
    GOAL_REACHED = "GOAL_REACHED"
    UNUSUAL_SPENDING = "UNUSUAL_SPENDING"
    RECURRING_PAYMENT = "RECURRING_PAYMENT"
    SMS_IMPORT_FAILED = "SMS_IMPORT_FAILED"

class Notification(Base):
    """
    Notification entity representing a user notification.
    """
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType, name="notificationtype_enum"),
        nullable=False
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.type.value}, is_read={self.is_read})>"

"""
Mbamager FinancialProfile Domain Model

This module defines the SQLAlchemy 2.0 FinancialProfile model representing user
configurations, preferences, and regional settings.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base

class FinancialProfile(Base):
    """
    FinancialProfile entity representing user preferences, regional settings,
    and systemic configurations.
    """
    __tablename__ = "financial_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )
    preferred_currency: Mapped[str] = mapped_column(String(3), default="XAF", nullable=False)
    language: Mapped[str] = mapped_column(String(5), default="en", nullable=False)
    risk_tolerance: Mapped[str] = mapped_column(String(16), default="MEDIUM", nullable=False) # LOW, MEDIUM, HIGH

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
    user: Mapped["User"] = relationship("User", back_populates="financial_profile")

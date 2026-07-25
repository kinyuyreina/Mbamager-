"""
Mbamager SMS Message Domain Model

This module defines the SQLAlchemy 2.0 SMSMessage model representing imported SMS messages.
"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database.base import Base

class SMSMessage(Base):
    """
    SMSMessage entity representing an imported SMS message from a mobile phone.
    """
    __tablename__ = "sms_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender: Mapped[str] = mapped_column(String(64), nullable=False)
    message_body: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    processed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
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
    user: Mapped["User"] = relationship("User", back_populates="sms_messages")

    def __repr__(self) -> str:
        return f"<SMSMessage(id={self.id}, user_id={self.user_id}, sender={self.sender}, processed={self.processed})>"

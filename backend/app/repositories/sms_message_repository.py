"""
Mbamager SMS Message Repository

This module defines the dedicated data access layer for SMSMessage entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sms_message import SMSMessage
from app.repositories.base import BaseRepository

class SMSMessageRepository(BaseRepository[SMSMessage]):
    """
    Repository handling data access operations for SMSMessage entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the SMSMessage repository with a database session.
        """
        super().__init__(db, SMSMessage)

    async def get_unprocessed(self, user_id: int) -> list[SMSMessage]:
        """
        Retrieve all unprocessed SMS messages for a given user.
        """
        stmt = (
            select(SMSMessage)
            .where(SMSMessage.user_id == user_id, SMSMessage.processed == False)
            .order_by(SMSMessage.received_at.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def mark_processed(self, message_id: int) -> SMSMessage | None:
        """
        Mark a specific SMS message as processed.
        """
        msg = await self.get_by_id(message_id)
        if msg:
            msg.processed = True
            await self.update(msg)
        return msg

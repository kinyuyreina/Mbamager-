"""
Mbamager Recurring Transaction Repository

This module defines the data access layer for RecurringTransaction entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recurring_transaction import RecurringTransaction
from app.repositories.base import BaseRepository

class RecurringTransactionRepository(BaseRepository[RecurringTransaction]):
    """
    Repository handling data access operations for RecurringTransaction entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize with session.
        """
        super().__init__(db, RecurringTransaction)

    async def get_by_user_id(self, user_id: int) -> list[RecurringTransaction]:
        """
        Retrieve all recurring transactions belonging to a user.
        """
        stmt = select(RecurringTransaction).where(RecurringTransaction.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_active_recurring(self) -> list[RecurringTransaction]:
        """
        Retrieve all active recurring transaction rules in the system.
        """
        stmt = select(RecurringTransaction).where(RecurringTransaction.active == True)
        result = await self.db.execute(stmt)
        return result.scalars().all()

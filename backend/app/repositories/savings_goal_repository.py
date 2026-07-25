"""
Mbamager Savings Goal Repository

This module defines the data access layer for SavingsGoal entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.savings_goal import SavingsGoal
from app.repositories.base import BaseRepository

class SavingsGoalRepository(BaseRepository[SavingsGoal]):
    """
    Repository handling data access operations for SavingsGoal entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize with session.
        """
        super().__init__(db, SavingsGoal)

    async def get_by_user_id(self, user_id: int) -> list[SavingsGoal]:
        """
        Retrieve all savings goals belonging to a user.
        """
        stmt = select(SavingsGoal).where(SavingsGoal.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

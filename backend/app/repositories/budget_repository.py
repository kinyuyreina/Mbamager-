"""
Mbamager Budget Repository

This module defines the dedicated data access layer for Budget entities.
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget import Budget
from app.models.transaction import TransactionCategory
from app.repositories.base import BaseRepository

class BudgetRepository(BaseRepository[Budget]):
    """
    Repository handling data access operations for Budget entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the Budget repository with a database session.
        """
        super().__init__(db, Budget)

    async def get_by_user_id(self, user_id: int) -> list[Budget]:
        """
        Retrieve all budgets belonging to a user.
        """
        stmt = select(Budget).where(Budget.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_category(
        self, user_id: int, category: TransactionCategory
    ) -> Budget | None:
        """
        Retrieve the budget for a specific category belonging to a user.
        """
        stmt = select(Budget).where(Budget.user_id == user_id, Budget.category == category)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active_budgets(self, user_id: int, current_date: date) -> list[Budget]:
        """
        Retrieve every budget whose date range includes the supplied date.
        """
        stmt = select(Budget).where(
            Budget.user_id == user_id,
            Budget.start_date <= current_date,
            Budget.end_date >= current_date,
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

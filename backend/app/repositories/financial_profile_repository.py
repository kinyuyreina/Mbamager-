"""
Mbamager Financial Profile Repository

This module defines the dedicated data access layer for FinancialProfile entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_profile import FinancialProfile
from app.repositories.base import BaseRepository

class FinancialProfileRepository(BaseRepository[FinancialProfile]):
    """
    Repository handling data access operations for FinancialProfile entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the FinancialProfile repository with a database session.
        """
        super().__init__(db, FinancialProfile)

    async def get_by_user_id(self, user_id: int) -> FinancialProfile | None:
        """
        Retrieve a single FinancialProfile by its associated user identifier.
        """
        stmt = select(FinancialProfile).where(FinancialProfile.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

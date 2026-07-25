"""
Mbamager Account Repository

This module defines the dedicated data access layer for Account entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.account import Account
from app.repositories.base import BaseRepository

class AccountRepository(BaseRepository[Account]):
    """
    Repository handling data access operations for Account entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the Account repository with a database session.
        """
        super().__init__(db, Account)

    async def get_by_user_id(self, user_id: int) -> list[Account]:
        """
        Retrieve all accounts belonging to a user.
        """
        stmt = select(Account).where(Account.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_active_accounts(self, user_id: int) -> list[Account]:
        """
        Retrieve only active accounts belonging to a user.
        """
        stmt = select(Account).where(Account.user_id == user_id, Account.is_active.is_(True))
        result = await self.db.execute(stmt)
        return result.scalars().all()

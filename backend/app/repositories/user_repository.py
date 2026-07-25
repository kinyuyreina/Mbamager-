"""
Mbamager User Repository

This module defines the dedicated data access layer for User entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """
    Repository handling data access operations for User entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the User repository with a database session.
        """
        super().__init__(db, User)

    async def get_by_phone_number(self, phone_number: str) -> User | None:
        """
        Retrieve a single User by their unique phone number.
        """
        stmt = select(User).where(User.phone_number == phone_number)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        """
        Retrieve a single User by their unique email address.
        """
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        """
        Retrieve a single User by their username.
        """
        stmt = select(User).where(User.username == username)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

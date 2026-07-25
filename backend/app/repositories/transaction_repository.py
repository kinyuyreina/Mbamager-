"""
Mbamager Transaction Repository

This module defines the dedicated data access layer for Transaction entities.
"""

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionCategory, TransactionDirection
from app.repositories.base import BaseRepository

class TransactionRepository(BaseRepository[Transaction]):
    """
    Repository handling data access operations for Transaction entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the Transaction repository with a database session.
        """
        super().__init__(db, Transaction)

    async def get_by_account_id(self, account_id: int) -> list[Transaction]:
        """
        Retrieve all transactions belonging to an account.
        """
        stmt = select(Transaction).where(Transaction.account_id == account_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_category(
        self, account_id: int, category: TransactionCategory
    ) -> list[Transaction]:
        """
        Retrieve all transactions of a given category for an account.
        """
        stmt = select(Transaction).where(
            Transaction.account_id == account_id, Transaction.category == category
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_direction(
        self, account_id: int, direction: TransactionDirection
    ) -> list[Transaction]:
        """
        Retrieve all CREDIT or DEBIT transactions for an account.
        """
        stmt = select(Transaction).where(
            Transaction.account_id == account_id, Transaction.direction == direction
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_date_range(
        self, account_id: int, start_date: date, end_date: date
    ) -> list[Transaction]:
        """
        Retrieve all transactions whose timestamp falls within the supplied inclusive date range.
        """
        stmt = select(Transaction).where(
            Transaction.account_id == account_id,
            Transaction.timestamp >= start_date,
            Transaction.timestamp <= end_date,
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

"""
Mbamager Password Reset OTP Repository

This module defines the dedicated data access layer for PasswordResetOTP entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.password_reset_otp import PasswordResetOTP
from app.repositories.base import BaseRepository

class PasswordResetOTPRepository(BaseRepository[PasswordResetOTP]):
    """
    Repository handling data access operations for PasswordResetOTP entities.
    """

    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the PasswordResetOTP repository with a database session.
        """
        super().__init__(db, PasswordResetOTP)

    async def get_active_otp(self, identifier: str) -> PasswordResetOTP | None:
        """
        Retrieve the latest active (unused) OTP for the specified identifier.
        """
        stmt = (
            select(PasswordResetOTP)
            .where(PasswordResetOTP.identifier == identifier)
            .where(PasswordResetOTP.used_flag == False)
            .order_by(PasswordResetOTP.created_at.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

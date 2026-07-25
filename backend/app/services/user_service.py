"""
Mbamager User Service

This module contains User-related business logic and repository coordination.
"""

from app.models.user import User
from app.repositories import UserRepository
from app.services.base_service import BaseService

class UserService(BaseService[User]):
    """
    Service handling User-related business logic and repository coordination.
    """

    def __init__(self, repository: UserRepository) -> None:
        """
        Initialize the UserService with a UserRepository.
        """
        super().__init__(repository)

    async def get_by_phone_number(self, phone_number: str) -> User | None:
        """
        Retrieve a single User by their unique phone number.
        """
        return await self.repository.get_by_phone_number(phone_number)

    async def get_by_username(self, username: str) -> User | None:
        """
        Retrieve a single User by their username.
        """
        return await self.repository.get_by_username(username)

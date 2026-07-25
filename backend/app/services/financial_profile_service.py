"""
Mbamager Financial Profile Service

This module contains FinancialProfile-related business logic and repository coordination.
"""

from app.models.financial_profile import FinancialProfile
from app.repositories import FinancialProfileRepository
from app.services.base_service import BaseService

class FinancialProfileService(BaseService[FinancialProfile]):
    """
    Service handling FinancialProfile-related business logic and repository coordination.
    """

    def __init__(self, repository: FinancialProfileRepository) -> None:
        """
        Initialize the FinancialProfileService with a FinancialProfileRepository.
        """
        super().__init__(repository)

    async def get_by_user_id(self, user_id: int) -> FinancialProfile | None:
        """
        Retrieve a FinancialProfile by the user identifier.
        """
        return await self.repository.get_by_user_id(user_id)

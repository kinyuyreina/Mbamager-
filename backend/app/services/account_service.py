"""
Mbamager Account Service

This module contains Account-related business logic and repository coordination.
"""

from app.models.account import Account
from app.repositories import AccountRepository
from app.schemas.account import AccountCreate, AccountUpdate
from app.services.base_service import BaseService

class AccountService(BaseService[Account]):
    """
    Service handling Account-related business logic and repository coordination.
    """

    def __init__(self, repository: AccountRepository) -> None:
        """
        Initialize the AccountService with an AccountRepository.
        """
        super().__init__(repository)

    async def get_by_user_id(self, user_id: int) -> list[Account]:
        """
        Retrieve all accounts belonging to a user.
        """
        return await self.repository.get_by_user_id(user_id)

    async def get_active_accounts(self, user_id: int) -> list[Account]:
        """
        Retrieve only active accounts belonging to a user.
        """
        return await self.repository.get_active_accounts(user_id)

    async def get_user_account(
        self,
        user_id: int,
        account_id: int,
    ) -> Account:
        """
        Retrieve the account by ID.
        Verify it exists and belongs to the supplied user.
        Raise ValueError("Account not found") if either check fails.
        """
        account = await self.repository.get_by_id(account_id)
        if not account or account.user_id != user_id:
            raise ValueError("Account not found")
        return account

    async def create_account(
        self,
        user_id: int,
        account_data: AccountCreate,
    ) -> Account:
        """
        Construct the Account model.
        Set user_id from the authenticated user.
        Copy every field from AccountCreate.
        Persist using the repository.
        """
        account = Account(
            user_id=user_id,
            name=account_data.name,
            account_type=account_data.account_type,
            provider=account_data.provider,
            currency=account_data.currency,
            is_active=account_data.is_active,
        )
        return await self.repository.create(account)

    async def update_account(
        self,
        user_id: int,
        account_id: int,
        account_data: AccountUpdate,
    ) -> Account:
        """
        Retrieve the user's account using get_user_account().
        Update only fields supplied by AccountUpdate.
        Persist using the repository.
        """
        account = await self.get_user_account(user_id, account_id)
        
        update_dict = account_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(account, key, value)
            
        return await self.repository.update(account)

    async def delete_account(
        self,
        user_id: int,
        account_id: int,
    ) -> None:
        """
        Retrieve the user's account using get_user_account().
        Delete it through the repository.
        """
        account = await self.get_user_account(user_id, account_id)
        await self.repository.delete(account)


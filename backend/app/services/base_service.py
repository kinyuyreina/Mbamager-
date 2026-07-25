"""
Mbamager Reusable Base Service

This module provides reusable business-layer functionality built on top of repositories.
"""

from typing import Generic, TypeVar

from app.repositories import BaseRepository

T = TypeVar("T")

class BaseService(Generic[T]):
    """
    Generic base service providing a standard foundation for business-layer operations.
    """

    def __init__(self, repository: BaseRepository[T]) -> None:
        """
        Initialize the base service with a repository instance.
        """
        self.repository = repository

    async def create(self, obj: T) -> T:
        """
        Create a new object by delegating to the repository.
        """
        return await self.repository.create(obj)

    async def get_by_id(self, id: int) -> T | None:
        """
        Retrieve an object by its unique identifier.
        """
        return await self.repository.get_by_id(id)

    async def get_all(self) -> list[T]:
        """
        Retrieve all objects.
        """
        return await self.repository.get_all()

    async def update(self, obj: T) -> T:
        """
        Update an existing object by delegating to the repository.
        """
        return await self.repository.update(obj)

    async def delete(self, obj: T) -> None:
        """
        Delete an existing object by delegating to the repository.
        """
        await self.repository.delete(obj)

    async def exists(self, id: int) -> bool:
        """
        Check if an object exists with the given identifier.
        """
        return await self.repository.exists(id)

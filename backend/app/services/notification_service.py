"""
Mbamager Notification Service

This module defines the business logic and orchestration for system notifications.
"""

from app.models.notification import Notification, NotificationType
from app.repositories.notification_repository import NotificationRepository
from app.services.base_service import BaseService

class NotificationService(BaseService[Notification]):
    """
    Service layer coordinating CRUD and trigger generation for system Notifications.
    """

    def __init__(self, repository: NotificationRepository) -> None:
        """
        Initialize with repository.
        """
        super().__init__(repository)

    async def get_by_user_id(self, user_id: int) -> list[Notification]:
        """
        Retrieve all notifications belonging to a user.
        """
        return await self.repository.get_by_user_id(user_id)

    async def get_unread_by_user_id(self, user_id: int) -> list[Notification]:
        """
        Retrieve unread notifications belonging to a user.
        """
        return await self.repository.get_unread_by_user_id(user_id)

    async def create_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        type: NotificationType,
    ) -> Notification:
        """
        Create and persist a new user notification.
        """
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            is_read=False,
        )
        return await self.repository.create(notification)

    async def mark_as_read(self, user_id: int, notification_id: int) -> Notification:
        """
        Mark a specific notification as read.
        """
        notification = await self.repository.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise ValueError("Notification not found")
        notification.is_read = True
        return await self.repository.update(notification)

    async def mark_all_as_read(self, user_id: int) -> None:
        """
        Mark all unread notifications of a user as read.
        """
        unread = await self.repository.get_unread_by_user_id(user_id)
        for notif in unread:
            notif.is_read = True
            await self.repository.update(notif)

    async def delete_notification(self, user_id: int, notification_id: int) -> None:
        """
        Delete a notification after verifying user ownership.
        """
        notification = await self.repository.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise ValueError("Notification not found")
        await self.repository.delete(notification)

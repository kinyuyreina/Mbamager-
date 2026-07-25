"""
Mbamager Notification Schemas

This module defines Pydantic validation schemas for Notification operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import Field

from app.models.notification import NotificationType
from app.schemas.common import BaseSchema

class NotificationUpdate(BaseSchema):
    is_read: Optional[bool] = Field(default=None, description="Mark as read/unread")

class NotificationResponse(BaseSchema):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

"""
Mbamager Common Pydantic Schemas

This module defines common and reusable Pydantic v2 schemas used across the application.
"""

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")

class BaseSchema(BaseModel):
    """
    Base schema configuration for all Mbamager Pydantic models.
    Enforces automatic whitespace trimming and ORM model mapping (from_attributes).
    """
    model_config = ConfigDict(
        str_strip_whitespace=True,
        from_attributes=True
    )

class TimestampSchema(BaseSchema):
    """
    Schema mixin for entities containing standard audit timestamps.
    """
    created_at: datetime
    updated_at: datetime

class PaginationParams(BaseSchema):
    """
    Query parameters used for paginating collections.
    """
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")

class PaginatedResponse(BaseSchema, Generic[T]):
    """
    Standard envelope for all paginated collection responses.
    """
    items: list[T]
    total: int = Field(..., ge=0, description="Total number of matching records")
    page: int = Field(..., ge=1, description="Current page number")
    limit: int = Field(..., ge=1, description="Current page size limit")
    pages: int = Field(..., ge=0, description="Total pages available")

class MessageResponse(BaseSchema):
    """
    Standard structure for generic status or message responses.
    """
    message: str = Field(..., description="Human-readable response message")

class SuccessResponse(MessageResponse):
    """
    Standard successful API response.
    """
    success: bool = True

class ErrorResponse(BaseSchema):
    """
    Standard API error payload.
    """
    detail: str

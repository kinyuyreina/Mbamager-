"""
Mbamager SMS Schemas

This module defines Pydantic schemas for SMS messages import and retrieval.
"""

from datetime import datetime
from pydantic import Field

from app.schemas.common import BaseSchema

class SMSImportRequest(BaseSchema):
    """
    Schema for importing a single SMS message.
    """
    sender: str = Field(..., description="The sender identifier or number of the SMS")
    message_body: str = Field(..., description="The complete text content of the SMS")
    received_at: datetime = Field(..., description="The timestamp when the SMS was received on the device")

class SMSMessageResponse(BaseSchema):
    """
    Schema for returning saved SMS message details.
    """
    id: int = Field(..., description="Unique identifier of the saved SMS record")
    user_id: int = Field(..., description="Identifier of the user who owns this message")
    sender: str = Field(..., description="The sender of the SMS")
    message_body: str = Field(..., description="The complete text content of the SMS")
    received_at: datetime = Field(..., description="The timestamp when the SMS was received")
    processed: bool = Field(..., description="True if the SMS has been parsed and integrated")
    created_at: datetime = Field(..., description="Database record creation timestamp")
    updated_at: datetime = Field(..., description="Database record last update timestamp")

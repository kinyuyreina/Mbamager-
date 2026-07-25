"""
Mbamager FinancialProfile Pydantic Schemas

This module defines Pydantic schemas for the FinancialProfile model.
"""

import enum

from pydantic import Field

from app.schemas.common import BaseSchema, TimestampSchema

class RiskTolerance(str, enum.Enum):
    """
    Strongly typed definition for user risk profile evaluation levels.
    """
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class FinancialProfileBase(BaseSchema):
    """
    Shared attributes for user financial preferences and localization settings.
    """
    preferred_currency: str = Field(
        default="XAF",
        min_length=3,
        max_length=3,
        pattern=r"^[A-Z]{3}$",
        description="Standard ISO 4217 Currency Code"
    )
    language: str = Field(
        default="en",
        min_length=2,
        max_length=5,
        description="User preferred localization code following the BCP-47 language tag standard (e.g. en, fr, fr-FR)"
    )
    risk_tolerance: RiskTolerance = Field(
        default=RiskTolerance.MEDIUM,
        description="Level of risk comfort used for dynamic profiling"
    )

class FinancialProfileCreate(FinancialProfileBase):
    """
    Payload for establishing a new financial profile.
    Requires a valid user_id.
    """
    user_id: int = Field(..., description="Unique user identifier owner of the profile")

class FinancialProfileUpdate(BaseSchema):
    """
    Payload for updating an existing financial profile. All fields are optional.
    """
    preferred_currency: str | None = Field(
        default=None,
        min_length=3,
        max_length=3,
        pattern=r"^[A-Z]{3}$",
        description="Standard ISO 4217 Currency Code"
    )
    language: str | None = Field(
        default=None,
        min_length=2,
        max_length=5,
        description="User preferred localization code following the BCP-47 language tag standard (e.g. en, fr, fr-FR)"
    )
    risk_tolerance: RiskTolerance | None = Field(
        default=None,
        description="Level of risk comfort used for dynamic profiling"
    )

class FinancialProfileResponse(FinancialProfileBase, TimestampSchema):
    """
    Public schema for returning a financial profile entity.
    """
    id: int = Field(..., description="Unique auto-incrementing profile identifier")
    user_id: int = Field(..., description="Unique user identifier owner of the profile")

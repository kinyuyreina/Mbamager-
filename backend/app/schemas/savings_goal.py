"""
Mbamager Savings Goal Schemas

This module defines Pydantic validation schemas for SavingsGoal operations.
"""

from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import Field

from app.models.savings_goal import SavingsGoalStatus
from app.schemas.common import BaseSchema, TimestampSchema

class SavingsGoalCreate(BaseSchema):
    name: str = Field(..., max_length=128, description="The name of the savings goal")
    target_amount: Decimal = Field(..., gt=0, description="The target savings amount")
    current_amount: Decimal = Field(default=Decimal("0.00"), ge=0, description="The current savings amount")
    target_date: date = Field(..., description="Target date to achieve the goal")

class SavingsGoalUpdate(BaseSchema):
    name: Optional[str] = Field(default=None, max_length=128, description="The name of the savings goal")
    target_amount: Optional[Decimal] = Field(default=None, gt=0, description="The target savings amount")
    current_amount: Optional[Decimal] = Field(default=None, ge=0, description="The current savings amount")
    target_date: Optional[date] = Field(default=None, description="Target date to achieve the goal")
    status: Optional[SavingsGoalStatus] = Field(default=None, description="The status of the goal")

class SavingsGoalResponse(TimestampSchema):
    id: int
    user_id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    target_date: date
    status: SavingsGoalStatus

class SavingsGoalProgressResponse(BaseSchema):
    goal_id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    remaining_amount: Decimal
    percentage_completed: Decimal
    target_date: date
    status: SavingsGoalStatus
    monthly_contribution_recommended: Decimal

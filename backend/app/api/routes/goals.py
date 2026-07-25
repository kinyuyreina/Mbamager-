"""
Mbamager Savings Goal Router

This module defines FastAPI endpoints for managing User savings goals and tracking progress.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_current_user, get_savings_goal_service
from app.models.user import User
from app.schemas.savings_goal import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalResponse,
    SavingsGoalProgressResponse,
)
from app.services.savings_goal_service import SavingsGoalService

router = APIRouter(prefix="/goals", tags=["Savings Goals"])

@router.post("", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> SavingsGoalResponse:
    """
    Create a new savings goal for the authenticated user.
    """
    return await savings_goal_service.create_goal(current_user.id, goal_in)

@router.get("", response_model=list[SavingsGoalResponse])
async def list_goals(
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> list[SavingsGoalResponse]:
    """
    List all savings goals belonging to the authenticated user.
    """
    return await savings_goal_service.get_user_goals(current_user.id)

@router.get("/{goal_id}", response_model=SavingsGoalResponse)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> SavingsGoalResponse:
    """
    Retrieve details of a specific savings goal.
    """
    try:
        return await savings_goal_service.get_goal(current_user.id, goal_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.put("/{goal_id}", response_model=SavingsGoalResponse)
async def update_goal(
    goal_id: int,
    goal_in: SavingsGoalUpdate,
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> SavingsGoalResponse:
    """
    Update an existing savings goal.
    """
    try:
        return await savings_goal_service.update_goal(current_user.id, goal_id, goal_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> None:
    """
    Delete a specific savings goal.
    """
    try:
        await savings_goal_service.delete_goal(current_user.id, goal_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.get("/{goal_id}/progress", response_model=SavingsGoalProgressResponse)
async def get_goal_progress(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    savings_goal_service: SavingsGoalService = Depends(get_savings_goal_service),
) -> SavingsGoalProgressResponse:
    """
    Calculate and return complete metrics for a savings goal,
    including the recommended monthly savings rate to meet the deadline.
    """
    try:
        return await savings_goal_service.calculate_progress(current_user.id, goal_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

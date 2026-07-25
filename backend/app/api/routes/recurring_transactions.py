"""
Mbamager Recurring Transaction Router

This module defines FastAPI endpoints for managing recurring transaction schedules and templates.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_current_user, get_recurring_transaction_service
from app.models.user import User
from app.schemas.recurring_transaction import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringTransactionResponse,
)
from app.schemas.common import SuccessResponse
from app.services.recurring_transaction_service import RecurringTransactionService

router = APIRouter(prefix="/recurring-transactions", tags=["Recurring Transactions"])

@router.post("", response_model=RecurringTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_recurring(
    recurring_in: RecurringTransactionCreate,
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> RecurringTransactionResponse:
    """
    Create a new recurring transaction template.
    """
    try:
        return await recurring_service.create_recurring(current_user.id, recurring_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("", response_model=list[RecurringTransactionResponse])
async def list_recurring(
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> list[RecurringTransactionResponse]:
    """
    List all recurring transaction templates belonging to the authenticated user.
    """
    return await recurring_service.get_user_recurring(current_user.id)

@router.get("/{recurring_id}", response_model=RecurringTransactionResponse)
async def get_recurring(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> RecurringTransactionResponse:
    """
    Retrieve details of a specific recurring transaction template.
    """
    try:
        return await recurring_service.get_recurring(current_user.id, recurring_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.put("/{recurring_id}", response_model=RecurringTransactionResponse)
async def update_recurring(
    recurring_id: int,
    recurring_in: RecurringTransactionUpdate,
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> RecurringTransactionResponse:
    """
    Update an existing recurring transaction template.
    """
    try:
        return await recurring_service.update_recurring(current_user.id, recurring_id, recurring_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.delete("/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recurring(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> None:
    """
    Delete a specific recurring transaction template.
    """
    try:
        await recurring_service.delete_recurring(current_user.id, recurring_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

@router.post("/process", response_model=SuccessResponse)
async def process_recurring(
    current_user: User = Depends(get_current_user),
    recurring_service: RecurringTransactionService = Depends(get_recurring_transaction_service),
) -> SuccessResponse:
    """
    Manually trigger the evaluation of all active schedules to post transactions for today.
    """
    processed = await recurring_service.process_due_transactions()
    return SuccessResponse(message=f"Recurring processing completed. Created {processed} transactions.")

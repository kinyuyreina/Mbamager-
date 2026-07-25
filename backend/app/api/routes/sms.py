"""
Mbamager SMS Transaction Import Router

This module defines FastAPI route handlers for SMS parsing, automated import,
and reprocessing endpoints. It coordinates authentication and service calls.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_sms_service, get_current_user
from app.core.rate_limiter import limit_sms, limit_ai
from app.models.user import User
from app.models.sms_message import SMSMessage
from app.schemas.sms import SMSImportRequest, SMSMessageResponse
from app.services.sms_service import SMSService

router = APIRouter(prefix="/sms", tags=["SMS"])

@router.post("/import", response_model=SMSMessageResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(limit_sms)])
async def import_single_sms(
    sms_data: SMSImportRequest,
    current_user: User = Depends(get_current_user),
    sms_service: SMSService = Depends(get_sms_service),
) -> SMSMessage:
    """
    Import a single SMS message, parse it, automatically create a transaction if eligible,
    and persist the message state.
    """
    try:
        sms = await sms_service.import_sms(user_id=current_user.id, sms_data=sms_data)
        return sms
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/import/batch", response_model=list[SMSMessageResponse], status_code=status.HTTP_201_CREATED, dependencies=[Depends(limit_sms)])
async def import_batch_sms(
    batch_data: list[SMSImportRequest],
    current_user: User = Depends(get_current_user),
    sms_service: SMSService = Depends(get_sms_service),
) -> list[SMSMessage]:
    """
    Import a batch of SMS messages, processing each sequentially.
    """
    results: list[SMSMessage] = []
    for sms_data in batch_data:
        try:
            sms = await sms_service.import_sms(user_id=current_user.id, sms_data=sms_data)
            results.append(sms)
        except ValueError as e:
            # We raise a 400 bad request for the batch if any critical validation fails (e.g. account missing)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Batch import failed: {str(e)}"
            )
    return results

@router.get("/unprocessed", response_model=list[SMSMessageResponse])
async def get_unprocessed_sms(
    current_user: User = Depends(get_current_user),
    sms_service: SMSService = Depends(get_sms_service),
) -> list[SMSMessage]:
    """
    Retrieve all unprocessed SMS messages for the authenticated user.
    """
    return await sms_service.get_unprocessed(user_id=current_user.id)

@router.post("/{id}/process", response_model=SMSMessageResponse, dependencies=[Depends(limit_ai)])
async def process_stored_sms(
    id: int,
    current_user: User = Depends(get_current_user),
    sms_service: SMSService = Depends(get_sms_service),
) -> SMSMessage:
    """
    Trigger manual reprocessing of a specific stored SMS by its ID.
    """
    try:
        sms = await sms_service.process_stored_sms(user_id=current_user.id, message_id=id)
        return sms
    except ValueError as e:
        # Check if the error indicates "not found"
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import Response

from app.database.store import store
from app.models.schemas import (
    ApplicationCreate,
    ApplicationListItem,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationUpdate,
)
from app.utils.validation import validate_attachment, validate_pesel

router = APIRouter(prefix="/api/applications", tags=["applications"])


def format_error_response(message: str, field_errors: Optional[dict] = None) -> dict:
    """Format consistent error response."""
    return {
        "message": message,
        "fieldErrors": field_errors or {},
    }


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ApplicationResponse)
async def create_application(application: ApplicationCreate):
    """Create a new application with optional attachments."""
    # Validate PESEL
    pesel = application.form_data.poszkodowany.pesel
    pesel_valid, pesel_error = validate_pesel(pesel)
    if not pesel_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response("Validation failed", {"pesel": pesel_error}),
        )
    
    # Validate attachments if provided (before creating application)
    if application.attachments:
        for att_data in application.attachments:
            att_valid, att_error, size_bytes = validate_attachment(att_data)
            if not att_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=format_error_response("Attachment validation failed", {"attachment": att_error}),
                )
    
    # Create application first
    app = store.create_application(
        form_data=application.form_data,
        status=application.status,
    )
    
    # Now create attachments if provided (with correct app_id)
    if application.attachments:
        for att_data in application.attachments:
            att = store.create_attachment(
                app_id=app["id"],
                title=att_data["title"],
                mime_type=att_data["mime_type"],
                data_base64=att_data["data"],
            )
    
    # Refresh app to get updated attachment_ids
    app = store.get_application(app["id"])
    
    return ApplicationResponse(**app)


@router.get("", response_model=ApplicationListResponse)
async def list_applications(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    pesel: Optional[str] = Query(None, description="Filter by PESEL"),
    date_from: Optional[datetime] = Query(None, description="Filter from date"),
    date_to: Optional[datetime] = Query(None, description="Filter to date"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """List applications with pagination and filters."""
    items, total = store.list_applications(
        page=page,
        page_size=page_size,
        pesel=pesel,
        date_from=date_from,
        date_to=date_to,
        status=status,
    )
    
    # Convert to list items with summary
    list_items = []
    for item in items:
        # Create brief summary from accident details
        summary = None
        if item.get("form_data", {}).get("szczegoly"):
            szczegoly = item["form_data"]["szczegoly"]
            summary = f"{szczegoly.get('miejsce', '')} - {szczegoly.get('opis_urazow', '')[:50]}"
            if len(szczegoly.get("opis_urazow", "")) > 50:
                summary += "..."
        
        list_items.append(
            ApplicationListItem(
                id=item["id"],
                pesel=item["pesel"],
                created_at=item["created_at"],
                status=item.get("status"),
                ai_suggestion=item.get("ai_suggestion"),
                summary=summary,
                attachment_count=len(item.get("attachment_ids", [])),
            )
        )
    
    return ApplicationListResponse(
        items=list_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(app_id: str):
    """Get a single application by ID."""
    app = store.get_application(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    return ApplicationResponse(**app)


@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(app_id: str, update: ApplicationUpdate):
    """Update an application."""
    # Validate PESEL if form_data is being updated
    if update.form_data:
        pesel = update.form_data.poszkodowany.pesel
        pesel_valid, pesel_error = validate_pesel(pesel)
        if not pesel_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=format_error_response("Validation failed", {"pesel": pesel_error}),
            )
    
    app = store.update_application(
        app_id=app_id,
        form_data=update.form_data,
        ai_suggestion=update.ai_suggestion,
        ai_comments=update.ai_comments,
        status=update.status,
    )
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    return ApplicationResponse(**app)


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(app_id: str):
    """Hard delete an application and all its attachments."""
    deleted = store.delete_application(app_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


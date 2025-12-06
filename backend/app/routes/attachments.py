from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response

from app.database.store import store
from app.models.schemas import AttachmentCreate, AttachmentListResponse, AttachmentMetadata
from app.utils.validation import validate_attachment

router = APIRouter(prefix="/api/applications", tags=["attachments"])


def format_error_response(message: str, field_errors: dict = None) -> dict:
    """Format consistent error response."""
    return {
        "message": message,
        "fieldErrors": field_errors or {},
    }


@router.post("/{app_id}/attachments", status_code=status.HTTP_201_CREATED)
async def create_attachment(app_id: str, attachment: AttachmentCreate):
    """Add an attachment to an application."""
    # Validate attachment
    att_data = {
        "title": attachment.title,
        "mime_type": attachment.mime_type,
        "data": attachment.data,
    }
    att_valid, att_error, size_bytes = validate_attachment(att_data)
    if not att_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response("Attachment validation failed", {"attachment": att_error}),
        )
    
    # Check if application exists
    app = store.get_application(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    # Create attachment
    att = store.create_attachment(
        app_id=app_id,
        title=attachment.title,
        mime_type=attachment.mime_type,
        data_base64=attachment.data,
    )
    
    if not att:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=format_error_response("Failed to create attachment"),
        )
    
    # Return attachment metadata and updated list
    attachments = store.get_application_attachments(app_id)
    metadata_list = [
        AttachmentMetadata(
            id=att["id"],
            title=att["title"],
            mime_type=att["mime_type"],
            size_bytes=att["size_bytes"],
            created_at=att["created_at"],
        )
        for att in attachments
    ]
    
    return {
        "attachment": AttachmentMetadata(
            id=att["id"],
            title=att["title"],
            mime_type=att["mime_type"],
            size_bytes=att["size_bytes"],
            created_at=att["created_at"],
        ),
        "attachments": AttachmentListResponse(attachments=metadata_list),
    }


@router.get("/{app_id}/attachments", response_model=AttachmentListResponse)
async def list_attachments(app_id: str):
    """List all attachments for an application."""
    # Check if application exists
    app = store.get_application(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    attachments = store.get_application_attachments(app_id)
    metadata_list = [
        AttachmentMetadata(
            id=att["id"],
            title=att["title"],
            mime_type=att["mime_type"],
            size_bytes=att["size_bytes"],
            created_at=att["created_at"],
        )
        for att in attachments
    ]
    
    return AttachmentListResponse(attachments=metadata_list)


@router.get("/{app_id}/attachments/{attachment_id}")
async def get_attachment(app_id: str, attachment_id: str):
    """Stream binary attachment with proper headers."""
    # Check if application exists
    app = store.get_application(app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Application with id '{app_id}' not found"),
        )
    
    # Check if attachment belongs to application
    if attachment_id not in app.get("attachment_ids", []):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Attachment with id '{attachment_id}' not found in application"),
        )
    
    # Get attachment
    att = store.get_attachment(attachment_id)
    if not att:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(f"Attachment with id '{attachment_id}' not found"),
        )
    
    # Return binary data with proper headers
    return Response(
        content=att["data"],
        media_type=att["mime_type"],
        headers={
            "Content-Disposition": f'attachment; filename="{att["title"]}"',
        },
    )


@router.delete("/{app_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(app_id: str, attachment_id: str):
    """Delete an attachment from an application."""
    deleted = store.delete_attachment(app_id, attachment_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=format_error_response(
                f"Attachment with id '{attachment_id}' not found in application '{app_id}'"
            ),
        )
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


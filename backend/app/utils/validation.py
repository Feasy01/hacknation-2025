import base64
import re
from typing import Optional, Tuple

# Allowed MIME types for attachments
ALLOWED_MIME_TYPES = [
    # Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # .xlsx
    # Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/tiff",
]

MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def validate_pesel(pesel: str) -> Tuple[bool, Optional[str]]:
    """
    Validate PESEL format and checksum.
    Returns (is_valid, error_message)
    """
    if not pesel:
        return False, "PESEL is required"
    
    # PESEL should be 11 digits
    if not re.match(r"^\d{11}$", pesel):
        return False, "PESEL must be exactly 11 digits"
    
    # Basic checksum validation (simplified - full validation would check date validity)
    digits = [int(d) for d in pesel]
    weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    checksum = sum(d * w for d, w in zip(digits[:10], weights)) % 10
    if checksum != 0:
        checksum = 10 - checksum
    if checksum != digits[10]:
        return False, "PESEL checksum is invalid"
    
    return True, None


def validate_mime_type(mime_type: str) -> Tuple[bool, Optional[str]]:
    """Validate that MIME type is in the allowed list."""
    if mime_type not in ALLOWED_MIME_TYPES:
        return False, f"MIME type '{mime_type}' is not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
    return True, None


def validate_attachment_size(data_base64: str) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Validate attachment size from base64 data.
    Returns (is_valid, error_message, size_bytes)
    """
    try:
        # Decode base64 to get actual size
        data_bytes = base64.b64decode(data_base64)
        size_bytes = len(data_bytes)
        
        if size_bytes > MAX_ATTACHMENT_SIZE_BYTES:
            return False, f"Attachment size ({size_bytes} bytes) exceeds maximum allowed size ({MAX_ATTACHMENT_SIZE_BYTES} bytes)", None
        
        return True, None, size_bytes
    except Exception as e:
        return False, f"Invalid base64 data: {str(e)}", None


def validate_attachment(data: dict) -> Tuple[bool, Optional[str], Optional[int]]:
    """
    Validate an attachment payload.
    Returns (is_valid, error_message, size_bytes)
    """
    required_fields = ["title", "mime_type", "data"]
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}", None
    
    # Validate MIME type
    mime_valid, mime_error = validate_mime_type(data["mime_type"])
    if not mime_valid:
        return False, mime_error, None
    
    # Validate size
    size_valid, size_error, size_bytes = validate_attachment_size(data["data"])
    if not size_valid:
        return False, size_error, None
    
    return True, None, size_bytes


import base64
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.zus_accident_analyse import zus_accident_analyse
from app.utils.validation import validate_mime_type, validate_attachment_size

router = APIRouter(prefix="/api/zus-accidents", tags=["zus-accidents"])

logger = logging.getLogger(__name__)


class FileInput(BaseModel):
    filename: str
    mime_type: str
    data: str  # base64 encoded


class AnalyseRequest(BaseModel):
    files: List[FileInput]


class AnalyseResponse(BaseModel):
    grade: str
    grade_code: str  # "yes" | "no" | "uncertain" | "insufficient"
    justification: str
    circumstances: Optional[str] = None
    anomalies: Optional[str] = None
    raw: Optional[dict] = None


def format_error_response(message: str, field_errors: Optional[dict] = None) -> dict:
    """Format consistent error response."""
    return {
        "message": message,
        "fieldErrors": field_errors or {},
    }


def map_grade_to_code(grade: str) -> str:
    """Map grade text to grade_code."""
    grade_lower = grade.lower()
    if "tak, jest to wypadek" in grade_lower or "tak" in grade_lower:
        return "yes"
    elif "nie, nie jest to wypadek" in grade_lower or ("nie" in grade_lower and "wątpliwy" not in grade_lower):
        return "no"
    elif "nie mam wystarczających informacji" in grade_lower or "insufficient" in grade_lower:
        return "insufficient"
    elif "wątpliwy" in grade_lower or "nie mam 100% pewności" in grade_lower:
        return "uncertain"
    else:
        # Default to uncertain if unclear
        return "uncertain"


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse_accident(request: AnalyseRequest):
    """
    Analyze accident case based on uploaded documents.
    No persistence - files are processed in memory only.
    """
    # Validate at least one file
    if not request.files or len(request.files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response("At least one file is required", {"files": "At least one file is required"}),
        )
    
    # Validate and decode files
    file_errors = {}
    source_files_bytes = []
    mime_types = []
    
    for idx, file_input in enumerate(request.files):
        # Validate MIME type
        mime_valid, mime_error = validate_mime_type(file_input.mime_type)
        if not mime_valid:
            file_errors[f"files[{idx}].mime_type"] = mime_error
            continue
        
        # Validate size
        size_valid, size_error, _ = validate_attachment_size(file_input.data)
        if not size_valid:
            file_errors[f"files[{idx}].size"] = size_error
            continue
        
        # Decode base64 to bytes
        try:
            file_bytes = base64.b64decode(file_input.data)
            source_files_bytes.append(file_bytes)
            mime_types.append(file_input.mime_type)
        except Exception as e:
            file_errors[f"files[{idx}].data"] = f"Invalid base64 data: {str(e)}"
            continue
    
    # If there are validation errors, return them
    if file_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response("File validation failed", file_errors),
        )
    
    # If no valid files after validation, error
    if not source_files_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=format_error_response("No valid files provided"),
        )
    
    # Call analysis service
    try:
        raw_response_text = zus_accident_analyse(source_files_bytes, mime_types)
        
        # Parse JSON response
        try:
            raw_response = json.loads(raw_response_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse analysis response as JSON: {e}, raw: {raw_response_text[:500]}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=format_error_response("Invalid response from analysis service"),
            )
        
        # Extract fields with defaults
        grade = raw_response.get("grade", "Nie mam wystarczających informacji, aby ocenić, czy jest to wypadek przy pracy")
        justification = raw_response.get("justification", "")
        circumstances = raw_response.get("circumstances")
        anomalies = raw_response.get("anomalies")
        
        # Map grade to code
        grade_code = map_grade_to_code(grade)
        
        return AnalyseResponse(
            grade=grade,
            grade_code=grade_code,
            justification=justification,
            circumstances=circumstances,
            anomalies=anomalies,
            raw=raw_response,
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.exception(f"Error during accident analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=format_error_response("An error occurred during analysis. Please try again."),
        )


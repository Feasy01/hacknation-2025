"""
ElevenLabs webhook endpoint for receiving agent conversation data.
"""
import asyncio
import json
from typing import Dict, Optional, Any, List
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.services.form_state import (
    apply_form_updates,
    get_initial_form_data,
    validate_form_data,
)
from app.services.form_analysis import analyze_form_data
from app.models.schemas import AccidentReportFormData

router = APIRouter(prefix="/api/elevenlabs", tags=["elevenlabs"])

# In-memory session storage for ElevenLabs conversations
# Maps conversation_id to form session data
elevenlabs_sessions: Dict[str, dict] = {}


class SSEManager:
    """Simple manager for per-conversation SSE subscribers."""

    def __init__(self):
        self.connections: Dict[str, List[asyncio.Queue]] = {}

    async def connect(self, conversation_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self.connections.setdefault(conversation_id, []).append(queue)
        return queue

    async def disconnect(self, conversation_id: str, queue: asyncio.Queue) -> None:
        listeners = self.connections.get(conversation_id, [])
        if queue in listeners:
            listeners.remove(queue)
        if not listeners and conversation_id in self.connections:
            self.connections.pop(conversation_id, None)

    async def publish(self, conversation_id: str, data: dict) -> None:
        listeners = self.connections.get(conversation_id, [])
        for queue in list(listeners):
            try:
                queue.put_nowait(data)
            except asyncio.QueueFull:
                # Skip backpressure handling for now; drop the message
                pass

    def listener_count(self, conversation_id: str) -> int:
        return len(self.connections.get(conversation_id, []))


sse_manager = SSEManager()


class ElevenLabsWebhookPayload(BaseModel):
    """Webhook payload model for form state updates."""
    conversation_id: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    serialized_form_data: Optional[str] = None


class ManualSyncPayload(BaseModel):
    """Payload model for manual form state syncs from the UI."""
    form_data: AccidentReportFormData
    analyse: Optional[bool] = False  # If True, trigger analysis after sync


def build_form_state_message(conversation_id: str, session: dict) -> dict:
    """Prepare a serializable form state payload for SSE."""
    form_data: AccidentReportFormData = session["form_data"]
    return {
        "type": "form_update",
        "conversation_id": conversation_id,
        "form_data": form_data.model_dump(),
        "validation_errors": session.get("validation_errors", {}),
        "ai_notes": session.get("ai_notes", []),
        "timestamp": datetime.now().isoformat(),
    }


def format_sse_event(data: dict) -> str:
    """Format data as an SSE event string."""
    return f"data: {json.dumps(data, default=str)}\n\n"


def ensure_session(conversation_id: str) -> dict:
    """Get or create a session for a conversation."""
    if conversation_id not in elevenlabs_sessions:
        elevenlabs_sessions[conversation_id] = {
            "form_data": get_initial_form_data(),
            "conversation_id": conversation_id,
            "created_at": datetime.now(),
        }
    return elevenlabs_sessions[conversation_id]


@router.post("/webhook")
async def elevenlabs_webhook(request: Request):
    """
    Receive webhook events from ElevenLabs agent to update form state.
    
    Expected payload structure:
    - conversation_id: Unique conversation identifier (optional if provided as query param callId)
    - form_data: Form field updates (dot-notation paths)
    
    This endpoint updates the form state based on the provided form_data.
    """
    try:
        # Parse request body
        body = await request.json()
        
        # Log for debugging
        print(f"[ElevenLabs Webhook] Received: {json.dumps(body, indent=2)}")
        
        # Validate payload structure
        payload = ElevenLabsWebhookPayload(**body)
        # Prefer conversation id passed as query param (callId) and fall back to payload
        conversation_id = (
            request.query_params.get("callId")
            or payload.conversation_id
            or "default"
        )
        
        # Initialize session if needed
        session = ensure_session(conversation_id)
        
        # Process form data updates
        form_updates = payload.form_data

        # ElevenLabs can send a JSON string with dot-notation keys (serialized_form_data)
        if not form_updates and payload.serialized_form_data:
            try:
                form_updates = json.loads(payload.serialized_form_data)
            except json.JSONDecodeError:
                print("[ElevenLabs Webhook] Could not parse serialized_form_data payload.")

        if form_updates:
            try:
                form_data = session["form_data"]
                
                # Apply updates using dot-notation paths
                if isinstance(form_updates, dict):
                    form_data = apply_form_updates(form_data, form_updates)
                    session["form_data"] = form_data
                    session["updated_at"] = datetime.now()
                    
                    # Validate updated form
                    validation = validate_form_data(form_data)
                    session["validation_errors"] = validation
                    
                    # Remove AI notes when form is updated by LLM via webhook
                    # This ensures old notes don't persist after form changes
                    if "ai_notes" in session:
                        session.pop("ai_notes")
                    if "analysis_updated_at" in session:
                        session.pop("analysis_updated_at")
                    
            except Exception as e:
                print(f"[ElevenLabs Webhook] Error applying form updates: {e}")
                # Continue processing even if form update fails
        
        session["last_updated"] = datetime.now()

        # Notify listeners via SSE
        await sse_manager.publish(
            conversation_id,
            build_form_state_message(conversation_id, session),
        )
        
        # Return success response
        return {
            "success": True,
            "conversation_id": conversation_id,
            "message": "Webhook processed successfully",
            "form_state": {
                "has_data": any(
                    field_value not in (None, "", [])
                    for field_value in session["form_data"].model_dump().values()
                ),
                "validation_errors": session.get("validation_errors", {}),
            },
        }
        
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )
    except Exception as e:
        print(f"[ElevenLabs Webhook] Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}",
        )


@router.post("/conversation/{conversation_id}/sync")
async def sync_conversation_state(conversation_id: str, payload: ManualSyncPayload):
    """
    Upsert form state for a conversation based on manual (wizard) input.
    
    This keeps ElevenLabs sessions in sync so the agent can read the latest
    answers via GET /api/elevenlabs/conversation/{conversation_id}.
    
    If analyse=True, triggers form analysis after sync.
    """
    session = ensure_session(conversation_id)

    session["form_data"] = payload.form_data
    session["last_updated"] = datetime.now()
    validation = validate_form_data(payload.form_data)
    session["validation_errors"] = validation

    # Optionally trigger analysis
    if payload.analyse:
        ai_notes = analyze_form_data(payload.form_data, validation)
        session["ai_notes"] = ai_notes
        session["analysis_updated_at"] = datetime.now()
    else:
        # Keep existing ai_notes if not re-analyzing
        if "ai_notes" not in session:
            session["ai_notes"] = []

    await sse_manager.publish(
        conversation_id,
        build_form_state_message(conversation_id, session),
    )

    return {
        "success": True,
        "conversation_id": conversation_id,
        "form_state": {
            "form_data": payload.form_data.model_dump(),
            "validation_errors": validation,
            "has_data": any(
                field_value not in (None, "", [])
                for field_value in payload.form_data.model_dump().values()
            ),
            "ai_notes": session.get("ai_notes", []) if payload.analyse else None,
        },
    }


@router.get("/stream/{conversation_id}")
async def stream_conversation(conversation_id: str, request: Request):
    """Stream live form updates for a given conversation via SSE."""
    session = ensure_session(conversation_id)
    queue = await sse_manager.connect(conversation_id)
    
    async def event_generator():
        try:
            # Send initial snapshot
            yield format_sse_event(build_form_state_message(conversation_id, session))
            
            while True:
                if await request.is_disconnected():
                    break
                
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=15)
                    yield format_sse_event(data)
                except asyncio.TimeoutError:
                    # Heartbeat to keep the connection alive
                    yield ": keep-alive\n\n"
        finally:
            await sse_manager.disconnect(conversation_id, queue)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/conversation/{conversation_id}/analyse")
async def analyse_conversation(conversation_id: str):
    """
    Analyze form data completeness, consistency, and quality.
    Generates AI notes (warnings/suggestions) and stores them in session.
    
    This endpoint is called when user enters the summary step of the wizard.
    Analysis can be repeated on each return to the summary step.
    """
    if conversation_id not in elevenlabs_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    session = elevenlabs_sessions[conversation_id]
    form_data: AccidentReportFormData = session["form_data"]
    validation_errors = session.get("validation_errors", {})
    
    # Perform analysis
    ai_notes = analyze_form_data(form_data, validation_errors)
    
    # Store in session (overwriting previous result)
    session["ai_notes"] = ai_notes
    session["analysis_updated_at"] = datetime.now()
    
    # Notify listeners via SSE
    await sse_manager.publish(
        conversation_id,
        build_form_state_message(conversation_id, session),
    )
    
    return {
        "success": True,
        "conversation_id": conversation_id,
        "ai_notes": ai_notes,
        "analysis_updated_at": session["analysis_updated_at"].isoformat(),
    }


@router.get("/snapshot/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation data and form state for a given conversation ID."""
    if conversation_id not in elevenlabs_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    session = elevenlabs_sessions[conversation_id]
    form_data = session["form_data"]
    validation = validate_form_data(form_data)
    
    return {
        "conversation_id": conversation_id,
        "form_data": form_data,
        "validation_errors": validation,
        "ai_notes": session.get("ai_notes", []),
        "created_at": session.get("created_at"),
        "last_updated": session.get("last_updated"),
        "analysis_updated_at": session.get("analysis_updated_at"),
    }


@router.get("/conversations")
async def list_conversations():
    """List all active conversations."""
    return {
        "conversations": [
            {
                "conversation_id": conv_id,
                "created_at": session.get("created_at"),
                "last_updated": session.get("last_updated"),
            }
            for conv_id, session in elevenlabs_sessions.items()
        ],
    }

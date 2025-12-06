import base64
import threading
from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from app.models.schemas import AccidentReportFormData


class InMemoryStore:
    """
    Thread-safe in-memory data store for applications and attachments.
    Uses a lock to guard mutations in a multithreaded environment.
    """
    
    def __init__(self):
        self._lock = threading.Lock()
        self._applications: Dict[str, dict] = {}
        self._attachments: Dict[str, dict] = {}
        self._pesel_index: Dict[str, List[str]] = {}  # pesel -> list of application ids
    
    def create_application(
        self,
        form_data: AccidentReportFormData,
        status: Optional[str] = None,
        ai_suggestion: Optional[float] = None,
        ai_comments: Optional[Dict] = None,
    ) -> dict:
        """Create a new application and return it."""
        with self._lock:
            app_id = str(uuid4())
            pesel = form_data.poszkodowany.pesel
            now = datetime.utcnow()
            
            application = {
                "id": app_id,
                "created_at": now,
                "updated_at": now,
                "pesel": pesel,
                "form_data": form_data.model_dump(),
                "ai_suggestion": ai_suggestion,
                "ai_comments": ai_comments,
                "status": status,
                "attachment_ids": [],
            }
            
            self._applications[app_id] = application
            
            # Update PESEL index
            if pesel not in self._pesel_index:
                self._pesel_index[pesel] = []
            self._pesel_index[pesel].append(app_id)
            
            return application
    
    def get_application(self, app_id: str) -> Optional[dict]:
        """Get an application by ID."""
        with self._lock:
            return self._applications.get(app_id)
    
    def list_applications(
        self,
        page: int = 1,
        page_size: int = 10,
        pesel: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> tuple[List[dict], int]:
        """
        List applications with pagination and filters.
        Returns (items, total_count)
        """
        with self._lock:
            # Start with all applications or filter by PESEL
            if pesel:
                app_ids = self._pesel_index.get(pesel, [])
                applications = [self._applications[aid] for aid in app_ids if aid in self._applications]
            else:
                applications = list(self._applications.values())
            
            # Apply filters
            filtered = []
            for app in applications:
                # Date filter
                if date_from and app["created_at"] < date_from:
                    continue
                if date_to and app["created_at"] > date_to:
                    continue
                # Status filter
                if status is not None and app.get("status") != status:
                    continue
                filtered.append(app)
            
            # Sort by created_at descending (newest first)
            filtered.sort(key=lambda x: x["created_at"], reverse=True)
            
            total = len(filtered)
            
            # Pagination
            start = (page - 1) * page_size
            end = start + page_size
            paginated = filtered[start:end]
            
            return paginated, total
    
    def update_application(
        self,
        app_id: str,
        form_data: Optional[AccidentReportFormData] = None,
        ai_suggestion: Optional[float] = None,
        ai_comments: Optional[Dict] = None,
        status: Optional[str] = None,
    ) -> Optional[dict]:
        """Update an application. Returns updated application or None if not found."""
        with self._lock:
            if app_id not in self._applications:
                return None
            
            app = self._applications[app_id]
            
            if form_data is not None:
                old_pesel = app["pesel"]
                new_pesel = form_data.poszkodowany.pesel
                app["form_data"] = form_data.model_dump()
                app["pesel"] = new_pesel
                
                # Update PESEL index if PESEL changed
                if old_pesel != new_pesel:
                    if old_pesel in self._pesel_index:
                        self._pesel_index[old_pesel] = [
                            aid for aid in self._pesel_index[old_pesel] if aid != app_id
                        ]
                    if new_pesel not in self._pesel_index:
                        self._pesel_index[new_pesel] = []
                    self._pesel_index[new_pesel].append(app_id)
            
            if ai_suggestion is not None:
                app["ai_suggestion"] = ai_suggestion
            if ai_comments is not None:
                app["ai_comments"] = ai_comments
            if status is not None:
                app["status"] = status
            
            app["updated_at"] = datetime.utcnow()
            
            return app
    
    def delete_application(self, app_id: str) -> bool:
        """
        Hard delete an application and all its attachments.
        Returns True if deleted, False if not found.
        """
        with self._lock:
            if app_id not in self._applications:
                return False
            
            app = self._applications[app_id]
            pesel = app["pesel"]
            
            # Delete all attachments
            for att_id in app.get("attachment_ids", []):
                if att_id in self._attachments:
                    del self._attachments[att_id]
            
            # Remove from PESEL index
            if pesel in self._pesel_index:
                self._pesel_index[pesel] = [
                    aid for aid in self._pesel_index[pesel] if aid != app_id
                ]
                if not self._pesel_index[pesel]:
                    del self._pesel_index[pesel]
            
            # Delete application
            del self._applications[app_id]
            
            return True
    
    def create_attachment(
        self,
        app_id: str,
        title: str,
        mime_type: str,
        data_base64: str,
    ) -> Optional[dict]:
        """
        Create an attachment for an application.
        Returns attachment dict or None if application not found.
        """
        with self._lock:
            if app_id not in self._applications:
                return None
            
            att_id = str(uuid4())
            data_bytes = base64.b64decode(data_base64)
            
            attachment = {
                "id": att_id,
                "title": title,
                "mime_type": mime_type,
                "data": data_bytes,  # Store as bytes
                "size_bytes": len(data_bytes),
                "created_at": datetime.utcnow(),
            }
            
            self._attachments[att_id] = attachment
            
            # Add to application's attachment_ids
            app = self._applications[app_id]
            app["attachment_ids"].append(att_id)
            app["updated_at"] = datetime.utcnow()
            
            return attachment
    
    def get_attachment(self, att_id: str) -> Optional[dict]:
        """Get an attachment by ID."""
        with self._lock:
            return self._attachments.get(att_id)
    
    def get_application_attachments(self, app_id: str) -> List[dict]:
        """Get all attachments for an application."""
        with self._lock:
            if app_id not in self._applications:
                return []
            
            app = self._applications[app_id]
            attachments = []
            for att_id in app.get("attachment_ids", []):
                if att_id in self._attachments:
                    att = self._attachments[att_id].copy()
                    # Don't return binary data in list
                    att.pop("data", None)
                    attachments.append(att)
            
            return attachments
    
    def delete_attachment(self, app_id: str, att_id: str) -> bool:
        """
        Delete an attachment from an application.
        Returns True if deleted, False if not found.
        """
        with self._lock:
            if app_id not in self._applications:
                return False
            
            if att_id not in self._attachments:
                return False
            
            app = self._applications[app_id]
            if att_id not in app.get("attachment_ids", []):
                return False
            
            # Remove from application
            app["attachment_ids"] = [aid for aid in app["attachment_ids"] if aid != att_id]
            app["updated_at"] = datetime.utcnow()
            
            # Delete attachment
            del self._attachments[att_id]
            
            return True


# Global store instance
store = InMemoryStore()


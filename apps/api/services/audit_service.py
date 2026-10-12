"""
Provenance — Audit Trail Service.
Appends immutable records of all consequential actions to the audit_logs table.
"""
from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from sqlalchemy.orm import Session
from apps.api.db.models import AuditLogModel


def record_audit_event(
    db: Session,
    actor: str,
    action: str,
    object_type: str,
    object_id: str,
    details: Optional[str] = None,
    payload: Optional[Any] = None,
) -> AuditLogModel:
    """Writes an append-only audit record to the database."""
    payload_hash = None
    if payload is not None:
        try:
            payload_str = json.dumps(payload, sort_keys=True, default=str)
            payload_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()[:16]
        except Exception:
            payload_hash = None

    log_entry = AuditLogModel(
        id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
        actor=actor,
        action=action,
        object_type=object_type,
        object_id=object_id,
        payload_hash=payload_hash,
        details=details,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

"""
Provenance Authentication & Platform Settings Router.
Supports open multi-tenant user signup, login, session validation,
and persistent operational settings stored in SQLite.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from apps.api.db.database import get_db
from apps.api.db.models import AuditLogModel, PlatformSettingsModel, UserModel

router = APIRouter(tags=["auth", "settings"])

SECRET_KEY = os.environ.get("PROVENANCE_AUTH_SECRET", "provenance-super-secure-jwt-hmac-key-2026")

DEFAULT_SETTINGS: Dict[str, Any] = {
    "org_name": "Provenance Enterprise",
    "primary_department": "Engineering & Technology",
    "ai_engine": {
        "starting_bloom_level": 4,
        "min_turns": 3,
        "max_turns": 6,
        "uncertainty_threshold": 0.15,
        "evaluator_strictness": "balanced",
        "adaptive_drilldown_enabled": True,
    },
    "compliance": {
        "bipa_retention_days": 90,
        "pii_redaction_mode": True,
        "presence_sensitivity": "normal",
        "audit_webhook_url": "https://api.provenance.ai/v1/compliance/merkle-broadcast",
        "zero_biometrics_enforced": True,
    },
    "voice_audio": {
        "tts_playback_speed": 1.0,
        "tts_pitch": 1.0,
        "auto_read_question": True,
        "ambient_noise_filter": True,
    },
    "accessibility": {
        "high_contrast_mode": False,
        "prefers_reduced_motion": False,
        "show_captions_default": True,
    },
}


def hash_password(password: str, salt: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000
    ).hex()


def create_token(user_id: str, email: str, role: str, org_id: str) -> str:
    """Create a tamper-evident signed token."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "org_id": org_id,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int(datetime.now(timezone.utc).timestamp()) + 86400 * 30,  # 30 days
    }
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"{encoded_payload}.{signature}"


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify signed token integrity and return payload."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        encoded_payload, signature = parts
        expected_sig = hmac.new(
            SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(encoded_payload.encode("utf-8")).decode("utf-8"))
        if payload.get("exp", 0) < int(datetime.now(timezone.utc).timestamp()):
            return None
        return payload
    except Exception:
        return None


# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=4)
    role: Optional[str] = "recruiter"
    department: Optional[str] = "Engineering & Technology"
    organization_name: Optional[str] = "Provenance Enterprise"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: Optional[str]
    organization_name: Optional[str]
    org_id: str
    created_at: str


class AuthResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse


class SettingsUpdateRequest(BaseModel):
    org_name: Optional[str] = None
    primary_department: Optional[str] = None
    ai_engine: Optional[Dict[str, Any]] = None
    compliance: Optional[Dict[str, Any]] = None
    voice_audio: Optional[Dict[str, Any]] = None
    accessibility: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@router.post("/auth/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    """Open signup endpoint: anyone can register with their own credentials."""
    existing = db.query(UserModel).filter(UserModel.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered.",
        )

    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    salt = os.urandom(16).hex()
    pwd_hash = hash_password(req.password, salt)
    org_id = f"ORG-{uuid.uuid4().hex[:6].upper()}"

    new_user = UserModel(
        id=user_id,
        org_id=org_id,
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=pwd_hash,
        salt=salt,
        role=req.role or "recruiter",
        department=req.department or "Engineering",
        organization_name=req.organization_name or "Provenance Enterprise",
    )
    db.add(new_user)

    # Initialize tenant settings
    existing_settings = (
        db.query(PlatformSettingsModel).filter(PlatformSettingsModel.org_id == org_id).first()
    )
    if not existing_settings:
        custom_settings = dict(DEFAULT_SETTINGS)
        custom_settings["org_name"] = req.organization_name or "Provenance Enterprise"
        custom_settings["primary_department"] = req.department or "Engineering"
        db.add(
            PlatformSettingsModel(
                id=f"SET-{uuid.uuid4().hex[:8].upper()}",
                org_id=org_id,
                settings_json=json.dumps(custom_settings),
            )
        )

    # Compliance audit log
    db.add(
        AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            actor=req.email.lower().strip(),
            action="USER_SIGNUP",
            object_type="user",
            object_id=user_id,
            details=f"User registered with role {req.role} in org {org_id}",
        )
    )
    db.commit()
    db.refresh(new_user)

    token = create_token(new_user.id, new_user.email, new_user.role, new_user.org_id)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "department": new_user.department,
            "organization_name": new_user.organization_name,
            "org_id": new_user.org_id,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else "",
        },
    }


@router.post("/auth/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate registered users."""
    user = db.query(UserModel).filter(UserModel.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    computed_hash = hash_password(req.password, user.salt)
    if not hmac.compare_digest(computed_hash, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Log login event
    db.add(
        AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            actor=user.email,
            action="USER_LOGIN",
            object_type="user",
            object_id=user.id,
            details=f"User authenticated successfully into org {user.org_id}",
        )
    )
    db.commit()

    token = create_token(user.id, user.email, user.role, user.org_id)
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "organization_name": user.organization_name,
            "org_id": user.org_id,
            "created_at": user.created_at.isoformat() if user.created_at else "",
        },
    }


@router.get("/auth/me", response_model=UserResponse)
def get_current_user(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Retrieve current authenticated user from token."""
    raw_token = token
    if not raw_token and authorization:
        parts = authorization.split(" ")
        if len(parts) == 2 and parts[0].lower() == "bearer":
            raw_token = parts[1]

    if not raw_token:
        # Default fallback for unauthenticated guest sessions
        guest_user = db.query(UserModel).first()
        if guest_user:
            return {
                "id": guest_user.id,
                "name": guest_user.name,
                "email": guest_user.email,
                "role": guest_user.role,
                "department": guest_user.department,
                "organization_name": guest_user.organization_name,
                "org_id": guest_user.org_id,
                "created_at": guest_user.created_at.isoformat() if guest_user.created_at else "",
            }
        raise HTTPException(status_code=401, detail="Authentication token required.")

    payload = verify_token(raw_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")

    user = db.query(UserModel).filter(UserModel.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "organization_name": user.organization_name,
        "org_id": user.org_id,
        "created_at": user.created_at.isoformat() if user.created_at else "",
    }


@router.get("/settings", response_model=Dict[str, Any])
def get_settings(
    org_id: str = "default-org",
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Fetch current organization settings with default fallback."""
    if authorization:
        payload = verify_token(authorization.replace("Bearer ", "").strip())
        if payload and payload.get("org_id"):
            org_id = payload.get("org_id")

    settings_row = (
        db.query(PlatformSettingsModel).filter(PlatformSettingsModel.org_id == org_id).first()
    )
    if not settings_row:
        # Check global default
        settings_row = (
            db.query(PlatformSettingsModel)
            .filter(PlatformSettingsModel.org_id == "default-org")
            .first()
        )

    if settings_row:
        try:
            return json.loads(settings_row.settings_json)
        except Exception:
            pass

    return DEFAULT_SETTINGS


@router.put("/settings", response_model=Dict[str, Any])
def update_settings(
    req: SettingsUpdateRequest,
    org_id: str = "default-org",
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Update organization platform settings and persist to database."""
    actor = "system"
    if authorization:
        payload = verify_token(authorization.replace("Bearer ", "").strip())
        if payload:
            if payload.get("org_id"):
                org_id = payload.get("org_id")
            if payload.get("email"):
                actor = payload.get("email")

    settings_row = (
        db.query(PlatformSettingsModel).filter(PlatformSettingsModel.org_id == org_id).first()
    )

    current_data = dict(DEFAULT_SETTINGS)
    if settings_row:
        try:
            current_data = json.loads(settings_row.settings_json)
        except Exception:
            current_data = dict(DEFAULT_SETTINGS)

    # Merge updates
    req_dict = req.model_dump(exclude_unset=True)
    for k, v in req_dict.items():
        if isinstance(v, dict) and isinstance(current_data.get(k), dict):
            current_data[k].update(v)
        elif v is not None:
            current_data[k] = v

    updated_json = json.dumps(current_data, indent=2)

    if not settings_row:
        settings_row = PlatformSettingsModel(
            id=f"SET-{uuid.uuid4().hex[:8].upper()}",
            org_id=org_id,
            settings_json=updated_json,
        )
        db.add(settings_row)
    else:
        settings_row.settings_json = updated_json
        settings_row.updated_at = datetime.now(timezone.utc)

    # Audit log update
    db.add(
        AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            actor=actor,
            action="SETTINGS_UPDATED",
            object_type="platform_settings",
            object_id=org_id,
            details=f"Updated settings keys: {', '.join(req_dict.keys())}",
        )
    )
    db.commit()

    return current_data

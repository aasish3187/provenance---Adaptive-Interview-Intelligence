"""
Provenance — Roles & Blueprint Studio Router.
"""
from __future__ import annotations

import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from apps.api.db.database import get_db
from apps.api.db.models import RoleModel
from apps.api.services.audit_service import record_audit_event
from apps.api.services.blueprint_service import generate_blueprint_from_jd
from packages.schemas.models import Blueprint, Competency

router = APIRouter(prefix="/roles", tags=["roles"])


class CreateRoleRequest(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    jd_text: Optional[str] = None
    resume_text: Optional[str] = None
    org_id: Optional[str] = "default-org"


class UpdateBlueprintRequest(BaseModel):
    competencies: List[Competency]
    target_duration_minutes: Optional[int] = 30


@router.post("", response_model=dict)
def create_role(payload: CreateRoleRequest, db: Session = Depends(get_db)):
    role_id = f"ROLE-{uuid.uuid4().hex[:6].upper()}"

    jd = payload.jd_text or f"Role: {payload.title}. Scalable architecture, production resilience, performance engineering."
    blueprint = generate_blueprint_from_jd(
        role_id=role_id,
        role_title=payload.title,
        jd_text=jd,
        resume_text=payload.resume_text,
    )

    role_model = RoleModel(
        id=role_id,
        org_id=payload.org_id,
        title=payload.title,
        department=payload.department,
        jd_text=jd,
        blueprint_json=blueprint.model_dump_json(),
    )
    db.add(role_model)
    db.commit()

    record_audit_event(
        db=db,
        actor="Recruiter",
        action="Role Created",
        object_type="Role",
        object_id=role_id,
        details=f"Created role '{payload.title}' with {len(blueprint.competencies)} competencies.",
    )

    return {
        "id": role_id,
        "title": role_model.title,
        "department": role_model.department,
        "blueprint": blueprint.model_dump(),
    }


@router.get("", response_model=list)
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(RoleModel).order_by(RoleModel.created_at.desc()).all()
    results = []
    seen_titles = set()
    for r in roles:
        norm = r.title.strip().lower()
        if norm in seen_titles:
            continue
        seen_titles.add(norm)
        bp = json.loads(r.blueprint_json) if r.blueprint_json else None
        results.append({
            "id": r.id,
            "title": r.title,
            "department": r.department,
            "blueprint": bp,
            "created_at": r.created_at,
        })
    return results


@router.get("/{role_id}", response_model=dict)
def get_role(role_id: str, db: Session = Depends(get_db)):
    role = db.query(RoleModel).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    bp = json.loads(role.blueprint_json) if role.blueprint_json else None
    return {
        "id": role.id,
        "title": role.title,
        "department": role.department,
        "jd_text": role.jd_text,
        "blueprint": bp,
    }


@router.patch("/{role_id}/blueprint", response_model=dict)
def update_blueprint(role_id: str, payload: UpdateBlueprintRequest, db: Session = Depends(get_db)):
    role = db.query(RoleModel).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    existing_bp = json.loads(role.blueprint_json) if role.blueprint_json else {}
    updated_bp = Blueprint(
        id=existing_bp.get("id", f"BP-{uuid.uuid4().hex[:6]}"),
        role_id=role_id,
        role_title=role.title,
        target_duration_minutes=payload.target_duration_minutes or existing_bp.get("target_duration_minutes", 30),
        competencies=payload.competencies,
        recruiter_edited=True,
    )

    role.blueprint_json = updated_bp.model_dump_json()
    db.commit()

    record_audit_event(
        db=db,
        actor="Recruiter",
        action="Blueprint Updated",
        object_type="Blueprint",
        object_id=updated_bp.id,
        details="Recruiter modified competency must-have toggles and duration.",
    )

    return updated_bp.model_dump()

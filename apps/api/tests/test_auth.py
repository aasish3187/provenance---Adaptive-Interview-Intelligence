"""
Unit tests for Provenance Authentication and Platform Settings API.
Verifies open signup, password hashing, login authentication, and settings persistence.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_user_signup_and_duplicate_email_prevention():
    test_email = f"recruitertest_{pytest.importorskip('uuid').uuid4().hex[:6]}@domain.com"
    signup_payload = {
        "name": "Alex Tech Lead",
        "email": test_email,
        "password": "strongPassword!2026",
        "role": "recruiter",
        "organization_name": "Test Org",
        "department": "Platform Engineering",
    }

    # 1. Successful Signup
    res = client.post("/auth/signup", json=signup_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == test_email
    assert data["user"]["name"] == "Alex Tech Lead"
    assert data["user"]["role"] == "recruiter"

    # 2. Duplicate email should fail with 400
    dup_res = client.post("/auth/signup", json=signup_payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()


def test_user_login_validation():
    test_email = f"loginuser_{pytest.importorskip('uuid').uuid4().hex[:6]}@domain.com"
    password = "secretPassword123"

    # Register
    signup_res = client.post(
        "/auth/signup",
        json={
            "name": "Jordan Auditor",
            "email": test_email,
            "password": password,
            "role": "auditor",
        },
    )
    assert signup_res.status_code == 200

    # Login with correct password
    login_res = client.post(
        "/auth/login",
        json={"email": test_email, "password": password},
    )
    assert login_res.status_code == 200
    assert login_res.json()["success"] is True
    assert "token" in login_res.json()
    assert login_res.json()["user"]["email"] == test_email

    # Login with wrong password
    bad_res = client.post(
        "/auth/login",
        json={"email": test_email, "password": "wrongpassword!"},
    )
    assert bad_res.status_code == 401
    assert "invalid email or password" in bad_res.json()["detail"].lower()


def test_settings_read_and_update():
    # Read settings
    get_res = client.get("/settings")
    assert get_res.status_code == 200
    data = get_res.json()
    assert "ai_engine" in data
    assert "compliance" in data

    # Update settings
    put_res = client.put(
        "/settings",
        json={
            "org_name": "Pytest Global Systems",
            "ai_engine": {"min_turns": 5, "starting_bloom_level": 3},
            "compliance": {"bipa_retention_days": 180},
        },
    )
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["org_name"] == "Pytest Global Systems"
    assert updated["ai_engine"]["min_turns"] == 5
    assert updated["compliance"]["bipa_retention_days"] == 180

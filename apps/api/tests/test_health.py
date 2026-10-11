from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Provenance API"
    assert data["status"] == "online"


def test_healthz_endpoint():
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "provenance-api"
    assert "version" in data
    assert "timestamp" in data


def test_models_config_endpoint():
    response = client.get("/api/config/models")
    assert response.status_code == 200
    data = response.json()
    assert "conversation_model" in data
    assert "evaluator_model" in data
    # Ensure no secrets or API keys are leaked
    for key, val in data.items():
        assert "key" not in str(key).lower()
        assert "secret" not in str(val).lower()

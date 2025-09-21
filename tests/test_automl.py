import pytest
from fastapi.testclient import TestClient
from app.main import app
import jwt
import os

client = TestClient(app)

# Generate a test JWT using the same secret
SECRET = os.getenv("JWT_SECRET_KEY", "change-me")
token = jwt.encode({"sub": "test-user"}, SECRET, algorithm="HS256")
headers = {"Authorization": f"Bearer {token}"}

def test_automl_run_defaults():
    response = client.post("/automl/run", headers=headers, json={})
    assert response.status_code == 200
    data = response.json()
    # Check that best_params keys exist
    assert "best_params" in data
    assert "n_estimators" in data["best_params"]
    # SHAP values shape should match dataset shape
    assert isinstance(data["shap_values_shape"], list)
    assert len(data["base_values"]) > 0

def test_automl_run_custom_params():
    payload = {"n_estimators": [5], "max_depth": [2]}
    response = client.post("/automl/run", headers=headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["best_params"]["n_estimators"] in [5]
    assert data["best_params"]["max_depth"] in [2, None]

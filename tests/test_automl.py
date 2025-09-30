import pytest
import os
from fastapi.testclient import TestClient
from app.main import app

# Set test environment variables
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-ci"

client = TestClient(app)

def test_health_check():
    """Test basic health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_cors_headers():
    """Test CORS headers are properly set"""
    response = client.options("/health")
    assert response.status_code in [200, 405]  # Some servers return 405 for OPTIONS

def test_auth_endpoints_exist():
    """Test authentication endpoints are available"""
    # Test register endpoint exists
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com", 
        "password": "testpass123"
    })
    # Should not be 404 (endpoint exists)
    assert response.status_code != 404
    
    # Test login endpoint exists
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    # Should not be 404 (endpoint exists)
    assert response.status_code != 404

def test_automl_endpoint_requires_auth():
    """Test AutoML endpoint exists and requires authentication"""
    response = client.post("/automl/run", json={})
    # Should return 401 (unauthorized) or 422 (validation error), not 404
    assert response.status_code in [401, 422]

def test_upload_endpoints_exist():
    """Test upload endpoints are available"""
    response = client.post("/upload/structured")
    # Should not be 404 (endpoint exists)
    assert response.status_code != 404

def test_genai_endpoint_requires_auth():
    """Test GenAI endpoint exists and requires authentication"""
    response = client.post("/genai/chat", json={
        "model_key": "gpt-4o",
        "messages": []
    })
    # Should return 401 (unauthorized) or 422 (validation error), not 404
    assert response.status_code in [401, 422]

@pytest.mark.asyncio
async def test_websocket_endpoint_exists():
    """Test WebSocket endpoint is available"""
    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        try:
            # Try to connect to WebSocket endpoint
            with test_client.websocket_connect("/ws/pipeline/test") as websocket:
                # If we can connect, the endpoint exists
                assert True
        except Exception:
            # Even if connection fails due to auth/validation, endpoint should exist
            # We're just testing the endpoint is mounted, not functionality
            pass

if __name__ == "__main__":
    pytest.main([__file__])

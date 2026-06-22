import pytest
import httpx

CAD_SERVER_URL = "http://localhost:5000"
AI_SERVER_URL = "http://localhost:4000"


@pytest.fixture(scope="session")
def cad_server():
    """Check CAD server is running. Skip all tests if not."""
    try:
        r = httpx.get(f"{CAD_SERVER_URL}/health", timeout=5)
        assert r.status_code == 200
    except Exception:
        pytest.skip("CAD server not running — start with: cd backend && docker compose up -d")
    return CAD_SERVER_URL


@pytest.fixture(scope="session")
def ai_server():
    """Check AI server is running. Skip all tests if not."""
    try:
        r = httpx.get(f"{AI_SERVER_URL}/api/health", timeout=5)
        assert r.status_code == 200
    except Exception:
        pytest.skip("AI server not running — start with: cd backend && docker compose up -d")
    return AI_SERVER_URL

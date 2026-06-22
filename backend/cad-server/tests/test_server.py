import pytest
import base64
import httpx
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "server" / "src"))

from main import app
from params import substitute_params

CAD_SERVER_URL = "http://localhost:5000"


# ─── Unit Tests (no Docker needed) ────────────────────────────────────

class TestParams:
    def test_substitute_single(self):
        result = substitute_params("width = 60  # [10:5:200]\nheight = 40", {"width": 80})
        assert "width = 80" in result
        assert "height = 40" in result

    def test_substitute_empty(self):
        code = "width = 60"
        assert substitute_params(code, {}) == code

    def test_substitute_preserves_comment(self):
        result = substitute_params("width = 60.0  # [10:5:200]", {"width": 100})
        assert "100" in result
        assert "# [10:5:200]" in result

    def test_substitute_integer_detection(self):
        result = substitute_params("count = 12  # [1:1:50]", {"count": 20})
        assert "count = 20" in result
        assert "20.0" not in result  # should stay int

    def test_substitute_multiple(self):
        code = "width = 60\nheight = 40\nthickness = 5"
        result = substitute_params(code, {"width": 100, "height": 80, "thickness": 10})
        assert "width = 100" in result
        assert "height = 80" in result
        assert "thickness = 10" in result


# ─── Integration Tests (requires running Docker containers) ──────────

@pytest.fixture(scope="module")
def client():
    """Check that CAD server is running before tests."""
    try:
        r = httpx.get(f"{CAD_SERVER_URL}/health", timeout=5)
        assert r.status_code == 200
    except Exception:
        pytest.skip("CAD server not running — start with: docker compose up -d")
    yield CAD_SERVER_URL


class TestHealth:
    def test_health(self, client):
        r = httpx.get(f"{client}/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["service"] == "cad-server"
        assert data["version"] == "0.3.0"


class TestExecute:
    def test_execute_box_with_result(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["has_stl"] is True
        assert data["has_step"] is True
        assert data["has_glb"] is True
        assert len(data["stl_base64"]) > 100
        assert len(data["step_base64"]) > 100

    def test_execute_box_with_r(self, client):
        code = 'import cadquery as cq\nr = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_execute_cylinder(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").circle(10).extrude(50)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["validation"]["volume"] > 0

    def test_execute_complex_geometry(self, client):
        code = '''import cadquery as cq
result = (cq.Workplane("XY")
    .rect(60, 40)
    .extrude(5)
    .faces(">Z").workplane()
    .hole(8)
)'''
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_execute_invalid_code(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").nonexistent()'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False
        assert r.json()["error"] is not None

    def test_execute_syntax_error(self, client):
        code = 'import cadquery as cq\ndef broken('
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False

    def test_execute_missing_variable(self, client):
        code = 'import cadquery as cq\ncq.Workplane("XY").box(10,10,10)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False
        assert "did not define variable" in r.json()["error"].lower()

    def test_execute_validation_data(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["success"] is True
        v = data["validation"]
        assert v["volume"] == 6000.0
        assert v["has_volume"] is True
        assert v["is_valid"] is True
        assert v["bounding_box"]["size"] == [10.0, 20.0, 30.0]

    def test_execute_inspection_data(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["success"] is True
        insp = data["inspection"]
        assert insp["is_valid"] is True
        assert insp["is_solid"] is True
        assert insp["face_count"] == 6
        assert insp["edge_count"] == 12

    def test_execute_dim_views(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(
            f"{client}/execute",
            json={"code": code, "render_dim_views": True},
            timeout=60,
        )
        data = r.json()
        assert data["success"] is True
        assert "top" in data["dim_views"]
        assert "front" in data["dim_views"]
        assert "side" in data["dim_views"]

    def test_execute_returns_parameters(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["success"] is True
        assert "parameters" in data


class TestUpdateParams:
    def test_update_params(self, client):
        code = 'import cadquery as cq\nwidth = 60.0\nheight = 40.0\nresult = cq.Workplane("XY").rect(width, height).extrude(5)'
        r = httpx.post(
            f"{client}/update-params",
            json={"code": code, "params": {"width": 100, "height": 80}},
            timeout=60,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["has_stl"] is True

    def test_update_params_changes_volume(self, client):
        code = 'import cadquery as cq\nw = 10.0\nh = 20.0\nd = 30.0\nresult = cq.Workplane("XY").box(w, h, d)'
        # Original volume: 10*20*30 = 6000
        r1 = httpx.post(f"{client}/execute", json={"code": code}, timeout=60)
        assert r1.json()["success"] is True
        assert r1.json()["validation"]["volume"] == 6000.0

        # Updated volume: 20*40*60 = 48000
        r2 = httpx.post(
            f"{client}/update-params",
            json={"code": code, "params": {"w": 20, "h": 40, "d": 60}},
            timeout=60,
        )
        assert r2.json()["success"] is True
        assert r2.json()["validation"]["volume"] == 48000.0

    def test_update_params_missing_params(self, client):
        r = httpx.post(
            f"{client}/update-params",
            json={"code": "x = 1"},
            timeout=10,
        )
        assert r.status_code == 422  # missing required field


class TestInspect:
    def test_inspect_returns_validation(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{client}/inspect", json={"code": code}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "validation" in data
        assert "inspection" in data
        assert "dim_views" in data

    def test_inspect_invalid_code(self, client):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").nonexistent()'
        r = httpx.post(f"{client}/inspect", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False


# ─── Full Pipeline Test ───────────────────────────────────────────────

class TestFullPipeline:
    """End-to-end: execute → verify all outputs → update params → verify change."""

    def test_full_pipeline(self, client):
        # 1. Execute initial code
        code = 'import cadquery as cq\nsize = 10.0\nresult = cq.Workplane("XY").box(size, size, size)'
        r = httpx.post(
            f"{client}/execute",
            json={"code": code, "render_dim_views": True},
            timeout=60,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True

        # 2. Verify all output formats
        assert data["has_stl"] is True
        assert data["has_step"] is True
        assert data["has_glb"] is True
        assert len(data["stl_base64"]) > 0
        assert len(data["step_base64"]) > 0
        assert len(data["glb_base64"]) > 0

        # 3. Verify base64 is valid
        stl_bytes = base64.b64decode(data["stl_base64"])
        assert len(stl_bytes) > 0
        step_bytes = base64.b64decode(data["step_base64"])
        assert len(step_bytes) > 0

        # 4. Verify validation
        assert data["validation"]["volume"] == 1000.0
        assert data["validation"]["bounding_box"]["size"] == [10.0, 10.0, 10.0]

        # 5. Verify inspection
        assert data["inspection"]["is_valid"] is True
        assert data["inspection"]["face_count"] == 6

        # 6. Verify dim views
        assert "top" in data["dim_views"]
        assert "front" in data["dim_views"]
        assert "side" in data["dim_views"]

        # 7. Update params and verify volume changes
        r2 = httpx.post(
            f"{client}/update-params",
            json={"code": code, "params": {"size": 20.0}},
            timeout=60,
        )
        assert r2.json()["success"] is True
        assert r2.json()["validation"]["volume"] == 8000.0

import base64
import httpx


class TestFullPipeline:
    """End-to-end: AI server → CAD server → Docker executor → STL/STEP/GLB."""

    def test_generate_simple_box(self, ai_server):
        """Full pipeline: prompt → LLM → code → Docker → STL."""
        r = httpx.post(
            f"{ai_server}/api/generate",
            json={"prompt": "a simple cube 10x10x10mm", "provider": "mimo-pro"},
            timeout=120,
        )
        assert r.status_code == 200
        text = r.text
        assert "event: done" in text or "success" in text

    def test_cad_server_direct(self, cad_server):
        """Full pipeline: code → CAD server → Docker → validation → inspection."""
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(
            f"{cad_server}/execute",
            json={"code": code, "render_dim_views": True},
            timeout=60,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True

        # Verify all outputs
        assert data["has_stl"] is True
        assert data["has_step"] is True
        assert data["has_glb"] is True
        assert len(data["stl_base64"]) > 0

        # Verify base64 decodes
        stl_bytes = base64.b64decode(data["stl_base64"])
        assert len(stl_bytes) > 0

        # Verify validation
        assert data["validation"]["volume"] == 6000.0
        assert data["validation"]["bounding_box"]["size"] == [10.0, 20.0, 30.0]

        # Verify inspection
        assert data["inspection"]["is_valid"] is True
        assert data["inspection"]["face_count"] == 6

        # Verify dim views
        assert "top" in data["dim_views"]
        assert "front" in data["dim_views"]
        assert "side" in data["dim_views"]

    def test_param_update_flow(self, cad_server):
        """Execute → update params → verify volume changed."""
        code = 'import cadquery as cq\nsize = 10.0\nresult = cq.Workplane("XY").box(size, size, size)'

        # Initial: 10^3 = 1000
        r1 = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r1.json()["success"] is True
        assert r1.json()["validation"]["volume"] == 1000.0

        # Updated: 20^3 = 8000
        r2 = httpx.post(
            f"{cad_server}/update-params",
            json={"code": code, "params": {"size": 20.0}},
            timeout=60,
        )
        assert r2.json()["success"] is True
        assert r2.json()["validation"]["volume"] == 8000.0

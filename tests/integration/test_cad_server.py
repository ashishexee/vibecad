import base64
import httpx


class TestHealth:
    def test_health(self, cad_server):
        r = httpx.get(f"{cad_server}/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["service"] == "cad-server"
        assert data["version"] == "0.3.0"


class TestExecute:
    def test_box_with_result(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert data["has_stl"] is True
        assert data["has_step"] is True
        assert data["has_glb"] is True
        assert len(data["stl_base64"]) > 100

    def test_box_with_r(self, cad_server):
        code = 'import cadquery as cq\nr = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_cylinder(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").circle(10).extrude(50)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is True
        assert r.json()["validation"]["volume"] > 0

    def test_complex_geometry(self, cad_server):
        code = '''import cadquery as cq
result = (cq.Workplane("XY")
    .rect(60, 40)
    .extrude(5)
    .faces(">Z").workplane()
    .hole(8)
)'''
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_invalid_code(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").nonexistent()'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False
        assert r.json()["error"] is not None

    def test_syntax_error(self, cad_server):
        code = 'import cadquery as cq\ndef broken('
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False

    def test_missing_variable(self, cad_server):
        code = 'import cadquery as cq\ncq.Workplane("XY").box(10,10,10)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        assert r.status_code == 200
        assert r.json()["success"] is False


class TestValidation:
    def test_volume(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["success"] is True
        assert data["validation"]["volume"] == 6000.0
        assert data["validation"]["has_volume"] is True
        assert data["validation"]["is_valid"] is True

    def test_bounding_box(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["validation"]["bounding_box"]["size"] == [10.0, 20.0, 30.0]


class TestInspection:
    def test_inspection_data(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/execute", json={"code": code}, timeout=60)
        data = r.json()
        assert data["success"] is True
        insp = data["inspection"]
        assert insp["is_valid"] is True
        assert insp["is_solid"] is True
        assert insp["face_count"] == 6
        assert insp["edge_count"] == 12


class TestDimViews:
    def test_dim_views(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(
            f"{cad_server}/execute",
            json={"code": code, "render_dim_views": True},
            timeout=60,
        )
        data = r.json()
        assert data["success"] is True
        assert "top" in data["dim_views"]
        assert "front" in data["dim_views"]
        assert "side" in data["dim_views"]


class TestUpdateParams:
    def test_update_params(self, cad_server):
        code = 'import cadquery as cq\nwidth = 60.0\nheight = 40.0\nresult = cq.Workplane("XY").rect(width, height).extrude(5)'
        r = httpx.post(
            f"{cad_server}/update-params",
            json={"code": code, "params": {"width": 100, "height": 80}},
            timeout=60,
        )
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_volume_changes(self, cad_server):
        code = 'import cadquery as cq\nw = 10.0\nh = 20.0\nd = 30.0\nresult = cq.Workplane("XY").box(w, h, d)'
        r2 = httpx.post(
            f"{cad_server}/update-params",
            json={"code": code, "params": {"w": 20, "h": 40, "d": 60}},
            timeout=60,
        )
        assert r2.json()["success"] is True
        assert r2.json()["validation"]["volume"] == 48000.0


class TestInspect:
    def test_inspect_endpoint(self, cad_server):
        code = 'import cadquery as cq\nresult = cq.Workplane("XY").box(10, 20, 30)'
        r = httpx.post(f"{cad_server}/inspect", json={"code": code}, timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        assert "validation" in data
        assert "inspection" in data
        assert "dim_views" in data


class TestFullPipeline:
    """End-to-end: execute → verify all outputs → update params → verify change."""

    def test_full_pipeline(self, cad_server):
        # 1. Execute initial code
        code = 'import cadquery as cq\nsize = 10.0\nresult = cq.Workplane("XY").box(size, size, size)'
        r = httpx.post(
            f"{cad_server}/execute",
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
            f"{cad_server}/update-params",
            json={"code": code, "params": {"size": 20.0}},
            timeout=60,
        )
        assert r2.json()["success"] is True
        assert r2.json()["validation"]["volume"] == 8000.0

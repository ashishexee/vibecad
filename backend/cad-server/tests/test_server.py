import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from main import app
from params import extract_parameters, substitute_params

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_extract_single_param():
    params = extract_parameters("width = 60.0  # [10:5:200]\nimport cadquery as cq")
    assert len(params) == 1
    assert params[0]["name"] == "width"
    assert params[0]["default"] == 60.0


def test_extract_multiple_params():
    params = extract_parameters("width = 60  # [10:5:200]\nheight = 40  # [10:5:200]\nthickness = 5  # [1:1:20]")
    assert len(params) == 3


def test_extract_no_params():
    assert extract_parameters("import cadquery as cq\nr = cq.Workplane('XY').box(10,10,10)") == []


def test_substitute_single():
    result = substitute_params("width = 60  # [10:5:200]\nheight = 40", {"width": 80})
    assert "width = 80" in result
    assert "height = 40" in result


def test_substitute_empty():
    code = "width = 60"
    assert substitute_params(code, {}) == code


def test_execute_valid_code():
    code = 'import cadquery as cq\nr = cq.Workplane("XY").rect(60, 40).extrude(5).faces(">Z").workplane().hole(8)\ncq.exporters.export(r, "/tmp/output.stl")\ncq.exporters.export(r, "/tmp/output.step")'
    r = client.post("/execute", json={"code": code})
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert data["has_stl"] is True
    assert data["has_step"] is True


def test_execute_invalid_code():
    r = client.post("/execute", json={"code": "import cadquery as cq\nr = cq.Workplane('XY').nonexistent()"})
    assert r.status_code == 200
    assert r.json()["success"] is False


def test_execute_code_without_r():
    r = client.post("/execute", json={"code": "import cadquery as cq\nx = cq.Workplane('XY').box(10,10,10)"})
    assert r.status_code == 200
    assert r.json()["success"] is False


def test_update_params():
    code = 'import cadquery as cq\nwidth = 60.0  # [10:5:200]\nheight = 40.0  # [10:5:200]\nr = cq.Workplane("XY").rect(width, height).extrude(5)\ncq.exporters.export(r, "/tmp/output.stl")'
    r = client.post("/update-params", json={"code": code, "params": {"width": 100, "height": 80}})
    assert r.status_code == 200
    assert r.json()["success"] is True

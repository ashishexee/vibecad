import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "backend" / "cad-server" / "server" / "src"))

from params import substitute_params


class TestSubstituteParams:
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
        assert "20.0" not in result

    def test_substitute_multiple(self):
        code = "width = 60\nheight = 40\nthickness = 5"
        result = substitute_params(code, {"width": 100, "height": 80, "thickness": 10})
        assert "width = 100" in result
        assert "height = 80" in result
        assert "thickness = 10" in result

    def test_substitute_float(self):
        result = substitute_params("radius = 5.5  # [1:0.5:20]", {"radius": 10.5})
        assert "radius = 10.5" in result

    def test_substitute_no_match(self):
        code = "width = 60"
        result = substitute_params(code, {"nonexistent": 100})
        assert result == code

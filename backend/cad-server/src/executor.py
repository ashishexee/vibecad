import os
import sys
import tempfile
import subprocess
import json
from pathlib import Path


def validate_geometry(shape) -> dict:
    """Run geometric validation checks on a CadQuery shape."""
    checks = {}

    try:
        vol = shape.val().Volume()
        checks["volume"] = round(vol, 2)
        checks["has_volume"] = vol > 0
    except Exception:
        checks["volume"] = 0
        checks["has_volume"] = False

    try:
        area = shape.val().Area()
        checks["surface_area"] = round(area, 2)
    except Exception:
        checks["surface_area"] = 0

    try:
        bbox = shape.val().BoundingBox()
        checks["bounding_box"] = {
            "xmin": round(bbox.xmin, 2), "xmax": round(bbox.xmax, 2),
            "ymin": round(bbox.ymin, 2), "ymax": round(bbox.ymax, 2),
            "zmin": round(bbox.zmin, 2), "zmax": round(bbox.zmax, 2),
            "size": [round(bbox.xlen, 2), round(bbox.ylen, 2), round(bbox.zlen, 2)],
        }
    except Exception:
        checks["bounding_box"] = None

    try:
        center = shape.val().Center()
        checks["center_of_mass"] = [round(center.x, 2), round(center.y, 2), round(center.z, 2)]
    except Exception:
        checks["center_of_mass"] = None

    try:
        checks["is_valid"] = shape.val().isValid()
    except Exception:
        checks["is_valid"] = False

    # Sanity checks
    warnings = []
    if not checks.get("has_volume", False):
        warnings.append("Model has zero volume — may be a surface, not a solid")
    if checks.get("bounding_box"):
        size = checks["bounding_box"]["size"]
        if any(s > 10000 for s in size):
            warnings.append(f"Model is very large ({size}mm) — check units")
        if any(s < 0.01 and s > 0 for s in size):
            warnings.append(f"Model is very small ({size}mm) — check units")
    checks["warnings"] = warnings

    return checks


def execute_cadquery(code: str, params: dict | None = None) -> dict:
    """Execute CadQuery code in a sandboxed subprocess and return file bytes + validation."""
    from params import substitute_params

    processed_code = substitute_params(code, params) if params else code

    with tempfile.TemporaryDirectory(prefix="vibecad_") as work_dir:
        user_code_path = Path(work_dir) / "user_code.py"
        runner_path = Path(work_dir) / "runner.py"
        stl_path = Path(work_dir) / "output.stl"
        step_path = Path(work_dir) / "output.step"
        glb_path = Path(work_dir) / "output.glb"
        validation_path = Path(work_dir) / "validation.json"

        user_code_path.write_text(processed_code, encoding="utf-8")

        runner = f'''
import cadquery as cq
import sys
import json

try:
    exec(open({str(user_code_path)!r}).read())
    if "r" not in dir():
        raise ValueError("Code did not define variable 'r'")

    # Export files
    cq.exporters.export(r, {str(stl_path)!r})
    cq.exporters.export(r, {str(step_path)!r})

    try:
        asm = cq.Assembly()
        asm.add(r, name="model")
        asm.save({str(glb_path)!r}, "GLTF")
    except Exception:
        pass

    # Run validation
    validation = {{"volume": 0, "surface_area": 0, "bounding_box": None, "is_valid": False, "warnings": []}}
    try:
        val = r.val()
        validation["volume"] = round(val.Volume(), 2)
        validation["surface_area"] = round(val.Area(), 2)
        bb = val.BoundingBox()
        validation["bounding_box"] = {{
            "size": [round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)],
            "xmin": round(bb.xmin, 2), "xmax": round(bb.xmax, 2),
            "ymin": round(bb.ymin, 2), "ymax": round(bb.ymax, 2),
            "zmin": round(bb.zmin, 2), "zmax": round(bb.zmax, 2),
        }}
        validation["is_valid"] = val.isValid()
        validation["has_volume"] = validation["volume"] > 0
        if validation["volume"] <= 0:
            validation["warnings"].append("Model has zero volume")
        if any(s > 10000 for s in validation["bounding_box"]["size"]):
            validation["warnings"].append("Model is very large, check units")
    except Exception as ve:
        validation["warnings"].append(f"Validation error: {{ve}}")

    with open({str(validation_path)!r}, "w") as vf:
        json.dump(validation, vf)

    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {{e}}", file=sys.stderr)
    sys.exit(1)
'''
        runner_path.write_text(runner, encoding="utf-8")

        result = subprocess.run(
            [sys.executable, str(runner_path)],
            capture_output=True, text=True, timeout=30, cwd=work_dir,
        )

        if result.returncode != 0:
            return {"success": False, "error": result.stderr.strip() or "Unknown error"}

        stl_bytes = stl_path.read_bytes() if stl_path.exists() else None
        step_bytes = step_path.read_bytes() if step_path.exists() else None
        glb_bytes = glb_path.read_bytes() if glb_path.exists() else None

        validation = {}
        if validation_path.exists():
            try:
                validation = json.loads(validation_path.read_text())
            except Exception:
                validation = {}

        return {
            "success": True,
            "stl": stl_bytes,
            "step": step_bytes,
            "glb": glb_bytes,
            "validation": validation,
        }

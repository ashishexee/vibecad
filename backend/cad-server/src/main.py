import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from executor import execute_cadquery
from params import extract_parameters

app = FastAPI(title="VibeCAD CAD Server", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExecuteRequest(BaseModel):
    code: str
    params: dict[str, float] | None = None


class UpdateRequest(BaseModel):
    code: str
    params: dict[str, float]


@app.get("/health")
def health():
    return {"status": "ok", "service": "cad-server"}


@app.post("/execute")
def execute(req: ExecuteRequest):
    result = execute_cadquery(req.code, req.params)

    if not result["success"]:
        return {"success": False, "error": result["error"]}

    parameters = extract_parameters(req.code)
    validation = result.get("validation", {})

    return {
        "success": True,
        "parameters": parameters,
        "has_stl": result["stl"] is not None,
        "has_step": result["step"] is not None,
        "has_glb": result["glb"] is not None,
        "stl_base64": base64.b64encode(result["stl"]).decode() if result["stl"] else None,
        "step_base64": base64.b64encode(result["step"]).decode() if result["step"] else None,
        "glb_base64": base64.b64encode(result["glb"]).decode() if result["glb"] else None,
        "validation": validation,
    }


@app.post("/update-params")
def update_params(req: UpdateRequest):
    result = execute_cadquery(req.code, req.params)

    if not result["success"]:
        return {"success": False, "error": result["error"]}

    parameters = extract_parameters(req.code)
    validation = result.get("validation", {})

    return {
        "success": True,
        "parameters": parameters,
        "has_stl": result["stl"] is not None,
        "has_step": result["step"] is not None,
        "has_glb": result["glb"] is not None,
        "stl_base64": base64.b64encode(result["stl"]).decode() if result["stl"] else None,
        "step_base64": base64.b64encode(result["step"]).decode() if result["step"] else None,
        "glb_base64": base64.b64encode(result["glb"]).decode() if result["glb"] else None,
        "validation": validation,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

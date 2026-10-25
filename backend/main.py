"""
HealthLens API
Unified backend: Member 2 report processing + Member 3 rule-based analysis.
"""

import sys
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))
ROOT_DIR = BASE_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from backend.adapter import enrich_extracted_report
    from backend.extract import extract_report
    from backend.models import validate_analysis_request_payload
    from backend.service import analyze_lab_report
except ImportError:
    from adapter import enrich_extracted_report
    from extract import extract_report
    from models import validate_analysis_request_payload
    from service import analyze_lab_report


app = FastAPI(
    title="HealthLens API",
    description=(
        "Backend API for medical lab report processing, extraction, and "
        "rule-based analysis. Analysis is educational only and is not Adaption AI."
    ),
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}


@app.get("/api/health")
def get_health():
    """
    Health check endpoint.
    """
    return {
        "status": "ok",
        "service": "HealthLens API"
    }


@app.post("/api/upload")
async def upload_report(
    file: UploadFile = File(..., description="Report document (PDF, JPG, JPEG, or PNG)"),
    patient_id: str = Form(default="PATIENT-001", description="Identifier of the patient")
):
    """
    Upload and extract medical report data from PDF, JPG, JPEG, or PNG files.
    Returns structured JSON matching the project contract.
    """
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()

    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext or 'unknown'}'. Accepted formats are: PDF, JPG, JPEG, and PNG."
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read uploaded file: {str(e)}"
        )

    if not content or len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    try:
        clean_patient_id = patient_id.strip() or "PATIENT-001"
        result = extract_report(
            file_input=content,
            filename=filename,
            patient_id=clean_patient_id
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=400,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to process or read report: {str(e)}"
        )


@app.post("/api/v1/analyze")
def analyze_report(payload: Dict[str, Any]):
    """Rule-based analysis of an extracted report or prototype biomarker payload.

    Preferred input is the exact dictionary returned by extract_report() /
    POST /api/upload. Prototype {metadata, biomarkers} bodies remain supported
    for Member 3 tests. This endpoint does not diagnose or prescribe treatment.
    """
    if not isinstance(payload, dict) or not payload:
        raise HTTPException(status_code=422, detail="Request body must be a JSON object.")

    try:
        if "tests" in payload or "report" in payload:
            return enrich_extracted_report(payload)
        if "metadata" in payload or "biomarkers" in payload:
            validated = validate_analysis_request_payload(payload)
            return analyze_lab_report(validated)
        raise ValueError(
            "Unrecognized analysis payload. Send the extract_report() contract "
            "({report, tests, summary}) or a prototype {metadata, biomarkers} body."
        )
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal analysis processing error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

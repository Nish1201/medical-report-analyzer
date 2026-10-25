"""Data models and validation schemas for HealthLens.

Provides schema validation for lab report input and structured analysis output.
Supports Pydantic when available; provides a robust fallback validator using
standard-library dataclasses and typing when Pydantic is not installed.
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Union

# Mandatory Medical Disclaimer
MEDICAL_DISCLAIMER: str = (
    "DISCLAIMER: HealthLens is an informational and decision-support tool designed "
    "to assist users in understanding medical laboratory reports. It does not provide "
    "medical diagnosis, clinical prognosis, or treatment prescriptions. All laboratory results, "
    "biomarker evaluations, and health insights must be reviewed and interpreted by a "
    "licensed healthcare professional."
)

try:
    from pydantic import BaseModel, Field

    PYDANTIC_AVAILABLE = True

    class BiomarkerInput(BaseModel):
        name: str = Field(..., description="Name of the biomarker (e.g. Fasting Glucose)")
        value: float = Field(..., description="Observed numeric value")
        unit: str = Field(..., description="Unit of measurement (e.g. mg/dL)")
        reference_range_low: Optional[float] = Field(None, description="Standard lower reference bound")
        reference_range_high: Optional[float] = Field(None, description="Standard upper reference bound")
        category: Optional[str] = Field("General", description="Lab category (e.g. Metabolic, Lipid, Hematology)")

    class ReportMetadata(BaseModel):
        report_id: str = Field(..., description="Unique report identifier")
        patient_id: str = Field(..., description="Pseudonymized patient identifier")
        patient_age: Optional[int] = Field(None, ge=0, le=150, description="Patient age in years")
        patient_gender: Optional[str] = Field(None, description="Patient gender (e.g. M, F, Other)")
        collection_date: Optional[str] = Field(None, description="Sample collection date (YYYY-MM-DD)")
        laboratory_name: Optional[str] = Field(None, description="Issuing laboratory or facility name")

    class AnalysisRequest(BaseModel):
        metadata: ReportMetadata
        biomarkers: List[BiomarkerInput]
        notes: Optional[str] = Field(None, description="Clinical or patient notes")

    class BiomarkerResult(BaseModel):
        name: str
        value: float
        unit: str
        reference_range_low: Optional[float]
        reference_range_high: Optional[float]
        status: str  # NORMAL, HIGH, LOW, BORDERLINE, UNKNOWN
        severity: str  # NORMAL, WARNING, CRITICAL, INFO
        interpretation: str

    class AnalysisSummary(BaseModel):
        total_tests: int
        normal_count: int
        abnormal_count: int
        critical_count: int
        executive_summary: str
        key_findings: List[str]
        questions_for_doctor: List[str]

    class AnalysisResponse(BaseModel):
        status: str = "success"
        report_id: str
        analysis_type: str = "rule_based_baseline"
        summary: AnalysisSummary
        biomarkers: List[BiomarkerResult]
        disclaimer: str = MEDICAL_DISCLAIMER
        timestamp: str

except ImportError:
    PYDANTIC_AVAILABLE = False


# Standard Library Fallback Dataclasses and Validation Functions

@dataclass
class BiomarkerInputData:
    name: str
    value: float
    unit: str
    reference_range_low: Optional[float] = None
    reference_range_high: Optional[float] = None
    category: str = "General"


@dataclass
class ReportMetadataData:
    report_id: str
    patient_id: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    collection_date: Optional[str] = None
    laboratory_name: Optional[str] = None


@dataclass
class AnalysisRequestData:
    metadata: ReportMetadataData
    biomarkers: List[BiomarkerInputData]
    notes: Optional[str] = None


def validate_analysis_request_payload(payload: Any) -> Dict[str, Any]:
    """Validates raw JSON dictionary payload against the AnalysisRequest schema.

    Raises:
        ValueError: If required fields are missing, empty, or have invalid types.
    """
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object.")

    if "metadata" not in payload:
        raise ValueError("Missing required field: 'metadata'.")
    if not isinstance(payload["metadata"], dict):
        raise ValueError("Field 'metadata' must be an object.")

    meta = payload["metadata"]
    for req_field in ["report_id", "patient_id"]:
        if req_field not in meta or not str(meta[req_field]).strip():
            raise ValueError(f"Missing or empty required metadata field: '{req_field}'.")

    if "biomarkers" not in payload:
        raise ValueError("Missing required field: 'biomarkers'.")
    if not isinstance(payload["biomarkers"], list):
        raise ValueError("Field 'biomarkers' must be a list.")
    if len(payload["biomarkers"]) == 0:
        raise ValueError("Field 'biomarkers' must contain at least one biomarker entry.")

    validated_biomarkers = []
    for idx, bio in enumerate(payload["biomarkers"]):
        if not isinstance(bio, dict):
            raise ValueError(f"Biomarker at index {idx} must be an object.")

        for b_req in ["name", "value", "unit"]:
            if b_req not in bio:
                raise ValueError(f"Biomarker at index {idx} missing required field: '{b_req}'.")

        # Validate numeric value
        try:
            val = float(bio["value"])
        except (ValueError, TypeError):
            raise ValueError(f"Biomarker '{bio.get('name', idx)}' has non-numeric value: '{bio.get('value')}'.")

        ref_low = bio.get("reference_range_low")
        if ref_low is not None:
            try:
                ref_low = float(ref_low)
            except (ValueError, TypeError):
                raise ValueError(f"Biomarker '{bio.get('name')}' reference_range_low must be numeric.")

        ref_high = bio.get("reference_range_high")
        if ref_high is not None:
            try:
                ref_high = float(ref_high)
            except (ValueError, TypeError):
                raise ValueError(f"Biomarker '{bio.get('name')}' reference_range_high must be numeric.")

        validated_biomarkers.append({
            "name": str(bio["name"]).strip(),
            "value": val,
            "unit": str(bio["unit"]).strip(),
            "reference_range_low": ref_low,
            "reference_range_high": ref_high,
            "category": str(bio.get("category", "General")).strip()
        })

    return {
        "metadata": {
            "report_id": str(meta["report_id"]).strip(),
            "patient_id": str(meta["patient_id"]).strip(),
            "patient_age": meta.get("patient_age"),
            "patient_gender": meta.get("patient_gender"),
            "collection_date": meta.get("collection_date"),
            "laboratory_name": meta.get("laboratory_name")
        },
        "biomarkers": validated_biomarkers,
        "notes": payload.get("notes")
    }

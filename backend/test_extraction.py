"""
Unit & Integration Test Suite for HealthLens Backend Report Processing.
Validates:
1. Extraction from all 3 sample lab reports (PDF)
2. Contract structure compliance
3. Reference range parsing and status logic
4. FastAPI endpoints (GET /api/health, POST /api/upload)
5. Error handling for unsupported/empty/unreadable files
"""

import json
import sys
from pathlib import Path

# Ensure root and backend directories are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient

try:
    from backend.extract import (
        calculate_status,
        extract_from_pdf,
        extract_report,
        parse_reference_range,
    )
    from backend.main import app
except ImportError:
    from extract import (
        calculate_status,
        extract_from_pdf,
        extract_report,
        parse_reference_range,
    )
    from main import app


client = TestClient(app)
ROOT_DIR = Path(__file__).resolve().parent.parent
SAMPLE_DIR = ROOT_DIR / "sample_reports"


def test_reference_range_parsing():
    """Verify reference range parsing cases."""
    assert parse_reference_range("13.0 - 17.0") == (13.0, 17.0)
    assert parse_reference_range("70 - 99") == (70.0, 99.0)
    assert parse_reference_range("< 100") == (None, 100.0)
    assert parse_reference_range("<= 200") == (None, 200.0)
    assert parse_reference_range("> 40") == (40.0, None)
    assert parse_reference_range(">= 50") == (50.0, None)
    assert parse_reference_range("Up to 150") == (None, 150.0)
    assert parse_reference_range("-") == (None, None)
    assert parse_reference_range("") == (None, None)
    assert parse_reference_range(None) == (None, None)
    print("[PASS] test_reference_range_parsing passed")


def test_status_calculation():
    """Verify strict status determination rules."""
    # Standard range 13.0 - 17.0
    assert calculate_status(11.2, 13.0, 17.0) == "below_range"
    assert calculate_status(14.5, 13.0, 17.0) == "within_range"
    assert calculate_status(18.0, 13.0, 17.0) == "above_range"

    # Upper bound only (< 100)
    assert calculate_status(85, None, 100.0) == "within_range"
    assert calculate_status(105, None, 100.0) == "above_range"

    # Lower bound only (> 40)
    assert calculate_status(48, 40.0, None) == "within_range"
    assert calculate_status(35, 40.0, None) == "below_range"

    # No range printed
    assert calculate_status("O Positive", None, None) == "unknown"
    assert calculate_status(120, None, None) == "unknown"
    print("[PASS] test_status_calculation passed")


def test_contract_structure(data: dict, is_enriched: bool = False):
    """Verify data conforms strictly to the contract requirements."""
    assert "report" in data
    assert "summary" in data
    assert "tests" in data
    assert "related_findings" in data
    assert "doctor_questions" in data

    # Report object
    assert "report_id" in data["report"]
    assert "patient_id" in data["report"]
    assert "report_date" in data["report"]

    # Summary object
    assert "total" in data["summary"]
    assert "within_range" in data["summary"]
    assert "outside_range" in data["summary"]
    assert "unknown" in data["summary"]
    assert "text" in data["summary"]

    if not is_enriched:
        # Fields reserved for Member 3 must be empty in plain extraction
        assert data["summary"]["text"] == ""
        assert data["related_findings"] == []
        assert data["doctor_questions"] == []
        for t in data["tests"]:
            assert t["medical_explanation"] == ""
            assert t["simple_explanation"] == ""
            assert t["history"] == []
    else:
        # Fields enriched by Member 3 analysis
        assert isinstance(data["summary"]["text"], str)
        assert len(data["summary"]["text"]) > 0
        assert isinstance(data["related_findings"], list)
        assert isinstance(data["doctor_questions"], list)
        for t in data["tests"]:
            assert isinstance(t["medical_explanation"], str)
            assert isinstance(t["simple_explanation"], str)
            assert isinstance(t["history"], list)

    # Tests array
    for t in data["tests"]:
        assert "test_name" in t
        assert "value" in t
        assert "unit" in t
        assert "reference_low" in t
        assert "reference_high" in t
        assert "status" in t
        assert "medical_explanation" in t
        assert "simple_explanation" in t
        assert "history" in t

        # Status must be one of the four allowed values
        assert t["status"] in ("within_range", "below_range", "above_range", "unknown")

    # Total counts check
    assert data["summary"]["total"] == len(data["tests"])
    assert data["summary"]["within_range"] == sum(1 for t in data["tests"] if t["status"] == "within_range")
    assert data["summary"]["outside_range"] == sum(1 for t in data["tests"] if t["status"] in ("below_range", "above_range"))
    assert data["summary"]["unknown"] == sum(1 for t in data["tests"] if t["status"] == "unknown")


def test_sample_1_cbc():
    """Verify extraction on Sample 1: CBC Report."""
    pdf_path = SAMPLE_DIR / "cbc_report.pdf"
    assert pdf_path.exists(), f"File missing: {pdf_path}"

    result = extract_from_pdf(pdf_path, patient_id="P1001")
    test_contract_structure(result, is_enriched=False)

    assert result["report"]["patient_id"] == "P1001"
    assert result["report"]["report_date"] == "2026-10-15"
    assert result["summary"]["total"] == 7
    assert result["summary"]["unknown"] == 1
    assert result["summary"]["within_range"] == 3
    assert result["summary"]["outside_range"] == 3


    test_map = {t["test_name"]: t for t in result["tests"]}
    assert "Hemoglobin" in test_map
    assert test_map["Hemoglobin"]["value"] == 11.2
    assert test_map["Hemoglobin"]["unit"] == "g/dL"
    assert test_map["Hemoglobin"]["reference_low"] == 13.0
    assert test_map["Hemoglobin"]["reference_high"] == 17.0
    assert test_map["Hemoglobin"]["status"] == "below_range"

    assert "WBC Count" in test_map
    assert test_map["WBC Count"]["status"] == "within_range"

    assert "Blood Group" in test_map
    assert test_map["Blood Group"]["status"] == "unknown"
    assert test_map["Blood Group"]["reference_low"] is None
    assert test_map["Blood Group"]["reference_high"] is None

    print(f"[PASS] test_sample_1_cbc passed ({result['summary']['total']} tests, {result['summary']['within_range']} within, {result['summary']['outside_range']} outside)")


def test_sample_2_metabolic():
    """Verify extraction on Sample 2: Metabolic & Lipid Panel."""
    pdf_path = SAMPLE_DIR / "metabolic_panel.pdf"
    assert pdf_path.exists(), f"File missing: {pdf_path}"

    result = extract_from_pdf(pdf_path, patient_id="P1002")
    test_contract_structure(result, is_enriched=False)

    assert result["report"]["patient_id"] == "P1002"
    assert result["report"]["report_date"] == "2026-10-18"
    assert result["summary"]["total"] == 8
    assert result["summary"]["unknown"] == 0
    assert result["summary"]["within_range"] == 3
    assert result["summary"]["outside_range"] == 5

    test_map = {t["test_name"]: t for t in result["tests"]}
    assert test_map["Fasting Blood Glucose"]["status"] == "above_range"
    assert test_map["Total Cholesterol"]["status"] == "above_range"
    assert test_map["HDL Cholesterol"]["status"] == "within_range"
    assert test_map["Serum Creatinine"]["status"] == "within_range"

    print(f"[PASS] test_sample_2_metabolic passed ({result['summary']['total']} tests, {result['summary']['within_range']} within, {result['summary']['outside_range']} outside)")


def test_sample_3_thyroid():
    """Verify extraction on Sample 3: Thyroid & Vitamin Panel."""
    pdf_path = SAMPLE_DIR / "thyroid_panel.pdf"
    assert pdf_path.exists(), f"File missing: {pdf_path}"

    result = extract_from_pdf(pdf_path, patient_id="P1003")
    test_contract_structure(result, is_enriched=False)

    assert result["report"]["patient_id"] == "P1003"
    assert result["report"]["report_date"] == "2026-10-22"
    assert result["summary"]["total"] == 6
    assert result["summary"]["unknown"] == 1
    assert result["summary"]["within_range"] == 3
    assert result["summary"]["outside_range"] == 2

    test_map = {t["test_name"]: t for t in result["tests"]}
    assert test_map["TSH"]["status"] == "above_range"
    assert test_map["Free T4"]["status"] == "within_range"
    assert test_map["Vitamin D (25-OH)"]["status"] == "below_range"
    assert test_map["Urine Appearance"]["status"] == "unknown"

    print(f"[PASS] test_sample_3_thyroid passed ({result['summary']['total']} tests, {result['summary']['within_range']} within, {result['summary']['outside_range']} outside)")


def test_api_health():
    """Verify GET /api/health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "HealthLens API"
    print("[PASS] test_api_health passed")


def test_api_upload_endpoint():
    """Verify POST /api/upload endpoint with sample report returns enriched contract."""
    pdf_path = SAMPLE_DIR / "cbc_report.pdf"
    with open(pdf_path, "rb") as f:
        response = client.post(
            "/api/upload",
            files={"file": ("cbc_report.pdf", f, "application/pdf")},
            data={"patient_id": "PATIENT-999"}
        )

    assert response.status_code == 200
    data = response.json()
    test_contract_structure(data, is_enriched=True)
    assert data["report"]["patient_id"] == "PATIENT-999"
    assert len(data["tests"]) == 7
    assert data["summary"]["total"] == 7
    assert data["summary"]["within_range"] == 3
    assert data["summary"]["outside_range"] == 3
    assert data["summary"]["unknown"] == 1
    assert data["summary"]["text"] != ""
    print("[PASS] test_api_upload_endpoint passed")


def test_api_upload_fallback_when_analysis_fails():
    """Verify POST /api/upload returns plain extraction if enrichment fails."""
    from unittest.mock import patch
    pdf_path = SAMPLE_DIR / "cbc_report.pdf"
    with open(pdf_path, "rb") as f:
        with patch("backend.main.enrich_extracted_report", side_effect=RuntimeError("Simulated analysis error")):
            response = client.post(
                "/api/upload",
                files={"file": ("cbc_report.pdf", f, "application/pdf")},
                data={"patient_id": "PATIENT-999"}
            )

    assert response.status_code == 200
    data = response.json()
    test_contract_structure(data, is_enriched=False)
    assert data["report"]["patient_id"] == "PATIENT-999"
    assert data["summary"]["unknown"] == 1
    assert data["summary"]["text"] == ""
    print("[PASS] test_api_upload_fallback_when_analysis_fails passed")



def test_api_unsupported_file():
    """Verify POST /api/upload returns 400 for unsupported file types."""
    fake_txt = b"Hello world, this is a plain text file."
    response = client.post(
        "/api/upload",
        files={"file": ("notes.txt", fake_txt, "text/plain")},
        data={"patient_id": "PATIENT-001"}
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]
    print("[PASS] test_api_unsupported_file passed")


def test_api_empty_file():
    """Verify POST /api/upload returns 400 for empty files."""
    response = client.post(
        "/api/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
        data={"patient_id": "PATIENT-001"}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
    print("[PASS] test_api_empty_file passed")


def test_api_image_upload_missing_key():
    """Verify POST /api/upload with image when API key is missing returns 400 with helpful instruction."""
    # Create a small valid PNG in memory
    from PIL import Image
    import io
    img = Image.new("RGB", (50, 50), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    png_bytes = buf.getvalue()

    # Ensure no API keys in environment for this test
    import os
    orig_gemini = os.environ.pop("GEMINI_API_KEY", None)
    orig_google = os.environ.pop("GOOGLE_API_KEY", None)
    orig_openai = os.environ.pop("OPENAI_API_KEY", None)

    try:
        response = client.post(
            "/api/upload",
            files={"file": ("report_scan.png", png_bytes, "image/png")},
            data={"patient_id": "PATIENT-001"}
        )
        assert response.status_code == 400
        assert "Vision LLM API key not configured" in response.json()["detail"]
        print("[PASS] test_api_image_upload_missing_key passed")
    finally:
        if orig_gemini:
            os.environ["GEMINI_API_KEY"] = orig_gemini
        if orig_google:
            os.environ["GOOGLE_API_KEY"] = orig_google
        if orig_openai:
            os.environ["OPENAI_API_KEY"] = orig_openai


if __name__ == "__main__":
    print("\n--- Running HealthLens Backend Tests ---")
    test_reference_range_parsing()
    test_status_calculation()
    test_sample_1_cbc()
    test_sample_2_metabolic()
    test_sample_3_thyroid()
    test_api_health()
    test_api_upload_endpoint()
    test_api_upload_fallback_when_analysis_fails()
    test_api_unsupported_file()
    test_api_empty_file()
    test_api_image_upload_missing_key()
    print("\nAll tests passed successfully! [OK]\n")



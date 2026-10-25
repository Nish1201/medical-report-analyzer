"""Integration tests for Member 2 extraction contract -> Member 3 analysis.

Uses fictional sample PDFs and in-memory payloads only. Does not call external
vision APIs or send patient data.
"""

import copy
import json
import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from backend.adapter import enrich_extracted_report
from backend.models import MEDICAL_DISCLAIMER
from backend.sample_data import FICTIONAL_SAMPLE_REPORT

try:
    from fastapi.testclient import TestClient
    from backend.main import app

    FASTAPI_AVAILABLE = True
    client = TestClient(app)
except ImportError:
    FASTAPI_AVAILABLE = False
    client = None

try:
    from backend.extract import extract_from_pdf

    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    extract_from_pdf = None

SAMPLE_DIR = ROOT_DIR / "sample_reports"


class ExtractionAnalysisContractTests(unittest.TestCase):
    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI is not installed in this environment")
    def test_upload_still_returns_empty_member3_fields(self):
        """Verifies that POST /api/upload returns the enriched analysis contract by default."""
        pdf_path = SAMPLE_DIR / "cbc_report.pdf"
        with open(pdf_path, "rb") as handle:
            response = client.post(
                "/api/upload",
                files={"file": ("cbc_report.pdf", handle, "application/pdf")},
                data={"patient_id": "PATIENT-999"},
            )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["report"]["patient_id"], "PATIENT-999")
        self.assertEqual(data["summary"]["total"], 7)
        self.assertEqual(data["summary"]["within_range"], 3)
        self.assertEqual(data["summary"]["outside_range"], 3)
        self.assertEqual(data["summary"]["unknown"], 1)
        self.assertTrue(data["summary"]["text"])
        self.assertTrue(data["related_findings"])
        self.assertTrue(data["doctor_questions"])
        for test in data["tests"]:
            self.assertTrue(test["medical_explanation"])
            self.assertTrue(test["simple_explanation"])
            self.assertIsInstance(test["history"], list)

    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI is not installed in this environment")
    def test_upload_fallback_returns_plain_extraction_when_analysis_fails(self):
        """Verifies that if analysis fails, POST /api/upload falls back to plain extraction."""
        from unittest.mock import patch
        pdf_path = SAMPLE_DIR / "cbc_report.pdf"
        with open(pdf_path, "rb") as handle:
            with patch("backend.main.enrich_extracted_report", side_effect=RuntimeError("Analysis simulation error")):
                response = client.post(
                    "/api/upload",
                    files={"file": ("cbc_report.pdf", handle, "application/pdf")},
                    data={"patient_id": "PATIENT-999"},
                )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["report"]["patient_id"], "PATIENT-999")
        self.assertEqual(data["summary"]["total"], 7)
        self.assertEqual(data["summary"]["within_range"], 3)
        self.assertEqual(data["summary"]["outside_range"], 3)
        self.assertEqual(data["summary"]["unknown"], 1)
        self.assertEqual(data["summary"]["text"], "")
        self.assertEqual(data["related_findings"], [])
        self.assertEqual(data["doctor_questions"], [])
        for test in data["tests"]:
            self.assertEqual(test["medical_explanation"], "")
            self.assertEqual(test["simple_explanation"], "")
            self.assertEqual(test["history"], [])


    @unittest.skipUnless(
        FASTAPI_AVAILABLE and PDFPLUMBER_AVAILABLE,
        "FastAPI and pdfplumber are required for extraction-to-API contract tests",
    )
    def test_analyze_enriches_extracted_cbc_without_changing_statuses(self):
        extracted = extract_from_pdf(SAMPLE_DIR / "cbc_report.pdf", patient_id="P1001")
        original = copy.deepcopy(extracted)

        response = client.post("/api/v1/analyze", json=extracted)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["report"], original["report"])
        self.assertEqual(data["summary"]["total"], original["summary"]["total"])
        self.assertEqual(data["summary"]["within_range"], original["summary"]["within_range"])
        self.assertEqual(data["summary"]["outside_range"], original["summary"]["outside_range"])
        self.assertTrue(data["summary"]["text"])
        self.assertEqual(data["disclaimer"], MEDICAL_DISCLAIMER)
        self.assertEqual(data["analysis_engine"], "rule_based_baseline")
        self.assertIn("does not provide medical diagnosis", data["disclaimer"])
        self.assertNotIn("Adaption AI", json.dumps(data))

        original_map = {t["test_name"]: t for t in original["tests"]}
        for test in data["tests"]:
            source = original_map[test["test_name"]]
            self.assertEqual(test["value"], source["value"])
            self.assertEqual(test["unit"], source["unit"])
            self.assertEqual(test["reference_low"], source["reference_low"])
            self.assertEqual(test["reference_high"], source["reference_high"])
            self.assertEqual(test["status"], source["status"])
            self.assertTrue(test["medical_explanation"])
            self.assertTrue(test["simple_explanation"])
            self.assertNotIn("diagnosed with", test["medical_explanation"].lower())
            self.assertNotIn("prescribe", test["simple_explanation"].lower())

        blood_group = next(t for t in data["tests"] if t["test_name"] == "Blood Group")
        self.assertEqual(blood_group["status"], "unknown")
        self.assertIn("not a number", blood_group["simple_explanation"].lower())
        self.assertEqual(blood_group["history"], [])

        hemoglobin = next(t for t in data["tests"] if t["test_name"] == "Hemoglobin")
        self.assertEqual(hemoglobin["status"], "below_range")
        self.assertTrue(data["related_findings"])
        self.assertTrue(data["doctor_questions"])

    def test_categorical_value_skips_numeric_trend(self):
        payload = {
            "report": {"report_id": "rep_demo_cat", "patient_id": "P-SYNTH", "report_date": "2026-10-15"},
            "summary": {"total": 1, "within_range": 0, "outside_range": 0, "text": ""},
            "tests": [
                {
                    "test_name": "Blood Group",
                    "value": "O Positive",
                    "unit": "",
                    "reference_low": None,
                    "reference_high": None,
                    "status": "unknown",
                    "medical_explanation": "",
                    "simple_explanation": "",
                    "history": [12.0, 13.0],
                }
            ],
            "related_findings": [],
            "doctor_questions": [],
        }
        enriched = enrich_extracted_report(payload)
        self.assertEqual(enriched["tests"][0]["value"], "O Positive")
        self.assertEqual(enriched["tests"][0]["status"], "unknown")
        self.assertNotIn("Numeric trend label", enriched["tests"][0]["medical_explanation"])
        self.assertIn("not a number", enriched["tests"][0]["simple_explanation"].lower())

    def test_numeric_history_trend_is_described(self):
        payload = {
            "report": {"report_id": "rep_demo_trend", "patient_id": "P-SYNTH", "report_date": "2026-10-15"},
            "summary": {"total": 1, "within_range": 0, "outside_range": 1, "text": ""},
            "tests": [
                {
                    "test_name": "Hemoglobin",
                    "value": 11.2,
                    "unit": "g/dL",
                    "reference_low": 13.0,
                    "reference_high": 17.0,
                    "status": "below_range",
                    "medical_explanation": "",
                    "simple_explanation": "",
                    "history": [12.8, 12.0],
                }
            ],
            "related_findings": [],
            "doctor_questions": [],
        }
        enriched = enrich_extracted_report(payload)
        self.assertEqual(enriched["tests"][0]["status"], "below_range")
        self.assertEqual(enriched["tests"][0]["value"], 11.2)
        self.assertIn("Numeric trend label: decreasing", enriched["tests"][0]["medical_explanation"])

    def test_unknown_reference_range_is_not_compared(self):
        payload = {
            "report": {"report_id": "rep_demo_unknown", "patient_id": "P-SYNTH", "report_date": ""},
            "summary": {"total": 1, "within_range": 0, "outside_range": 0, "text": ""},
            "tests": [
                {
                    "test_name": "Custom Marker",
                    "value": 42.0,
                    "unit": "U/L",
                    "reference_low": None,
                    "reference_high": None,
                    "status": "unknown",
                    "medical_explanation": "",
                    "simple_explanation": "",
                    "history": [],
                }
            ],
            "related_findings": [],
            "doctor_questions": [],
        }
        enriched = enrich_extracted_report(payload)
        self.assertEqual(enriched["tests"][0]["status"], "unknown")
        self.assertIn("unknown", enriched["tests"][0]["medical_explanation"].lower())
        self.assertEqual(enriched["disclaimer"], MEDICAL_DISCLAIMER)

    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI is not installed in this environment")
    def test_analyze_rejects_missing_and_empty_input(self):
        missing = client.post("/api/v1/analyze", json={"hello": "world"})
        self.assertEqual(missing.status_code, 422)

        empty_tests = client.post(
            "/api/v1/analyze",
            json={
                "report": {"report_id": "r1", "patient_id": "p1", "report_date": ""},
                "tests": [],
            },
        )
        self.assertEqual(empty_tests.status_code, 422)
        self.assertIn("at least one", empty_tests.json()["detail"])

    @unittest.skipUnless(FASTAPI_AVAILABLE, "FastAPI is not installed in this environment")
    def test_prototype_payload_still_analyzes_on_unified_app(self):
        response = client.post("/api/v1/analyze", json=FICTIONAL_SAMPLE_REPORT)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["analysis_type"], "rule_based_baseline")
        self.assertEqual(body["disclaimer"], MEDICAL_DISCLAIMER)


if __name__ == "__main__":
    unittest.main()

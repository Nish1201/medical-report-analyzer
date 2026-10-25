"""Automated Test Suite for HealthLens Backend — Member 3.

Uses Python Standard Library `unittest` (compatible with `pytest`).
Tests:
1. Health endpoint (GET /api/v1/health)
2. Root endpoint (GET /)
3. Valid analysis request with fictional sample data (POST /api/v1/analyze)
4. Medical disclaimer presence and exact wording
5. Missing required metadata fields and error handling (422)
6. Empty biomarkers list validation (422)
7. Non-numeric biomarker value validation (422)
8. Unrecognized endpoint handling (404)
9. Baseline attribution (ensuring no unauthorized AI or diagnosis claims)
"""

import json
import unittest

from backend.models import (
    MEDICAL_DISCLAIMER,
    validate_analysis_request_payload
)
from backend.sample_data import FICTIONAL_SAMPLE_REPORT
from backend.server import dispatch_api_request
from backend.service import analyze_lab_report, evaluate_biomarker


class HealthLensBackendTests(unittest.TestCase):
    """Test suite validating HealthLens API specification and business logic."""

    def test_01_health_endpoint(self):
        """Verifies GET /api/v1/health returns 200 OK and valid health metadata."""
        status_code, body = dispatch_api_request("GET", "/api/v1/health")
        self.assertEqual(status_code, 200)
        self.assertEqual(body.get("status"), "healthy")
        self.assertEqual(body.get("service"), "HealthLens Backend")
        self.assertIn("mode", body)

    def test_02_root_endpoint(self):
        """Verifies GET / returns 200 and directory of available endpoints."""
        status_code, body = dispatch_api_request("GET", "/")
        self.assertEqual(status_code, 200)
        self.assertIn("endpoints", body)
        self.assertIn("health", body["endpoints"])
        self.assertIn("analyze", body["endpoints"])

    def test_03_valid_analysis_input(self):
        """Verifies POST /api/v1/analyze with fictional report returns 200 and structured results."""
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", FICTIONAL_SAMPLE_REPORT)
        self.assertEqual(status_code, 200)
        self.assertEqual(body.get("status"), "success")
        self.assertEqual(body.get("report_id"), "HL-DEMO-2026-001")
        self.assertEqual(body.get("analysis_type"), "rule_based_baseline")

        # Verify summary counts
        summary = body.get("summary", {})
        self.assertEqual(summary.get("total_tests"), 4)
        self.assertEqual(summary.get("normal_count"), 2)
        self.assertEqual(summary.get("abnormal_count"), 2)

        # Verify biomarker evaluations
        biomarkers = body.get("biomarkers", [])
        self.assertEqual(len(biomarkers), 4)

        glucose = next((b for b in biomarkers if b["name"] == "Fasting Blood Glucose"), None)
        self.assertIsNotNone(glucose)
        self.assertEqual(glucose["status"], "HIGH")

        potassium = next((b for b in biomarkers if b["name"] == "Serum Potassium"), None)
        self.assertIsNotNone(potassium)
        self.assertEqual(potassium["status"], "LOW")

        cholesterol = next((b for b in biomarkers if b["name"] == "Total Cholesterol"), None)
        self.assertIsNotNone(cholesterol)
        self.assertEqual(cholesterol["status"], "NORMAL")

        hemoglobin = next((b for b in biomarkers if b["name"] == "Hemoglobin"), None)
        self.assertIsNotNone(hemoglobin)
        self.assertEqual(hemoglobin["status"], "NORMAL")

    def test_04_medical_disclaimer_presence(self):
        """Verifies that the mandatory medical disclaimer is present in every analysis response."""
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", FICTIONAL_SAMPLE_REPORT)
        self.assertEqual(status_code, 200)
        disclaimer = body.get("disclaimer")
        self.assertIsNotNone(disclaimer)
        self.assertEqual(disclaimer, MEDICAL_DISCLAIMER)
        self.assertIn("informational and decision-support tool", disclaimer)
        self.assertIn("does not provide medical diagnosis", disclaimer)

    def test_05_invalid_input_missing_fields(self):
        """Verifies missing metadata fields returns 422 Unprocessable Entity."""
        invalid_payload = {
            "metadata": {
                # missing report_id and patient_id
                "laboratory_name": "Demo Lab"
            },
            "biomarkers": FICTIONAL_SAMPLE_REPORT["biomarkers"]
        }
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", invalid_payload)
        self.assertEqual(status_code, 422)
        self.assertEqual(body.get("error"), "Validation Error")
        self.assertIn("report_id", body.get("detail", ""))

    def test_06_invalid_input_empty_biomarkers(self):
        """Verifies empty biomarker list returns 422 with descriptive error."""
        invalid_payload = {
            "metadata": FICTIONAL_SAMPLE_REPORT["metadata"],
            "biomarkers": []
        }
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", invalid_payload)
        self.assertEqual(status_code, 422)
        self.assertEqual(body.get("error"), "Validation Error")
        self.assertIn("at least one biomarker", body.get("detail", ""))

    def test_07_invalid_input_non_numeric_biomarker_value(self):
        """Verifies non-numeric biomarker values return 422 validation error."""
        invalid_payload = {
            "metadata": FICTIONAL_SAMPLE_REPORT["metadata"],
            "biomarkers": [
                {
                    "name": "Fasting Blood Glucose",
                    "value": "positive_reading",  # Invalid string instead of numeric
                    "unit": "mg/dL"
                }
            ]
        }
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", invalid_payload)
        self.assertEqual(status_code, 422)
        self.assertIn("non-numeric value", body.get("detail", ""))

    def test_08_not_found_endpoint(self):
        """Verifies unrecognized endpoints return 404 Not Found."""
        status_code, body = dispatch_api_request("GET", "/api/v1/nonexistent")
        self.assertEqual(status_code, 404)
        self.assertEqual(body.get("error"), "Not Found")

    def test_09_medical_safety_and_attribution(self):
        """Verifies that rule-based attribution is maintained and no clinical diagnosis is claimed."""
        status_code, body = dispatch_api_request("POST", "/api/v1/analyze", FICTIONAL_SAMPLE_REPORT)
        self.assertEqual(status_code, 200)

        # Confirm attribution
        self.assertEqual(body.get("analysis_type"), "rule_based_baseline")

        # Confirm non-diagnostic language: ensure diagnosis and prescription claims are absent
        full_text = json.dumps(body).lower()
        self.assertNotIn("diagnosed with", full_text)
        self.assertNotIn("prescribe", full_text)
        self.assertNotIn("treatment plan:", full_text)


if __name__ == "__main__":
    unittest.main()

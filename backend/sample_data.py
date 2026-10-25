"""Fictional Sample Lab Report Data for HealthLens Testing.

NOTICE: All data in this file is purely synthetic and intended strictly
for automated testing and developmental validation of the HealthLens API.
None of this data corresponds to real patients or actual clinical records.
"""

from typing import Dict, Any

FICTIONAL_SAMPLE_REPORT: Dict[str, Any] = {
    "metadata": {
        "report_id": "HL-DEMO-2026-001",
        "patient_id": "PT-SYNTHETIC-994",
        "patient_age": 42,
        "patient_gender": "Female",
        "collection_date": "2026-10-24",
        "laboratory_name": "HealthLens Synthetic Diagnostics Lab (Demo)"
    },
    "biomarkers": [
        {
            "name": "Fasting Blood Glucose",
            "value": 118.0,
            "unit": "mg/dL",
            "reference_range_low": 70.0,
            "reference_range_high": 99.0,
            "category": "Metabolic Panel"
        },
        {
            "name": "Total Cholesterol",
            "value": 185.0,
            "unit": "mg/dL",
            "reference_range_low": 125.0,
            "reference_range_high": 200.0,
            "category": "Lipid Panel"
        },
        {
            "name": "Hemoglobin",
            "value": 13.8,
            "unit": "g/dL",
            "reference_range_low": 12.0,
            "reference_range_high": 15.5,
            "category": "Complete Blood Count"
        },
        {
            "name": "Serum Potassium",
            "value": 2.9,
            "unit": "mmol/L",
            "reference_range_low": 3.5,
            "reference_range_high": 5.0,
            "category": "Electrolyte Panel"
        }
    ],
    "notes": "Synthetic routine wellness panel data used for API automated testing."
}

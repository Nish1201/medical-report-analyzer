"""HealthLens Analysis Service — Member 3 (AI/Data/Backend)

Core baseline analysis engine providing rule-based biomarker evaluation,
summary generation, and clinical safety checks.

IMPORTANT MEDICAL & SAFETY COMPLIANCE:
- This is a rule-based baseline analysis engine (Phase 1).
- Genuine AI integration (e.g. Adaption AI) is not active until official
  documentation, credentials, and models are configured.
- No clinical diagnosis is produced; observations are strictly comparative against
  reference intervals.
- The mandatory medical disclaimer is embedded in every response.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List

try:
    from .models import MEDICAL_DISCLAIMER
except ImportError:
    from models import MEDICAL_DISCLAIMER


def evaluate_biomarker(bio: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluates an individual biomarker against its reference range.

    Produces status (NORMAL, HIGH, LOW, UNKNOWN), severity tier,
    and factual non-diagnostic interpretation.
    """
    name = bio["name"]
    val = bio["value"]
    unit = bio["unit"]
    low = bio.get("reference_range_low")
    high = bio.get("reference_range_high")

    if low is None and high is None:
        return {
            "name": name,
            "value": val,
            "unit": unit,
            "reference_range_low": None,
            "reference_range_high": None,
            "status": "UNKNOWN",
            "severity": "INFO",
            "interpretation": f"Recorded value is {val} {unit}. Standard reference range was not provided in the report."
        }

    status = "NORMAL"
    severity = "NORMAL"
    interpretation = ""

    if high is not None and val > high:
        status = "HIGH"
        # Check critical threshold (e.g., > 50% above upper limit)
        if val >= high * 1.5:
            severity = "CRITICAL"
            interpretation = (
                f"Markedly elevated: Observed value {val} {unit} substantially exceeds upper reference bound of {high} {unit}. "
                "Requires timely clinical review."
            )
        else:
            severity = "WARNING"
            interpretation = (
                f"Elevated: Observed value {val} {unit} exceeds normal upper bound of {high} {unit}. "
                "Discuss potential dietary, lifestyle, or metabolic factors with your physician."
            )
    elif low is not None and val < low:
        status = "LOW"
        # Check critical threshold (e.g., < 30% below lower limit)
        if val <= low * 0.7:
            severity = "CRITICAL"
            interpretation = (
                f"Markedly low: Observed value {val} {unit} is substantially below lower reference bound of {low} {unit}. "
                "Requires timely clinical review."
            )
        else:
            severity = "WARNING"
            interpretation = (
                f"Below range: Observed value {val} {unit} is below normal lower bound of {low} {unit}. "
                "Consult your healthcare provider for evaluation."
            )
    else:
        status = "NORMAL"
        severity = "NORMAL"
        range_str = f"({low} - {high} {unit})" if low is not None and high is not None else f"(threshold {high or low} {unit})"
        interpretation = f"Within standard reference interval {range_str}."

    return {
        "name": name,
        "value": val,
        "unit": unit,
        "reference_range_low": low,
        "reference_range_high": high,
        "status": status,
        "severity": severity,
        "interpretation": interpretation
    }


def analyze_lab_report(validated_request: Dict[str, Any]) -> Dict[str, Any]:
    """Processes validated lab report data into a structured clinical analysis response.

    Adheres to strict non-diagnostic and medical safety rules.
    """
    metadata = validated_request["metadata"]
    raw_biomarkers = validated_request["biomarkers"]

    evaluated_biomarkers: List[Dict[str, Any]] = []
    normal_count = 0
    abnormal_count = 0
    critical_count = 0
    key_findings: List[str] = []
    questions_for_doctor: List[str] = []

    for bio in raw_biomarkers:
        result = evaluate_biomarker(bio)
        evaluated_biomarkers.append(result)

        if result["status"] == "NORMAL":
            normal_count += 1
        elif result["status"] in ("HIGH", "LOW"):
            abnormal_count += 1
            if result["severity"] == "CRITICAL":
                critical_count += 1
                key_findings.append(f"Critical {result['status'].lower()}: {result['name']} at {result['value']} {result['unit']}.")
                questions_for_doctor.append(
                    f"My {result['name']} level is significantly {result['status'].lower()} ({result['value']} {result['unit']}). What immediate follow-up or confirmatory tests are recommended?"
                )
            else:
                key_findings.append(f"Out of range: {result['name']} is {result['status'].lower()} ({result['value']} {result['unit']}).")
                questions_for_doctor.append(
                    f"What lifestyle, dietary, or clinical factors could explain the {result['status'].lower()} {result['name']} result?"
                )

    total_tests = len(evaluated_biomarkers)

    if abnormal_count == 0:
        executive_summary = (
            f"All {total_tests} evaluated biomarkers are within standard reference intervals. "
            "Continue regular preventative care and review results with your physician."
        )
        questions_for_doctor.append("Are there any routine health screenings or preventive tests recommended for my age group?")
    else:
        crit_msg = f" ({critical_count} markedly out of range)" if critical_count > 0 else ""
        executive_summary = (
            f"Report analysis evaluated {total_tests} test items. {normal_count} items are within normal limits, "
            f"and {abnormal_count} item(s) are flagged outside standard reference intervals{crit_msg}. "
            "Please review the detailed findings below with your doctor."
        )

    summary = {
        "total_tests": total_tests,
        "normal_count": normal_count,
        "abnormal_count": abnormal_count,
        "critical_count": critical_count,
        "executive_summary": executive_summary,
        "key_findings": key_findings if key_findings else ["All tested parameters are within normal reference ranges."],
        "questions_for_doctor": questions_for_doctor
    }

    return {
        "status": "success",
        "report_id": metadata["report_id"],
        "analysis_type": "rule_based_baseline",
        "summary": summary,
        "biomarkers": evaluated_biomarkers,
        "disclaimer": MEDICAL_DISCLAIMER,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

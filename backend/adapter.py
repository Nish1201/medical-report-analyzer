"""Adapter from Member 2 extraction contract to Member 3 rule-based analysis.

Accepts the exact dictionary returned by extract_report() and fills the
Member 3 fields without changing extraction statuses or measured values.

This engine is rule-based only. It does not diagnose, prescribe, or claim
Adaption AI (or any other AI) integration.
"""

from __future__ import annotations

import copy
from typing import Any, Dict, List, Optional, Tuple

try:
    from backend.models import MEDICAL_DISCLAIMER
except ImportError:
    from models import MEDICAL_DISCLAIMER

ANALYSIS_ENGINE = "rule_based_baseline"
ALLOWED_STATUSES = {"within_range", "below_range", "above_range", "unknown"}


def _as_float(value: Any) -> Optional[float]:
    """Return a float when value is numeric; otherwise None. No invented values."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.strip().replace(",", "")
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def _history_numeric_values(history: Any) -> List[float]:
    """Extract numeric prior values only. Ignore categorical or malformed entries."""
    if not isinstance(history, list):
        return []
    numeric: List[float] = []
    for item in history:
        if isinstance(item, dict):
            numeric_value = _as_float(item.get("value"))
        else:
            numeric_value = _as_float(item)
        if numeric_value is not None:
            numeric.append(numeric_value)
    return numeric


def _trend_phrase(current: Optional[float], history: Any) -> Tuple[Optional[str], str]:
    """Describe a numeric trend when at least one prior numeric point exists."""
    if current is None:
        return None, ""
    prior = _history_numeric_values(history)
    if not prior:
        return None, ""

    previous = prior[-1]
    delta = current - previous
    # Treat very small relative change as stable when a scale exists.
    scale = max(abs(current), abs(previous), 1.0)
    if abs(delta) / scale < 0.02:
        label = "stable"
        phrase = (
            f" Compared with the most recent prior numeric result ({previous}), "
            "the current value is similar (no substantial numeric change)."
        )
    elif delta > 0:
        label = "increasing"
        phrase = (
            f" Compared with the most recent prior numeric result ({previous}), "
            "the current value is higher."
        )
    else:
        label = "decreasing"
        phrase = (
            f" Compared with the most recent prior numeric result ({previous}), "
            "the current value is lower."
        )
    return label, phrase


def _explanations_for_test(test: Dict[str, Any]) -> Tuple[str, str]:
    name = str(test.get("test_name") or "This test")
    value = test.get("value")
    unit = str(test.get("unit") or "").strip()
    unit_text = f" {unit}" if unit else ""
    status = test.get("status")
    low = test.get("reference_low")
    high = test.get("reference_high")
    numeric_value = _as_float(value)
    trend_label, trend_phrase = _trend_phrase(numeric_value, test.get("history"))

    range_bits = []
    if low is not None:
        range_bits.append(f"lower printed bound {low}{unit_text}")
    if high is not None:
        range_bits.append(f"upper printed bound {high}{unit_text}")
    range_text = " and ".join(range_bits) if range_bits else "no printed numeric reference interval"

    if numeric_value is None:
        medical = (
            f"{name} is recorded as '{value}'{unit_text}. This result is not a number, "
            "so HealthLens did not compare it with a numeric reference interval and did not "
            "calculate a trend. This is a rule-based reading of the printed report only."
        )
        simple = (
            f"{name} is listed as '{value}'. Because it is not a number "
            "(for example a blood type), it was not labeled high or low and no trend was calculated. "
            "Ask your clinician if you need this result explained."
        )
        return medical, simple

    if status == "within_range":
        medical = (
            f"{name} is {numeric_value}{unit_text}, which falls within the printed reference "
            f"interval ({range_text}). A within-range comparison is informational only and is not a diagnosis."
            f"{trend_phrase}"
        )
        simple = (
            f"{name} is {numeric_value}{unit_text}, which is inside the range printed on this report. "
            "That is useful context, not a medical conclusion."
            f"{trend_phrase}"
        )
    elif status == "above_range":
        medical = (
            f"{name} is {numeric_value}{unit_text}, which is above the printed reference interval "
            f"({range_text}). Being above a printed interval can have many explanations and is not by itself "
            "a diagnosis or a treatment recommendation."
            f"{trend_phrase}"
        )
        simple = (
            f"{name} is {numeric_value}{unit_text}, which is higher than the range printed on this report. "
            "Review this with a licensed clinician; HealthLens does not diagnose or recommend treatment."
            f"{trend_phrase}"
        )
    elif status == "below_range":
        medical = (
            f"{name} is {numeric_value}{unit_text}, which is below the printed reference interval "
            f"({range_text}). Being below a printed interval can have many explanations and is not by itself "
            "a diagnosis or a treatment recommendation."
            f"{trend_phrase}"
        )
        simple = (
            f"{name} is {numeric_value}{unit_text}, which is lower than the range printed on this report. "
            "Review this with a licensed clinician; HealthLens does not diagnose or recommend treatment."
            f"{trend_phrase}"
        )
    else:
        medical = (
            f"{name} is {numeric_value}{unit_text}. A numeric comparison was not applied "
            f"({range_text}). Status remains unknown. This is a rule-based observation only."
            f"{trend_phrase}"
        )
        simple = (
            f"{name} is {numeric_value}{unit_text}. HealthLens did not label it high or low because "
            "a usable printed number range was not available. Ask your clinician for interpretation."
            f"{trend_phrase}"
        )

    if trend_label:
        medical += f" Numeric trend label: {trend_label}."
    return medical, simple


def _related_findings(tests: List[Dict[str, Any]]) -> List[str]:
    findings: List[str] = []
    outside = [t for t in tests if t.get("status") in ("below_range", "above_range")]
    unknown = [t for t in tests if t.get("status") == "unknown"]
    if outside:
        names = ", ".join(str(t.get("test_name")) for t in outside)
        findings.append(
            "Rule-based comparison flagged these printed results as outside the report's "
            f"numeric reference interval: {names}. This is not a diagnosis."
        )
    if unknown:
        names = ", ".join(str(t.get("test_name")) for t in unknown)
        findings.append(
            "These items were recorded without a numeric high/low comparison "
            f"(non-numeric result and/or no printed range): {names}."
        )
    if not findings:
        findings.append(
            "All listed numeric tests were within the printed reference intervals on this report. "
            "That observation is educational and does not confirm overall health."
        )
    return findings


def _doctor_questions(tests: List[Dict[str, Any]]) -> List[str]:
    questions: List[str] = []
    for test in tests:
        status = test.get("status")
        name = test.get("test_name")
        value = test.get("value")
        unit = str(test.get("unit") or "").strip()
        unit_text = f" {unit}" if unit else ""
        if status in ("below_range", "above_range"):
            direction = "below" if status == "below_range" else "above"
            questions.append(
                f"My {name} result is {value}{unit_text}, which this tool compared as {direction} "
                "the printed reference interval. What does this mean in my clinical context?"
            )
        elif status == "unknown" and _as_float(test.get("value")) is None:
            questions.append(
                f"My report lists {name} as '{value}'. Could you explain this non-numeric result?"
            )
    questions.append(
        "Are any additional tests, repeat measurements, or routine follow-up appropriate for my age and history?"
    )
    return questions


def _summary_text(extracted: Dict[str, Any], tests: List[Dict[str, Any]]) -> str:
    summary = extracted.get("summary") if isinstance(extracted.get("summary"), dict) else {}
    total = summary.get("total", len(tests))
    within = summary.get("within_range", sum(1 for t in tests if t.get("status") == "within_range"))
    outside = summary.get("outside_range", sum(1 for t in tests if t.get("status") in ("below_range", "above_range")))
    unknown = sum(1 for t in tests if t.get("status") == "unknown")
    return (
        f"Rule-based summary of {total} extracted test item(s): {within} within the printed numeric interval, "
        f"{outside} outside that interval, and {unknown} without a numeric comparison. "
        "HealthLens is an educational decision-support view of the printed report. It does not diagnose "
        "conditions or recommend treatment. Review all results with a licensed healthcare professional."
    )


def validate_extracted_report(payload: Any) -> Dict[str, Any]:
    """Validate Member 2 extract_report() contract. Raises ValueError on invalid input."""
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object matching the extraction contract.")
    if "report" not in payload or not isinstance(payload["report"], dict):
        raise ValueError("Missing required field: 'report'.")
    report = payload["report"]
    if not str(report.get("report_id") or "").strip():
        raise ValueError("Missing or empty required report field: 'report_id'.")
    if not str(report.get("patient_id") or "").strip():
        raise ValueError("Missing or empty required report field: 'patient_id'.")
    if "tests" not in payload:
        raise ValueError("Missing required field: 'tests'.")
    if not isinstance(payload["tests"], list):
        raise ValueError("Field 'tests' must be a list.")
    if len(payload["tests"]) == 0:
        raise ValueError("Field 'tests' must contain at least one extracted test entry.")
    for idx, test in enumerate(payload["tests"]):
        if not isinstance(test, dict):
            raise ValueError(f"Test at index {idx} must be an object.")
        if not str(test.get("test_name") or "").strip():
            raise ValueError(f"Test at index {idx} is missing 'test_name'.")
        if "value" not in test:
            raise ValueError(f"Test '{test.get('test_name')}' is missing 'value'.")
        status = test.get("status")
        if status not in ALLOWED_STATUSES:
            raise ValueError(
                f"Test '{test.get('test_name')}' has invalid status '{status}'. "
                "Allowed: within_range, below_range, above_range, unknown."
            )
    return payload


def enrich_extracted_report(extracted: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy of extract_report() output with Member 3 fields filled."""
    validated = validate_extracted_report(extracted)
    enriched = copy.deepcopy(validated)

    tests = enriched.get("tests") or []
    for test in tests:
        medical, simple = _explanations_for_test(test)
        test["medical_explanation"] = medical
        test["simple_explanation"] = simple
        if not isinstance(test.get("history"), list):
            test["history"] = []

    if not isinstance(enriched.get("summary"), dict):
        enriched["summary"] = {}
    original_summary = validated.get("summary") if isinstance(validated.get("summary"), dict) else {}
    enriched["summary"]["total"] = original_summary.get("total", len(tests))
    enriched["summary"]["within_range"] = original_summary.get(
        "within_range",
        sum(1 for t in tests if t.get("status") == "within_range"),
    )
    enriched["summary"]["outside_range"] = original_summary.get(
        "outside_range",
        sum(1 for t in tests if t.get("status") in ("below_range", "above_range")),
    )
    enriched["summary"]["unknown"] = original_summary.get(
        "unknown",
        sum(1 for t in tests if t.get("status") == "unknown"),
    )
    enriched["summary"]["text"] = _summary_text(enriched, tests)

    enriched["related_findings"] = _related_findings(tests)
    enriched["doctor_questions"] = _doctor_questions(tests)
    enriched["disclaimer"] = MEDICAL_DISCLAIMER
    enriched["analysis_engine"] = ANALYSIS_ENGINE
    return enriched

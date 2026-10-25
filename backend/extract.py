"""
HealthLens - Report Extraction Module
Owner: Member 2 (Report Processing / Backend Owner)

Provides modular extraction functions for medical reports:
- PDF processing using pdfplumber
- Image/scan processing using vision-capable LLM (Gemini / OpenAI) via .env configuration
- Reference range parsing and strict status evaluation (within_range, below_range, above_range, unknown)
- Standardized contract output for Member 3 analysis integration
"""

import base64
import io
import json
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, BinaryIO, Dict, List, Optional, Tuple, Union

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


def parse_reference_range(ref_str: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """
    Parse a printed reference range string into (reference_low, reference_high).
    Never invents values or ranges. Returns (None, None) if range is not printed or unparseable.

    Examples:
        "13.0 - 17.0" -> (13.0, 17.0)
        "70-99"       -> (70.0, 99.0)
        "< 100"       -> (None, 100.0)
        "<= 200"      -> (None, 200.0)
        "> 40"        -> (40.0, None)
        ">= 50"       -> (50.0, None)
        "Up to 150"   -> (None, 150.0)
        "-" or ""     -> (None, None)
    """
    if not ref_str:
        return None, None

    cleaned = ref_str.strip().replace(",", "")
    cleaned_lower = cleaned.lower()

    if cleaned in ("-", "--", "---", "n/a", "nil", "none", "") or "not established" in cleaned_lower:
        return None, None

    # Case 1: Standard low - high range (e.g., "13.0 - 17.0", "70-99", "4.0 to 11.0")
    hyphen_pattern = r"^\s*([0-9]+(?:\.[0-9]+)?)\s*(?:-|–|—|to)\s*([0-9]+(?:\.[0-9]+)?)\s*$"
    m = re.match(hyphen_pattern, cleaned, re.IGNORECASE)
    if m:
        try:
            return float(m.group(1)), float(m.group(2))
        except ValueError:
            return None, None

    # Case 2: Upper bound inequality (e.g., "< 100", "<= 200", "≤ 150", "up to 150", "less than 200")
    upper_pattern = r"^\s*(?:<|<=|≤|up\s+to|less\s+than)\s*([0-9]+(?:\.[0-9]+)?)\s*$"
    m_up = re.match(upper_pattern, cleaned, re.IGNORECASE)
    if m_up:
        try:
            return None, float(m_up.group(1))
        except ValueError:
            return None, None

    # Case 3: Lower bound inequality (e.g., "> 40", ">= 50", "≥ 50", "greater than 40")
    lower_pattern = r"^\s*(?:>|>=|≥|greater\s+than|more\s+than)\s*([0-9]+(?:\.[0-9]+)?)\s*$"
    m_low = re.match(lower_pattern, cleaned, re.IGNORECASE)
    if m_low:
        try:
            return float(m_low.group(1)), None
        except ValueError:
            return None, None

    return None, None


def clean_numeric_value(val_str: Any) -> Optional[float]:
    """
    Extract a numeric float from test value if applicable.
    Handles flags (e.g., '14.2*', '115 (H)', '< 0.5').
    """
    if val_str is None:
        return None
    if isinstance(val_str, (int, float)):
        return float(val_str)

    s = str(val_str).strip().replace(",", "")
    # Remove surrounding flag marks like *, (H), (L), etc.
    s = re.sub(r"[\*\(\)HL]+", "", s).strip()

    # Match simple float or int
    m = re.search(r"[-+]?[0-9]*\.?[0-9]+", s)
    if m:
        try:
            return float(m.group(0))
        except ValueError:
            return None
    return None


def calculate_status(
    value: Any,
    reference_low: Optional[float],
    reference_high: Optional[float]
) -> str:
    """
    Calculate status strictly using printed reference range:
    - within_range
    - below_range
    - above_range
    - unknown (when no reference range is printed or value is non-numeric)
    """
    if reference_low is None and reference_high is None:
        return "unknown"

    num_val = clean_numeric_value(value)
    if num_val is None:
        return "unknown"

    # Both low and high defined
    if reference_low is not None and reference_high is not None:
        if num_val < reference_low:
            return "below_range"
        elif num_val > reference_high:
            return "above_range"
        else:
            return "within_range"

    # Only lower bound defined (e.g., > 40)
    if reference_low is not None and reference_high is None:
        if num_val < reference_low:
            return "below_range"
        else:
            return "within_range"

    # Only upper bound defined (e.g., < 100)
    if reference_high is not None and reference_low is None:
        if num_val > reference_high:
            return "above_range"
        else:
            return "within_range"

    return "unknown"


def extract_report_date(text: str) -> Optional[str]:
    """
    Extract report date from text using regex patterns.
    Returns normalized date string (YYYY-MM-DD when possible) or None.
    """
    patterns = [
        # YYYY-MM-DD
        r"(?:Report\s*Date|Date\s*of\s*Report|Collection\s*Date|Date)\s*[:\-]?\s*([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2})",
        # DD/MM/YYYY or MM/DD/YYYY
        r"(?:Report\s*Date|Date\s*of\s*Report|Collection\s*Date|Date)\s*[:\-]?\s*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})",
        # DD-Mon-YYYY or DD Month YYYY
        r"(?:Report\s*Date|Date\s*of\s*Report|Collection\s*Date|Date)\s*[:\-]?\s*([0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4})",
        # Fallback raw ISO date
        r"\b(20[2-3][0-9]-[0-1][0-9]-[0-3][0-9])\b"
    ]

    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            raw_date = m.group(1).strip()
            # Try parsing to ISO format
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y", "%d %b %Y", "%d %B %Y"):
                try:
                    return datetime.strptime(raw_date, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return raw_date
    return None


def build_contract_response(
    patient_id: str,
    report_date: Optional[str],
    tests: List[Dict[str, Any]],
    report_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Build structured dictionary adhering strictly to the contract format:
    - report (report_id, patient_id, report_date)
    - summary (total, within_range, outside_range, text)
    - tests (test_name, value, unit, reference_low, reference_high, status,
             medical_explanation, simple_explanation, history)
    - related_findings: []
    - doctor_questions: []

    Leaves medical_explanation, simple_explanation, summary.text,
    related_findings and doctor_questions empty for Member 3.
    """
    total = len(tests)
    within_count = sum(1 for t in tests if t.get("status") == "within_range")
    outside_count = sum(1 for t in tests if t.get("status") in ("below_range", "above_range"))

    return {
        "report": {
            "report_id": report_id or f"rep_{uuid.uuid4().hex[:12]}",
            "patient_id": patient_id or "PATIENT-001",
            "report_date": report_date or ""
        },
        "summary": {
            "total": total,
            "within_range": within_count,
            "outside_range": outside_count,
            "text": ""  # Filled by Member 3
        },
        "tests": tests,
        "related_findings": [],  # Filled by Member 3
        "doctor_questions": []   # Filled by Member 3
    }


def _identify_columns(headers: List[str]) -> Tuple[Optional[int], Optional[int], Optional[int], Optional[int]]:
    """
    Identify column indices for (test_name, result_value, unit, reference_range).
    """
    name_col = None
    value_col = None
    unit_col = None
    ref_col = None

    for idx, header in enumerate(headers):
        if not header:
            continue
        h = header.strip().lower()

        if any(term in h for term in ["test", "investigation", "analyte", "parameter", "description"]):
            if name_col is None:
                name_col = idx
        elif any(term in h for term in ["result", "value", "observed", "finding"]):
            if value_col is None:
                value_col = idx
        elif any(term in h for term in ["unit", "uom"]):
            if unit_col is None:
                unit_col = idx
        elif any(term in h for term in ["reference", "interval", "biological", "normal", "range"]):
            if ref_col is None:
                ref_col = idx

    return name_col, value_col, unit_col, ref_col


def extract_from_pdf(
    file_input: Union[str, Path, bytes, BinaryIO],
    patient_id: str = "PATIENT-001"
) -> Dict[str, Any]:
    """
    Extract test results and metadata from a text-based PDF using pdfplumber.
    Follows strict reference range and status rules.
    """
    import pdfplumber

    if isinstance(file_input, (str, Path)):
        pdf_file = open(file_input, "rb")
        should_close = True
    elif isinstance(file_input, bytes):
        pdf_file = io.BytesIO(file_input)
        should_close = False
    else:
        pdf_file = file_input
        should_close = False

    try:
        raw_tests: List[Dict[str, Any]] = []
        full_text = ""

        with pdfplumber.open(pdf_file) as pdf:
            if not pdf.pages:
                raise ValueError("PDF file has no pages.")

            for page in pdf.pages:
                page_text = page.extract_text() or ""
                full_text += page_text + "\n"

                # Method 1: Structured table extraction
                tables = page.extract_tables() or []
                for table in tables:
                    if not table or len(table) < 2:
                        continue

                    # Search for header row
                    header_idx = -1
                    col_map = (None, None, None, None)
                    for r_idx, row in enumerate(table):
                        cleaned_row = [str(c) if c else "" for c in row]
                        col_map = _identify_columns(cleaned_row)
                        if col_map[0] is not None and col_map[1] is not None:
                            header_idx = r_idx
                            break

                    name_idx, val_idx, unit_idx, ref_idx = col_map

                    # If header found, extract rows
                    if header_idx != -1 and name_idx is not None and val_idx is not None:
                        for row in table[header_idx + 1:]:
                            if not row or len(row) <= max(filter(lambda x: x is not None, col_map)):
                                continue

                            test_name = (row[name_idx] or "").strip()
                            val_str = (row[val_idx] or "").strip()
                            unit_str = (row[unit_idx] or "").strip() if unit_idx is not None and unit_idx < len(row) else ""
                            ref_str = (row[ref_idx] or "").strip() if ref_idx is not None and ref_idx < len(row) else ""

                            if not test_name or not val_str:
                                continue

                            # Skip summary/category header rows without value
                            if test_name.lower().endswith(":") or not val_str:
                                continue

                            ref_low, ref_high = parse_reference_range(ref_str)
                            status = calculate_status(val_str, ref_low, ref_high)
                            num_val = clean_numeric_value(val_str)

                            raw_tests.append({
                                "test_name": test_name,
                                "value": num_val if num_val is not None else val_str,
                                "unit": unit_str,
                                "reference_low": ref_low,
                                "reference_high": ref_high,
                                "status": status,
                                "medical_explanation": "",  # Empty for Member 3
                                "simple_explanation": "",   # Empty for Member 3
                                "history": []               # Empty for Member 3
                            })

                # Method 2: Fallback line-by-line parsing if no tables yielded results
                if not raw_tests and page_text:
                    lines = page_text.splitlines()
                    for line in lines:
                        line = line.strip()
                        # Common pattern: Test Name   Value   Unit   Ref Range
                        line_match = re.match(
                            r"^([A-Za-z0-9\s\(\)\/\-\,\.]+?)\s{2,}([<>]?\s*[0-9]+(?:\.[0-9]+)?|[A-Za-z]+)\s+([A-Za-z0-9%\^/\-]+)?\s*([0-9<>\s\.\-–to]+|-|N/A)?$",
                            line
                        )
                        if line_match:
                            t_name = line_match.group(1).strip()
                            v_raw = line_match.group(2).strip()
                            u_raw = (line_match.group(3) or "").strip()
                            r_raw = (line_match.group(4) or "").strip()

                            if t_name.lower() in ("test name", "investigation", "parameter"):
                                continue

                            ref_low, ref_high = parse_reference_range(r_raw)
                            status = calculate_status(v_raw, ref_low, ref_high)
                            num_val = clean_numeric_value(v_raw)

                            raw_tests.append({
                                "test_name": t_name,
                                "value": num_val if num_val is not None else v_raw,
                                "unit": u_raw if u_raw != "-" else "",
                                "reference_low": ref_low,
                                "reference_high": ref_high,
                                "status": status,
                                "medical_explanation": "",
                                "simple_explanation": "",
                                "history": []
                            })

        # Deduplicate tests by test_name while preserving order
        unique_tests: List[Dict[str, Any]] = []
        seen_names = set()
        for t in raw_tests:
            name_key = t["test_name"].lower().strip()
            if name_key not in seen_names:
                seen_names.add(name_key)
                unique_tests.append(t)

        report_date = extract_report_date(full_text)

        return build_contract_response(
            patient_id=patient_id,
            report_date=report_date,
            tests=unique_tests
        )

    finally:
        if should_close:
            pdf_file.close()


def extract_from_image(
    image_input: Union[str, Path, bytes, BinaryIO],
    patient_id: str = "PATIENT-001",
    mime_type: str = "image/png"
) -> Dict[str, Any]:
    """
    Extract test results from an image/scan by calling a vision-capable LLM.
    Reads API key from .env (GEMINI_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY)
    and returns JSON strictly conforming to the contract format.
    Never hard-codes API keys.
    """
    import requests

    # Read image bytes
    if isinstance(image_input, (str, Path)):
        path = Path(image_input)
        if not path.exists():
            raise FileNotFoundError(f"Image file not found: {image_input}")
        with open(path, "rb") as f:
            image_bytes = f.read()
        suffix = path.suffix.lower()
        if suffix in (".jpg", ".jpeg"):
            mime_type = "image/jpeg"
        elif suffix == ".png":
            mime_type = "image/png"
    elif isinstance(image_input, bytes):
        image_bytes = image_input
    else:
        image_bytes = image_input.read()

    if not image_bytes:
        raise ValueError("Image content is empty.")

    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    # API Keys check
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not gemini_key and not openai_key:
        raise ValueError(
            "Vision LLM API key not configured. Please set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env"
        )

    extraction_prompt = (
        "You are an expert medical lab report parser. Analyze this lab report image and extract all laboratory test results and the report date.\n"
        "Return a valid JSON object matching this exact structure:\n"
        "{\n"
        '  "report_date": "YYYY-MM-DD or string date, or null if not found",\n'
        '  "tests": [\n'
        "    {\n"
        '      "test_name": "Name of test",\n'
        '      "value": 14.2 or "string value",\n'
        '      "unit": "unit string or empty string",\n'
        '      "reference_low": number or null,\n'
        '      "reference_high": number or null\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        "CRITICAL RULES:\n"
        "1. Extract ONLY the reference range printed on the report.\n"
        "2. If no reference range is printed for a test, set reference_low to null and reference_high to null.\n"
        "3. NEVER invent or hallucinate values or reference ranges.\n"
        "4. Return valid JSON only, without markdown fences or extra commentary."
    )

    extracted_date: Optional[str] = None
    parsed_tests: List[Dict[str, Any]] = []

    if gemini_key:
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": extraction_prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        resp = requests.post(url, json=payload, timeout=60)
        if resp.status_code != 200:
            raise RuntimeError(f"Gemini Vision API request failed ({resp.status_code}): {resp.text}")

        res_json = resp.json()
        raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
        data = json.loads(raw_text)
        extracted_date = data.get("report_date")
        for item in data.get("tests", []):
            parsed_tests.append(item)

    elif openai_key:
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {openai_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": extraction_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{b64_image}"
                            }
                        }
                    ]
                }
            ],
            "response_format": {"type": "json_object"}
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        if resp.status_code != 200:
            raise RuntimeError(f"OpenAI Vision API request failed ({resp.status_code}): {resp.text}")

        res_json = resp.json()
        raw_text = res_json["choices"][0]["message"]["content"]
        data = json.loads(raw_text)
        extracted_date = data.get("report_date")
        for item in data.get("tests", []):
            parsed_tests.append(item)

    # Format tests into contract structure with strict status computation
    formatted_tests: List[Dict[str, Any]] = []
    for item in parsed_tests:
        t_name = str(item.get("test_name", "")).strip()
        if not t_name:
            continue
        v_raw = item.get("value")
        u_raw = str(item.get("unit", "") or "").strip()
        ref_low = item.get("reference_low")
        ref_high = item.get("reference_high")

        # Ensure float or None
        ref_low = float(ref_low) if ref_low is not None else None
        ref_high = float(ref_high) if ref_high is not None else None

        num_val = clean_numeric_value(v_raw)
        status = calculate_status(v_raw, ref_low, ref_high)

        formatted_tests.append({
            "test_name": t_name,
            "value": num_val if num_val is not None else v_raw,
            "unit": u_raw,
            "reference_low": ref_low,
            "reference_high": ref_high,
            "status": status,
            "medical_explanation": "",  # Empty for Member 3
            "simple_explanation": "",   # Empty for Member 3
            "history": []               # Empty for Member 3
        })

    return build_contract_response(
        patient_id=patient_id,
        report_date=extracted_date,
        tests=formatted_tests
    )


def extract_report(
    file_input: Union[str, Path, bytes, BinaryIO],
    filename: str,
    patient_id: str = "PATIENT-001"
) -> Dict[str, Any]:
    """
    Unified entry point for extracting lab reports from PDF or images (JPG, JPEG, PNG).
    Modularly callable by Member 3 or other backend components.
    """
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        return extract_from_pdf(file_input, patient_id=patient_id)
    elif ext in (".jpg", ".jpeg", ".png"):
        mime = "image/jpeg" if ext in (".jpg", ".jpeg") else "image/png"
        return extract_from_image(file_input, patient_id=patient_id, mime_type=mime)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Accepted formats: PDF, JPG, JPEG, PNG.")

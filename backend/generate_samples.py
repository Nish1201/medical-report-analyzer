"""
Script to generate 3 fictional sample lab reports for HealthLens.
Saves PDF files into sample_reports/ directory.
"""

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def create_sample_report(
    filename: Path,
    report_title: str,
    patient_id: str,
    patient_name: str,
    report_date: str,
    test_rows: list
):
    filename.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(filename),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1A365D"),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4A5568")
    )
    meta_style = ParagraphStyle(
        "MetaText",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#2D3748")
    )
    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=10,
        leading=12,
        fontName="Helvetica-Bold",
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1A202C")
    )

    story = []

    # Lab Header
    story.append(Paragraph("HealthLens Clinical Diagnostics & Laboratory", title_style))
    story.append(Paragraph("100 Healthcare Boulevard, Suite 400 | Certified Medical Lab", subtitle_style))
    story.append(Spacer(1, 12))

    # Patient & Report Metadata Table
    meta_data = [
        [
            Paragraph(f"<b>Patient Name:</b> {patient_name}", meta_style),
            Paragraph(f"<b>Report Date:</b> {report_date}", meta_style)
        ],
        [
            Paragraph(f"<b>Patient ID:</b> {patient_id}", meta_style),
            Paragraph(f"<b>Report Status:</b> Completed", meta_style)
        ],
        [
            Paragraph(f"<b>Referring Physician:</b> Dr. Robert Vance, MD", meta_style),
            Paragraph(f"<b>Panel:</b> {report_title}", meta_style)
        ]
    ]

    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7FAFC")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#EDF2F7")),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # Test Results Table
    table_data = [
        [
            Paragraph("Investigation", table_header_style),
            Paragraph("Result", table_header_style),
            Paragraph("Units", table_header_style),
            Paragraph("Biological Reference Interval", table_header_style)
        ]
    ]

    for row in test_rows:
        table_data.append([
            Paragraph(row[0], table_cell_style),
            Paragraph(row[1], table_cell_style),
            Paragraph(row[2], table_cell_style),
            Paragraph(row[3], table_cell_style)
        ])

    results_table = Table(table_data, colWidths=[200, 90, 80, 150])
    results_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2B6CB0")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFC")])
    ]))
    story.append(results_table)
    story.append(Spacer(1, 20))

    # Footer note
    footer_style = ParagraphStyle(
        "FooterNote",
        parent=styles["Italic"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#718096")
    )
    story.append(Paragraph(
        "Note: Results must be interpreted in clinical context by a qualified physician. "
        "Reference ranges are specific to HealthLens Clinical Diagnostics test methodologies.",
        footer_style
    ))

    doc.build(story)
    print(f"Generated sample report: {filename}")


def main():
    root_dir = Path(__file__).resolve().parent.parent
    sample_dir = root_dir / "sample_reports"
    sample_dir.mkdir(parents=True, exist_ok=True)

    # Report 1: Complete Blood Count (CBC)
    create_sample_report(
        filename=sample_dir / "cbc_report.pdf",
        report_title="Complete Blood Count (CBC)",
        patient_id="P1001",
        patient_name="Eleanor Rigby",
        report_date="2026-10-15",
        test_rows=[
            ["Hemoglobin", "11.2", "g/dL", "13.0 - 17.0"],
            ["WBC Count", "6.8", "10^3/uL", "4.0 - 11.0"],
            ["RBC Count", "4.1", "10^6/uL", "4.3 - 5.9"],
            ["Hematocrit (PCV)", "33.5", "%", "38.0 - 50.0"],
            ["Platelet Count", "250", "10^3/uL", "150 - 450"],
            ["MCV", "88.0", "fL", "80.0 - 100.0"],
            ["Blood Group", "O Positive", "-", "-"]
        ]
    )

    # Report 2: Comprehensive Metabolic & Lipid Panel
    create_sample_report(
        filename=sample_dir / "metabolic_panel.pdf",
        report_title="Comprehensive Metabolic & Lipid Panel",
        patient_id="P1002",
        patient_name="Arthur Dent",
        report_date="2026-10-18",
        test_rows=[
            ["Fasting Blood Glucose", "118", "mg/dL", "70 - 99"],
            ["HbA1c", "6.3", "%", "4.0 - 5.6"],
            ["Total Cholesterol", "215", "mg/dL", "< 200"],
            ["Triglycerides", "165", "mg/dL", "< 150"],
            ["HDL Cholesterol", "48", "mg/dL", "> 40"],
            ["LDL Cholesterol", "134", "mg/dL", "< 100"],
            ["Serum Creatinine", "0.95", "mg/dL", "0.60 - 1.20"],
            ["Blood Urea Nitrogen", "16.0", "mg/dL", "7.0 - 20.0"]
        ]
    )

    # Report 3: Thyroid Function & Vitamin Panel
    create_sample_report(
        filename=sample_dir / "thyroid_panel.pdf",
        report_title="Thyroid Function & Vitamin Panel",
        patient_id="P1003",
        patient_name="Clara Oswald",
        report_date="2026-10-22",
        test_rows=[
            ["TSH", "5.4", "uIU/mL", "0.40 - 4.20"],
            ["Free T4", "1.15", "ng/dL", "0.80 - 1.80"],
            ["Free T3", "3.1", "pg/mL", "2.3 - 4.2"],
            ["Vitamin D (25-OH)", "19.5", "ng/mL", "30.0 - 100.0"],
            ["Serum Calcium", "9.4", "mg/dL", "8.5 - 10.2"],
            ["Urine Appearance", "Clear", "-", "-"]
        ]
    )


if __name__ == "__main__":
    main()

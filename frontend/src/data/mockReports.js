/**
 * HealthLens - Mock Reports (Stand-in only)
 * 
 * BACKEND INTEGRATION NOTE:
 * Matches the canonical report schema defined in `reportService.js`.
 */

export const mockReports = [
  {
    id: "rep-cbc-2026-10-18",
    patient_id: "PT-88219",
    patient_name: "Ananya Sharma",
    age: 24,
    sex: "Female",
    report_date: "18 October 2026",
    report_type: "Complete Blood Count",
    lab_name: "Apex Diagnostics & Wellness Lab",
    tests: [
      {
        test_name: "Hemoglobin",
        category: "Red Blood Cells",
        value: 12.8,
        unit: "g/dL",
        reference_low: 12.0,
        reference_high: 15.5,
        status: "within_range",
        medical_explanation: "Hemoglobin is an iron-rich protein in red blood cells that transports oxygen across tissues.",
        simple_explanation: "Your Hemoglobin is within the reference range shown on this report.",
        simple_explanation_hi: "आपका हीमोग्लोबिन इस रिपोर्ट में दिखाई गई संदर्भ सीमा के भीतर है।"
      },
      {
        test_name: "Fasting Glucose",
        category: "Metabolism",
        value: 108,
        unit: "mg/dL",
        reference_low: 70,
        reference_high: 99,
        status: "above_range",
        medical_explanation: "Fasting glucose measures circulating blood sugar following an overnight fast.",
        simple_explanation: "Your result is above the reference range shown on this report (70-99 mg/dL). One result doesn't tell the full story, so your doctor can help explain what it means for you.",
        simple_explanation_hi: "आपका परिणाम इस रिपोर्ट में दी गई संदर्भ सीमा (70-99 mg/dL) से ऊपर है। एक परिणाम पूरी स्थिति नहीं बताता, इसलिए आपका डॉक्टर यह समझाने में मदद कर सकता है कि इसका आपके लिए क्या अर्थ है।"
      },
      {
        test_name: "MCV",
        category: "Red Blood Cells",
        value: 78.4,
        unit: "fL",
        reference_low: 80.0,
        reference_high: 100.0,
        status: "below_range",
        medical_explanation: "Mean Corpuscular Volume measures the average physical size of your red blood cells.",
        simple_explanation: "Your result is slightly below the reference range shown on this report. Doctors usually look at this together with other red blood cell values such as hemoglobin and MCH.",
        simple_explanation_hi: "आपका परिणाम इस रिपोर्ट में दिखाई गई संदर्भ सीमा से थोड़ा नीचे है। डॉक्टर आमतौर पर इसे हीमोग्लोबिन और MCH जैसे अन्य लाल रक्त कोशिका मानों के साथ मिलाकर देखते हैं।"
      },
      {
        test_name: "White Blood Cell Count (WBC)",
        category: "Immune System",
        value: 6.4,
        unit: "×10³/µL",
        reference_low: 4.5,
        reference_high: 11.0,
        status: "within_range",
        medical_explanation: "White blood cells defend against infection and immune challenges.",
        simple_explanation: "Your White Blood Cell Count (WBC) is within the reference range shown on this report.",
        simple_explanation_hi: "आपकी श्वेत रक्त कोशिका संख्या (WBC) इस रिपोर्ट में दिखाई गई संदर्भ सीमा के भीतर है।"
      },
      {
        test_name: "Platelet Count",
        category: "Coagulation",
        value: 242,
        unit: "×10³/µL",
        reference_low: 150,
        reference_high: 450,
        status: "within_range",
        medical_explanation: "Platelets assist in normal blood clotting.",
        simple_explanation: "Your Platelet Count is within the reference range shown on this report.",
        simple_explanation_hi: "आपकी प्लेटलेट संख्या इस रिपोर्ट में दिखाई गई संदर्भ सीमा के भीतर है।"
      },
      {
        test_name: "Creatinine",
        category: "Kidney Function",
        value: 0.88,
        unit: "mg/dL",
        reference_low: 0.6,
        reference_high: 1.2,
        status: "within_range",
        medical_explanation: "Serum creatinine reflects normal muscle metabolism filtered by the kidneys.",
        simple_explanation: "Your Creatinine is within the reference range shown on this report.",
        simple_explanation_hi: "आपका क्रिएटिनिन इस रिपोर्ट में दिखाई गई संदर्भ सीमा के भीतर है।"
      }
    ],
    summary: {
      total: 6,
      within_range: 4,
      outside_range: 2,
      unknown: 0,
      text: "Most values in this report are within the reference ranges shown on your report. Two results are slightly outside their ranges: Fasting Glucose (above) and MCV (below). These may be useful to review with your doctor."
    },
    related_findings: [
      {
        title: "These results may be useful to look at together",
        tests: ["Hemoglobin", "MCV", "MCH"],
        text: "These values relate to characteristics of your red blood cells. Reviewing them together may provide more context than looking at one result alone."
      }
    ],
    doctor_questions: [
      "Has my hemoglobin changed compared with my previous reports?",
      "Could you explain what my fasting glucose result means for me?",
      "Could you explain my MCV result, and whether it should be looked at together with my other blood count values?",
      "Should any of these tests be repeated, and when?"
    ]
  },
  {
    id: "rep-cbc-2026-08-01",
    patient_id: "PT-88219",
    patient_name: "Ananya Sharma",
    age: 24,
    sex: "Female",
    report_date: "01 August 2026",
    report_type: "Complete Blood Count",
    lab_name: "City Health Labs",
    tests: [
      {
        test_name: "Hemoglobin",
        category: "Red Blood Cells",
        value: 13.2,
        unit: "g/dL",
        reference_low: 12.0,
        reference_high: 15.5,
        status: "within_range",
        medical_explanation: "Hemoglobin transports oxygen from lungs to body tissues.",
        simple_explanation: "Your Hemoglobin is within the reference range shown on this report."
      },
      {
        test_name: "Fasting Glucose",
        category: "Metabolism",
        value: 94,
        unit: "mg/dL",
        reference_low: 70,
        reference_high: 99,
        status: "within_range",
        medical_explanation: "Fasting glucose concentration.",
        simple_explanation: "Your Fasting Glucose is within the reference range shown on this report."
      },
      {
        test_name: "Creatinine",
        category: "Kidney Function",
        value: 0.85,
        unit: "mg/dL",
        reference_low: 0.6,
        reference_high: 1.2,
        status: "within_range",
        medical_explanation: "Waste byproduct filtered by kidneys.",
        simple_explanation: "Your Creatinine is within the reference range shown on this report."
      }
    ],
    summary: {
      total: 3,
      within_range: 3,
      outside_range: 0,
      unknown: 0,
      text: "All 3 tests in this report are within the standard reference ranges."
    },
    related_findings: [],
    doctor_questions: [
      "Are these results consistent with my expected baseline health?"
    ]
  },
  {
    id: "rep-routine-2026-06-12",
    patient_id: "PT-88219",
    patient_name: "Ananya Sharma",
    age: 24,
    sex: "Female",
    report_date: "12 June 2026",
    report_type: "Routine Blood Test",
    lab_name: "Metro Care Diagnostic Centre",
    tests: [
      {
        test_name: "Hemoglobin",
        category: "Red Blood Cells",
        value: 13.5,
        unit: "g/dL",
        reference_low: 12.0,
        reference_high: 15.5,
        status: "within_range",
        medical_explanation: "Protein that transports oxygen across tissues.",
        simple_explanation: "Your Hemoglobin is within the reference range shown on this report."
      },
      {
        test_name: "Fasting Glucose",
        category: "Metabolism",
        value: 91,
        unit: "mg/dL",
        reference_low: 70,
        reference_high: 99,
        status: "within_range",
        medical_explanation: "Fasting blood sugar level.",
        simple_explanation: "Your Fasting Glucose is within the reference range shown on this report."
      },
      {
        test_name: "Blood Group",
        category: "Immunohematology",
        value: "O Positive",
        unit: "",
        reference_low: null,
        reference_high: null,
        status: "unknown",
        medical_explanation: "ABO and Rh factor antigen grouping.",
        simple_explanation: "Your blood type is O Positive."
      }
    ],
    summary: {
      total: 3,
      within_range: 2,
      outside_range: 0,
      unknown: 1,
      text: "Two tests are within reference bounds and one qualitative blood typing parameter is recorded."
    },
    related_findings: [],
    doctor_questions: []
  }
];

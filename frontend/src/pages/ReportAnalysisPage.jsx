import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import { ReportOverviewCard } from "../components/report/ReportOverviewCard";
import { TestResultCard } from "../components/report/TestResultCard";
import { RelatedFindingsCard } from "../components/report/RelatedFindingsCard";
import { DoctorQuestionsCard } from "../components/report/DoctorQuestionsCard";
import { normalizeStatus } from "../utils/status";
import {
  Calendar,
  Building2,
  User,
  Printer,
  ChevronLeft
} from "lucide-react";

export function ReportAnalysisPage() {
  const { t } = useLanguage();
  const { currentReport, reports, navigateTo, patient } = useReport();
  const [activeFilter, setActiveFilter] = useState("all");

  const report = currentReport || (reports && reports[0]);

  React.useEffect(() => {
    if (!report) {
      navigateTo("upload");
    }
  }, [report, navigateTo]);

  if (!report) {
    return null;
  }

  // Filter tests based on user selection: 'review' matches above, below, attention, or unknown
  const tests = report.tests || [];
  const filteredTests = tests.filter((test) => {
    const canonical = normalizeStatus(test.status, test.value, test.reference_low, test.reference_high);
    if (activeFilter === "normal") return canonical === "within";
    if (activeFilter === "review") return canonical !== "within";
    return true; // 'all'
  });

  const handlePrint = () => {
    window.print();
  };

  const scrollToQuestions = () => {
    const el = document.getElementById("doctor-questions-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const pName = patient?.name || report.patient_name || "";
  const pAge = patient?.age || report.age || "";
  const pSex = patient?.sex || report.sex || "";

  return (
    <div className="content-container animate-fade-in">
      {/* Back Navigation & Print Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <button
          type="button"
          onClick={() => navigateTo("reports")}
          className="btn-subtle"
          style={{ paddingLeft: 0 }}
        >
          <ChevronLeft size={16} />
          <span>{t("my_reports_heading")}</span>
        </button>

        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary"
            style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
          >
            <Printer size={14} />
            <span>{t("print_report")}</span>
          </button>
        </div>
      </div>

      {/* Hero Report Header Card */}
      <div
        style={{
          padding: "1.75rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--slate-200)",
          boxShadow: "var(--shadow-card)",
          marginBottom: "1.75rem"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.25rem"
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                fontSize: "0.74rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--teal-primary)",
                backgroundColor: "var(--teal-surface)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.5rem"
              }}
            >
              {t("report_header_badge")}
            </div>
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--teal-900)",
                letterSpacing: "-0.025em",
                lineHeight: 1.2
              }}
            >
              {report.report_type}
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                fontSize: "0.88rem",
                color: "var(--slate-500)",
                marginTop: "0.65rem",
                flexWrap: "wrap"
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Calendar size={15} color="var(--teal-primary)" />
                <strong style={{ color: "var(--slate-700)" }}>{report.report_date}</strong>
              </span>

              <span>•</span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <User size={15} color="var(--teal-primary)" />
                <span>
                  {t("patient_label")}: <strong style={{ color: "var(--slate-800)" }}>{pName}</strong> {pAge && `(${pAge}y, ${pSex})`}
                </span>
              </span>

              <span>•</span>

              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Building2 size={15} color="var(--teal-primary)" />
                <span>{report.lab_name}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. REPORT OVERVIEW (Calm Summary & Derived breakdown counts) */}
      <ReportOverviewCard
        report={report}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* 2. TEST RESULTS LIST (Renamed to 'Your Results') */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem"
          }}
        >
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--slate-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("your_results_heading")} ({filteredTests.length})
          </div>
        </div>

        {filteredTests.map((test, index) => (
          <TestResultCard key={test.test_name || index} test={test} />
        ))}
      </section>

      {/* 3. RELATED FINDINGS SECTION (Hidden if empty) */}
      {report.related_findings && report.related_findings.length > 0 && (
        <RelatedFindingsCard
          relatedFindings={report.related_findings}
          onDiscussClick={scrollToQuestions}
        />
      )}

      {/* 4. QUESTIONS TO ASK YOUR DOCTOR SECTION (Hidden if empty) */}
      {report.doctor_questions && report.doctor_questions.length > 0 && (
        <DoctorQuestionsCard doctorQuestions={report.doctor_questions} />
      )}
    </div>
  );
}

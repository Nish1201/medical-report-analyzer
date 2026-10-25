import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { normalizeStatus, isNumeric } from "../utils/status";
import {
  UploadCloud,
  TrendingUp,
  ArrowRight,
  Calendar,
  Building2,
  FileText,
  HelpCircle
} from "lucide-react";

export function DashboardPage() {
  const { language, t } = useLanguage();
  const { reports, currentReport, navigateTo, patient, trends } = useReport();

  const recentReport = currentReport || (reports && reports[0]);

  const firstName = patient?.name ? patient.name.trim().split(/\s+/)[0] : "";
  const greetingText = firstName ? `${t("greeting_prefix")}, ${firstName}` : t("greeting_prefix");

  // Summary counts and review badge calculation
  const tests = recentReport?.tests || [];
  const reviewCount = tests.filter((test) => {
    const canon = normalizeStatus(test.status, test.value, test.reference_low, test.reference_high);
    return canon !== "within";
  }).length;

  const totalTests = recentReport?.summary?.total || tests.length;
  const withinCount = recentReport?.summary?.within_range !== undefined
    ? recentReport.summary.within_range
    : tests.filter((test) => normalizeStatus(test.status, test.value, test.reference_low, test.reference_high) === "within").length;
  const outsideCount = recentReport?.summary?.outside_range !== undefined
    ? recentReport.summary.outside_range
    : reviewCount;

  // Fallback sentence if summary.text is empty
  const fallbackSummary = language === "hi"
    ? `${totalTests} परीक्षण विश्लेषित। ${withinCount} संदर्भ सीमा के भीतर हैं और ${outsideCount} बाहर हैं।`
    : `${totalTests} tests analyzed. ${withinCount} are within the reference range and ${outsideCount} are outside it.`;

  const summaryText = recentReport?.summary?.text || fallbackSummary;

  // Recent Results: up to 3 numeric tests, preferring tests outside range first
  const numericTests = tests.filter((t) => isNumeric(t.value));
  const sortedNumeric = [...numericTests].sort((a, b) => {
    const aCanon = normalizeStatus(a.status, a.value, a.reference_low, a.reference_high);
    const bCanon = normalizeStatus(b.status, b.value, b.reference_low, b.reference_high);
    const aOutside = aCanon !== "within" ? 1 : 0;
    const bOutside = bCanon !== "within" ? 1 : 0;
    return bOutside - aOutside;
  });
  const recentResultsToShow = sortedNumeric.slice(0, 3);

  // Dynamic trend preview for available longitudinal parameter
  const previewTrendKey = Object.keys(trends || {})[0];
  const previewTrend = (trends && trends[previewTrendKey]) || null;
  const historyPoints = previewTrend?.history || [];
  const latestPoint = historyPoints[historyPoints.length - 1];
  const latestCanon = latestPoint && isNumeric(latestPoint.value) && isNumeric(previewTrend?.reference_low) && isNumeric(previewTrend?.reference_high)
    ? normalizeStatus(null, latestPoint.value, previewTrend.reference_low, previewTrend.reference_high)
    : "within";

  const trendSentence = historyPoints.length > 0
    ? (language === "hi"
        ? `आपका ${previewTrend.test_name} पिछली ${historyPoints.length} रिपोर्टों में ${historyPoints.map((h) => h.value).join(", ")} रहा। नवीनतम मान रिपोर्ट पर दिखाई गई संदर्भ सीमा के ${latestCanon === "above" ? "ऊपर" : latestCanon === "below" ? "नीचे" : "भीतर"} है।`
        : `Your ${previewTrend.test_name} was ${historyPoints.map((h) => h.value).join(", ")} across your last ${historyPoints.length} reports. The latest value is ${latestCanon === "above" ? "above" : latestCanon === "below" ? "below" : "within"} the reference range shown on the report.`)
    : "";

  const hasReports = reports && reports.length > 0 && !!recentReport;

  return (
    <div className="content-container animate-fade-in">
      {/* Welcome Banner & Primary Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.25rem",
          marginBottom: "2rem"
        }}
      >
        <div>
          <h2 className="heading-xl">{greetingText}</h2>
          <p className="text-sub" style={{ marginTop: "0.25rem" }}>
            {t("greeting_sub")}
          </p>
        </div>

        {hasReports && (
          <button
            type="button"
            onClick={() => navigateTo("upload")}
            className="btn-primary"
            style={{ padding: "0.75rem 1.4rem", fontSize: "0.95rem" }}
          >
            <UploadCloud size={18} />
            <span>{t("btn_upload_new")}</span>
          </button>
        )}
      </div>

      {/* DASHBOARD WITH NO REPORTS EMPTY STATE */}
      {!hasReports ? (
        <section
          className="card"
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--slate-200)",
            boxShadow: "var(--shadow-card)",
            maxWidth: "760px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              backgroundColor: "var(--teal-surface)",
              color: "var(--teal-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
              border: "1px solid var(--teal-border)"
            }}
          >
            <UploadCloud size={32} strokeWidth={1.8} />
          </div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--teal-900)",
              marginBottom: "0.5rem"
            }}
          >
            {t("empty_dashboard_title")}
          </h3>

          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--slate-600)",
              maxWidth: "520px",
              margin: "0 auto 1.75rem auto",
              lineHeight: 1.55
            }}
          >
            {t("empty_dashboard_sub")}
          </p>

          <button
            type="button"
            onClick={() => navigateTo("upload")}
            className="btn-primary"
            style={{
              padding: "0.85rem 1.8rem",
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              margin: "0 auto 2.5rem auto",
              boxShadow: "0 4px 12px rgba(4, 127, 140, 0.28)"
            }}
          >
            <UploadCloud size={18} />
            <span>{t("btn_upload_new")}</span>
          </button>

          {/* Small 3-step reminder */}
          <div
            style={{
              paddingTop: "2rem",
              borderTop: "1px solid var(--slate-150)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1.25rem",
              textAlign: "left"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <UploadCloud size={18} />
              </div>
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-700)" }}>
                {t("empty_step_1")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <FileText size={18} />
              </div>
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-700)" }}>
                {t("empty_step_2")}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <HelpCircle size={18} />
              </div>
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-700)" }}>
                {t("empty_step_3")}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <>

      {/* RECENT REPORT HERO CARD */}
      {recentReport && (
        <section style={{ marginBottom: "2.25rem" }}>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "var(--teal-primary)",
              textTransform: "uppercase",
              marginBottom: "0.6rem"
            }}
          >
            {t("recent_report_title")}
          </div>

          <div
            className="card"
            style={{
              padding: "1.75rem",
              border: "1px solid var(--slate-200)",
              backgroundColor: "#ffffff",
              boxShadow: "var(--shadow-card)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1rem"
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    color: "var(--teal-900)",
                    letterSpacing: "-0.015em"
                  }}
                >
                  {recentReport.report_type}
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    fontSize: "0.84rem",
                    color: "var(--slate-500)",
                    marginTop: "0.35rem",
                    flexWrap: "wrap"
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Calendar size={14} color="var(--teal-primary)" />
                    <span>{recentReport.report_date}</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                    <Building2 size={14} color="var(--teal-primary)" />
                    <span>{recentReport.lab_name}</span>
                  </span>
                </div>
              </div>

              {/* Status Breakdown & Review Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    backgroundColor: "var(--teal-surface)",
                    color: "var(--teal-primary)",
                    border: "1px solid var(--teal-border)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)"
                  }}
                >
                  {totalTests} {t("tests_analyzed")}
                </span>

                {reviewCount > 0 ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--status-above-bg)",
                      border: "1px solid var(--status-above-border)",
                      color: "var(--status-above-text)",
                      fontSize: "0.8rem",
                      fontWeight: 700
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--status-above-dot)"
                      }}
                    />
                    {reviewCount} {t("results_to_review")}
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "var(--status-normal-bg)",
                      border: "1px solid var(--status-normal-border)",
                      color: "var(--status-normal-text)",
                      fontSize: "0.8rem",
                      fontWeight: 700
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "var(--status-normal-dot)"
                      }}
                    />
                    {t("all_within_range")}
                  </span>
                )}
              </div>
            </div>

            {/* Clean summary (without surrounding quotation marks) */}
            <p
              style={{
                fontSize: "1rem",
                color: "var(--slate-700)",
                lineHeight: 1.55,
                margin: "1rem 0 1.5rem 0",
                backgroundColor: "var(--teal-surface)",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                borderLeft: "4px solid var(--teal-primary)"
              }}
            >
              {summaryText}
            </p>

            {/* CTA */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => navigateTo("analysis", { report: recentReport })}
                className="btn-primary"
              >
                <span>{t("view_analysis")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* TWO-COLUMN GRID: RECENT RESULTS & HEALTH TRENDS PREVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem"
        }}
      >
        {/* RECENT RESULTS CARD (Up to 3 numeric tests, preferring outside-range first) */}
        <section
          className="card"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem"
              }}
            >
              <h3 className="heading-md">{t("recent_results_title")}</h3>
              <span style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                Latest Panel
              </span>
            </div>
            <p className="text-sm" style={{ marginBottom: "1.25rem" }}>
              {t("recent_results_sub")}
            </p>

            {/* Meaningful results snapshot rendered purely from data */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentResultsToShow.map((test, idx) => {
                const hasRange = isNumeric(test.reference_low) && isNumeric(test.reference_high);
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 0.9rem",
                      backgroundColor: "var(--slate-50)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--slate-150)"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--slate-800)" }}>
                        {test.test_name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                        {hasRange ? `Ref: ${test.reference_low} - ${test.reference_high} ${test.unit}` : t("no_reference_range")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--slate-900)" }}>
                        {test.value}{" "}
                        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--slate-500)" }}>
                          {test.unit}
                        </span>
                      </span>
                      <StatusBadge
                        status={test.status}
                        value={test.value}
                        refLow={test.reference_low}
                        refHigh={test.reference_high}
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px solid var(--slate-150)" }}>
            <button
              type="button"
              onClick={() => navigateTo("analysis")}
              className="btn-subtle"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>{t("view_analysis")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        {/* HEALTH TRENDS PREVIEW */}
        <section
          className="card"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.4rem"
              }}
            >
              <h3 className="heading-md">{t("trends_preview_title")}</h3>
              <TrendingUp size={18} color="var(--teal-primary)" />
            </div>
            <p className="text-sm" style={{ marginBottom: "1.25rem" }}>
              {t("trends_preview_sub")}
            </p>

            {/* Visual mini-history card driven from previewTrend */}
            {previewTrend && (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--teal-surface)",
                  border: "1px solid var(--teal-border)",
                  marginBottom: "1rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--teal-900)" }}>
                    {previewTrend.test_name}
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--teal-primary)", fontWeight: 600 }}>
                    {previewTrend.reference_low} - {previewTrend.reference_high} {previewTrend.unit}
                  </span>
                </div>

                {/* History points visual */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.75rem"
                  }}
                >
                  {historyPoints.map((pt, i) => (
                    <React.Fragment key={i}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.72rem", color: i === historyPoints.length - 1 ? "var(--teal-primary)" : "var(--slate-500)", fontWeight: i === historyPoints.length - 1 ? 700 : 500 }}>
                          {pt.date}
                        </div>
                        <div style={{ fontSize: i === historyPoints.length - 1 ? "1.1rem" : "0.95rem", fontWeight: 800, color: i === historyPoints.length - 1 ? "var(--teal-900)" : "var(--slate-800)" }}>
                          {pt.value}
                        </div>
                      </div>
                      {i < historyPoints.length - 1 && (
                        <div style={{ height: "1px", flex: 1, backgroundColor: "var(--teal-300)", margin: "0 8px" }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {trendSentence && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--slate-700)",
                      marginTop: "0.85rem",
                      lineHeight: 1.45,
                      paddingTop: "0.5rem",
                      borderTop: "1px dashed var(--teal-border)"
                    }}
                  >
                    {trendSentence}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px solid var(--slate-150)" }}>
            <button
              type="button"
              onClick={() => navigateTo("trends", { trend_id: previewTrendKey || "hemoglobin" })}
              className="btn-subtle"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <span>{t("view_all_trends")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
      </>
      )}
    </div>
  );
}

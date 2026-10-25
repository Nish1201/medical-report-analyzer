import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import {
  Calendar,
  Building2,
  FileText,
  Search,
  ArrowRight,
  Plus
} from "lucide-react";

export function MyReportsPage() {
  const { t } = useLanguage();
  const { reports, navigateTo } = useReport();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  const filteredReports = (reports || []).filter((report) => {
    const title = report.report_type || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.lab_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.report_date || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear =
      selectedYear === "all" || (report.report_date || "").includes(selectedYear);

    return matchesSearch && matchesYear;
  });

  const hasReports = reports && reports.length > 0;

  return (
    <div className="content-container animate-fade-in">
      {/* Header & Upload New Action */}
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
          <h2 className="heading-xl">{t("my_reports_heading")}</h2>
          <p className="text-sub" style={{ marginTop: "0.25rem" }}>
            {t("my_reports_sub")}
          </p>
        </div>

        {hasReports && (
          <button
            type="button"
            onClick={() => navigateTo("upload")}
            className="btn-primary"
          >
            <Plus size={18} />
            <span>{t("btn_upload_new")}</span>
          </button>
        )}
      </div>

      {!hasReports ? (
        <div
          className="card"
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--slate-200)",
            boxShadow: "var(--shadow-card)",
            maxWidth: "600px",
            margin: "2rem auto"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "var(--teal-surface)",
              color: "var(--teal-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
              border: "1px solid var(--teal-border)"
            }}
          >
            <FileText size={28} strokeWidth={1.8} />
          </div>

          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--teal-900)",
              marginBottom: "0.4rem"
            }}
          >
            {t("empty_reports_title")}
          </h3>

          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--slate-600)",
              maxWidth: "420px",
              margin: "0 auto 1.5rem auto",
              lineHeight: 1.5
            }}
          >
            {t("empty_reports_sub")}
          </p>

          <button
            type="button"
            onClick={() => navigateTo("upload")}
            className="btn-primary"
            style={{ padding: "0.8rem 1.6rem", fontSize: "0.95rem" }}
          >
            <Plus size={18} />
            <span>{t("btn_upload_new")}</span>
          </button>
        </div>
      ) : (
        <>

      {/* Clean Search & Filter Controls */}
      <div
        style={{
          display: "flex",
          gap: "0.85rem",
          flexWrap: "wrap",
          marginBottom: "1.75rem"
        }}
      >
        {/* Search input */}
        <div
          style={{
            flex: 1,
            minWidth: "260px",
            position: "relative",
            display: "flex",
            alignItems: "center"
          }}
        >
          <Search
            size={16}
            color="var(--slate-400)"
            style={{ position: "absolute", left: "12px", pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder={t("search_reports_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.65rem 1rem 0.65rem 2.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--slate-200)",
              backgroundColor: "#ffffff",
              fontSize: "0.88rem",
              color: "var(--slate-800)",
              outline: "none"
            }}
          />
        </div>

        {/* Year filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--slate-200)",
              backgroundColor: "#ffffff",
              fontSize: "0.88rem",
              color: "var(--slate-700)",
              cursor: "pointer",
              outline: "none"
            }}
            aria-label="Filter by year"
          >
            <option value="all">{t("all_years")}</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Reports Timeline Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filteredReports.length === 0 ? (
          <div
            className="card"
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              color: "var(--slate-500)"
            }}
          >
            <FileText size={36} color="var(--slate-300)" style={{ margin: "0 auto 0.75rem auto" }} />
            <p>No reports match your search query.</p>
          </div>
        ) : (
          filteredReports.map((report, idx) => {
            const isLatest = idx === 0;

            return (
              <div
                key={report.id || idx}
                className="card"
                style={{
                  padding: "1.5rem 1.75rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--radius-lg)",
                  border: isLatest ? "1.5px solid var(--teal-border)" : "1px solid var(--slate-200)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                  transition: "all var(--transition-base)"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--teal-primary)",
                        backgroundColor: "var(--teal-surface)",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)"
                      }}
                    >
                      <Calendar size={13} />
                      <span>{report.report_date}</span>
                    </span>

                    {isLatest && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor: "var(--teal-primary)",
                          color: "#ffffff",
                          padding: "2px 7px",
                          borderRadius: "var(--radius-full)"
                        }}
                      >
                        Latest
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--teal-900)",
                      letterSpacing: "-0.015em"
                    }}
                  >
                    {report.report_type}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "0.82rem",
                      color: "var(--slate-500)",
                      marginTop: "0.35rem"
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <Building2 size={14} color="var(--teal-primary)" />
                      <span>{report.lab_name}</span>
                    </span>
                    <span>•</span>
                    <span>{report.tests?.length || 0} {t("tests_analyzed")}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* Latest report button is solid primary; older reports are outline secondary per Requirement C.3 */}
                  <button
                    type="button"
                    onClick={() => navigateTo("analysis", { report })}
                    className={isLatest ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: "0.88rem", padding: "0.6rem 1.25rem" }}
                  >
                    <span>{t("view_analysis")}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
}

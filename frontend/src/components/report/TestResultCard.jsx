import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useReport } from "../../context/ReportContext";
import { StatusBadge } from "../common/StatusBadge";
import { ReferenceRangeVisual } from "./ReferenceRangeVisual";
import { normalizeStatus, isNumeric } from "../../utils/status";
import { Sparkles, ArrowRight, Activity } from "lucide-react";

export function TestResultCard({ test }) {
  const { language, t } = useLanguage();
  const { navigateTo } = useReport();

  const isValNumeric = isNumeric(test.value);
  const hasRange = isNumeric(test.reference_low) && isNumeric(test.reference_high);

  // Status computation
  const statusToPass = test.status || (hasRange ? normalizeStatus(null, test.value, test.reference_low, test.reference_high) : "unknown");

  // Explanations handling: Hindi priority with fallback; hide block completely if empty
  const simpleExplanation = language === "hi" && test.simple_explanation_hi
    ? test.simple_explanation_hi
    : (test.simple_explanation || "");

  const medicalExplanation = test.medical_explanation || "";

  return (
    <article
      className="card animate-fade-in"
      style={{
        padding: "1.5rem",
        marginBottom: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--slate-200)",
        boxShadow: "var(--shadow-card)",
        transition: "all var(--transition-base)"
      }}
    >
      {/* Top Header: Test Name, Category, Value, Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--slate-150)"
        }}
      >
        <div>
          {test.category && (
            <div
              style={{
                display: "inline-block",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--teal-primary)",
                backgroundColor: "var(--teal-surface)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.4rem"
              }}
            >
              {test.category}
            </div>
          )}
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--teal-900)",
              letterSpacing: "-0.015em"
            }}
          >
            {test.test_name}
          </h3>
        </div>

        {/* Value & Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap"
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.55rem",
                fontWeight: 800,
                color: "var(--teal-900)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1
              }}
            >
              {test.value}{" "}
              {test.unit && (
                <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--slate-500)" }}>
                  {test.unit}
                </span>
              )}
            </div>
          </div>
          <StatusBadge
            status={statusToPass}
            value={test.value}
            refLow={test.reference_low}
            refHigh={test.reference_high}
          />
        </div>
      </div>

      {/* Horizontal Reference Range Bar OR No-Range Notice */}
      {isValNumeric && hasRange ? (
        <ReferenceRangeVisual
          value={test.value}
          unit={test.unit}
          referenceLow={test.reference_low}
          referenceHigh={test.reference_high}
          status={statusToPass}
        />
      ) : isValNumeric && !hasRange ? (
        <div
          style={{
            margin: "1rem 0",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--slate-50)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--slate-200)",
            fontSize: "0.84rem",
            color: "var(--slate-500)"
          }}
        >
          {t("no_reference_range")}
        </div>
      ) : null}

      {/* Section: What This Test Measures (Hidden completely if empty) */}
      {medicalExplanation.trim().length > 0 && (
        <div style={{ margin: "1.1rem 0 1rem 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "var(--slate-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "0.35rem"
            }}
          >
            <Activity size={14} color="var(--slate-400)" />
            <span>{t("what_this_measures")}</span>
          </div>
          <p
            style={{
              fontSize: "0.915rem",
              color: "var(--slate-600)",
              lineHeight: 1.55
            }}
          >
            {medicalExplanation}
          </p>
        </div>
      )}

      {/* HERO SECTION: IN SIMPLE WORDS (Hidden completely if empty) */}
      {simpleExplanation.trim().length > 0 && (
        <div
          style={{
            margin: "1.1rem 0 0.85rem 0",
            padding: "1.1rem 1.25rem",
            backgroundColor: "var(--teal-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--teal-border)",
            position: "relative"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.45rem"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "var(--teal-primary)",
                color: "#ffffff"
              }}
            >
              <Sparkles size={13} />
            </div>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--teal-900)",
                textTransform: "uppercase"
              }}
            >
              {t("in_simple_words")}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.945rem",
              color: "var(--slate-800)",
              lineHeight: 1.6,
              fontWeight: 500
            }}
          >
            {simpleExplanation}
          </p>
        </div>
      )}

      {/* Footer link: View Trend (Only numeric tests with trend capability) */}
      {isValNumeric && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "0.75rem",
            paddingTop: "0.5rem"
          }}
        >
          <button
            type="button"
            onClick={() => navigateTo("trends", { trend_id: test.test_name.toLowerCase() })}
            className="btn-subtle"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.875rem",
              fontWeight: 600
            }}
          >
            <span>{t("view_trend_link")}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </article>
  );
}

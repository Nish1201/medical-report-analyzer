import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { normalizeStatus } from "../../utils/status";
import { FileCheck } from "lucide-react";

export function ReportOverviewCard({
  report,
  activeFilter,
  setActiveFilter
}) {
  const { language, t } = useLanguage();

  const tests = report?.tests || [];

  // Derive counts from normalized status of tests[]
  let withinCount = 0;
  let aboveCount = 0;
  let belowCount = 0;
  let attentionCount = 0;
  let unknownCount = 0;

  tests.forEach((test) => {
    const canonical = normalizeStatus(test.status, test.value, test.reference_low, test.reference_high);
    if (canonical === "within") withinCount++;
    else if (canonical === "above") aboveCount++;
    else if (canonical === "below") belowCount++;
    else if (canonical === "attention") attentionCount++;
    else unknownCount++;
  });

  const totalCount = report?.summary?.total !== undefined ? report.summary.total : tests.length;
  const outsideCount = report?.summary?.outside_range !== undefined
    ? report.summary.outside_range
    : (aboveCount + belowCount + attentionCount);

  // Review count for filter (Above + Below + Attention + Not Rated)
  const reviewFilterCount = aboveCount + belowCount + attentionCount + unknownCount;

  // Fallback summary sentence if summary.text is empty
  const fallbackText = language === "hi"
    ? `${totalCount} परीक्षण विश्लेषित। ${withinCount} संदर्भ सीमा के भीतर हैं और ${outsideCount} बाहर हैं।`
    : `${totalCount} tests analyzed. ${withinCount} are within the reference range and ${outsideCount} are outside it.`;

  const summaryText = report?.summary?.text || fallbackText;

  return (
    <div
      style={{
        backgroundColor: "var(--teal-surface)",
        border: "1px solid var(--teal-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem 1.75rem",
        marginBottom: "2rem",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* Top Tag & Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem"
        }}
      >
        <FileCheck size={18} color="var(--teal-primary)" />
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "var(--teal-900)",
            textTransform: "uppercase"
          }}
        >
          {t("report_overview")}
        </span>
      </div>

      {/* Calm Plain-Language Narrative Summary */}
      <p
        style={{
          fontSize: "1.02rem",
          color: "var(--slate-800)",
          lineHeight: 1.6,
          fontWeight: 500,
          marginBottom: "1.25rem"
        }}
      >
        {summaryText}
      </p>

      {/* Compact Elegant Summary Pill Stats: tests analyzed, Within Range, Above, Below, Not Rated */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
          paddingTop: "1rem",
          borderTop: "1px solid var(--teal-border)"
        }}
      >
        {/* Total Analyzed */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.84rem",
            fontWeight: 600,
            color: "var(--slate-700)",
            backgroundColor: "#ffffff",
            padding: "5px 12px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--slate-200)"
          }}
        >
          <span style={{ fontWeight: 800, color: "var(--teal-900)" }}>
            {totalCount}
          </span>
          <span>{t("tests_analyzed")}</span>
        </div>

        {/* Within Range Pill */}
        {withinCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--status-normal-text)",
              backgroundColor: "var(--status-normal-bg)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-normal-border)"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--status-normal-dot)"
              }}
            />
            <span style={{ fontWeight: 800 }}>{withinCount}</span>
            <span>{t("status_within_range")}</span>
          </div>
        )}

        {/* Above Range Pill */}
        {aboveCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--status-above-text)",
              backgroundColor: "var(--status-above-bg)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-above-border)"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--status-above-dot)"
              }}
            />
            <span style={{ fontWeight: 800 }}>{aboveCount}</span>
            <span>{t("status_above_range")}</span>
          </div>
        )}

        {/* Below Range Pill */}
        {belowCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--status-below-text)",
              backgroundColor: "var(--status-below-bg)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-below-border)"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--status-below-dot)"
              }}
            />
            <span style={{ fontWeight: 800 }}>{belowCount}</span>
            <span>{t("status_below_range")}</span>
          </div>
        )}

        {/* Needs Attention Pill */}
        {attentionCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--status-attention-text)",
              backgroundColor: "var(--status-attention-bg)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-attention-border)"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--status-attention-dot)"
              }}
            />
            <span style={{ fontWeight: 800 }}>{attentionCount}</span>
            <span>{t("status_needs_attention")}</span>
          </div>
        )}

        {/* Not Rated Pill */}
        {unknownCount > 0 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.84rem",
              fontWeight: 600,
              color: "var(--status-unknown-text)",
              backgroundColor: "var(--status-unknown-bg)",
              padding: "5px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--status-unknown-border)"
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--status-unknown-dot)"
              }}
            />
            <span style={{ fontWeight: 800 }}>{unknownCount}</span>
            <span>{t("status_unknown")}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1.25rem",
          flexWrap: "wrap"
        }}
      >
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          style={{
            padding: "5px 14px",
            fontSize: "0.82rem",
            fontWeight: activeFilter === "all" ? 700 : 500,
            borderRadius: "var(--radius-full)",
            backgroundColor: activeFilter === "all" ? "var(--teal-primary)" : "#ffffff",
            color: activeFilter === "all" ? "#ffffff" : "var(--slate-600)",
            border: `1px solid ${activeFilter === "all" ? "var(--teal-primary)" : "var(--slate-200)"}`,
            transition: "all var(--transition-fast)"
          }}
        >
          {t("filter_all")} ({totalCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("review")}
          style={{
            padding: "5px 14px",
            fontSize: "0.82rem",
            fontWeight: activeFilter === "review" ? 700 : 500,
            borderRadius: "var(--radius-full)",
            backgroundColor: activeFilter === "review" ? "var(--teal-primary)" : "#ffffff",
            color: activeFilter === "review" ? "#ffffff" : "var(--slate-600)",
            border: `1px solid ${activeFilter === "review" ? "var(--teal-primary)" : "var(--slate-200)"}`,
            transition: "all var(--transition-fast)"
          }}
        >
          {t("filter_needs_review")} ({reviewFilterCount})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("normal")}
          style={{
            padding: "5px 14px",
            fontSize: "0.82rem",
            fontWeight: activeFilter === "normal" ? 700 : 500,
            borderRadius: "var(--radius-full)",
            backgroundColor: activeFilter === "normal" ? "var(--teal-primary)" : "#ffffff",
            color: activeFilter === "normal" ? "#ffffff" : "var(--slate-600)",
            border: `1px solid ${activeFilter === "normal" ? "var(--teal-primary)" : "var(--slate-200)"}`,
            transition: "all var(--transition-fast)"
          }}
        >
          {t("filter_normal")} ({withinCount})
        </button>
      </div>
    </div>
  );
}

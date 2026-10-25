import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { normalizeStatus, isNumeric } from "../utils/status";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Activity,
  AlertCircle,
  UploadCloud
} from "lucide-react";

export function TrendsPage() {
  const { language, t } = useLanguage();
  const { selectedTrendTest, setSelectedTrendTest, trends, navigateTo } = useReport();

  const allTrends = trends || {};

  // Filter available tests: only tests with at least one numeric value in history are shown
  const availableMetricKeys = Object.keys(allTrends).filter((key) => {
    const item = allTrends[key];
    const numPoints = (item?.history || []).filter((h) => isNumeric(h.value));
    return numPoints.length > 0;
  });

  const activeKey = availableMetricKeys.includes(selectedTrendTest)
    ? selectedTrendTest
    : availableMetricKeys[0] || "";

  const trendData = (allTrends[activeKey] || allTrends[availableMetricKeys[0]]) || {
    test_name: "",
    unit: "",
    reference_low: null,
    reference_high: null,
    history: []
  };

  // Filter numeric history points strictly
  const numericHistory = (trendData.history || []).filter((h) => isNumeric(h.value));
  const hasEnoughPoints = numericHistory.length >= 2;

  // Calculate current value, previous value, and change dynamically
  const currentPt = numericHistory[numericHistory.length - 1];
  const prevPt = numericHistory.length >= 2 ? numericHistory[numericHistory.length - 2] : null;
  const changeVal = prevPt ? Number((currentPt.value - prevPt.value).toFixed(2)) : 0;

  // Status for latest reading
  const latestStatus = currentPt && isNumeric(trendData.reference_low) && isNumeric(trendData.reference_high)
    ? normalizeStatus(null, currentPt.value, trendData.reference_low, trendData.reference_high)
    : "within";

  // Dynamic trend sentence generation per Requirement B.7:
  // "Your [test] was [v1], [v2], [v3] across your last N reports. The latest value is within / above / below the reference range shown on the report."
  const statusWord = latestStatus === "above" ? "above" : latestStatus === "below" ? "below" : "within";
  const statusWordHi = latestStatus === "above" ? "ऊपर" : latestStatus === "below" ? "नीचे" : "भीतर";
  const valSeries = numericHistory.map((h) => h.value).join(", ");
  const generatedSentence = numericHistory.length > 0
    ? (language === "hi"
        ? `आपका ${trendData.test_name} पिछली ${numericHistory.length} रिपोर्टों में ${valSeries} रहा। नवीनतम मान रिपोर्ट पर दिखाई गई संदर्भ सीमा के ${statusWordHi} है।`
        : `Your ${trendData.test_name} was ${valSeries} across your last ${numericHistory.length} reports. The latest value is ${statusWord} the reference range shown on the report.`)
    : "";

  // Dynamic Y-Axis Domain calculation including full reference range plus padding per Requirement D.2
  const values = numericHistory.map((p) => Number(p.value));
  const refLow = isNumeric(trendData.reference_low) ? Number(trendData.reference_low) : Math.min(...values);
  const refHigh = isNumeric(trendData.reference_high) ? Number(trendData.reference_high) : Math.max(...values);
  const dataMin = Math.min(...values, refLow);
  const dataMax = Math.max(...values, refHigh);
  const span = Math.max(1, dataMax - dataMin);
  const padding = span * 0.18;
  const yDomain = [
    Number((dataMin - padding).toFixed(1)),
    Number((dataMax + padding).toFixed(1))
  ];

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "0.65rem 0.9rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--slate-200)",
            boxShadow: "var(--shadow-md)"
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--slate-500)", fontWeight: 500 }}>
            {data.date_full || data.date}
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--teal-primary)", marginTop: "2px" }}>
            {data.value} <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{trendData.unit}</span>
          </div>
          {isNumeric(trendData.reference_low) && isNumeric(trendData.reference_high) && (
            <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", marginTop: "2px" }}>
              Ref: {trendData.reference_low} - {trendData.reference_high} {trendData.unit}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getChangeIcon = () => {
    if (changeVal < 0) return <TrendingDown size={16} color="var(--teal-primary)" />;
    if (changeVal > 0) return <TrendingUp size={16} color="#D97706" />;
    return <Minus size={16} color="var(--slate-500)" />;
  };

  return (
    <div className="content-container animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="heading-xl">{t("trends_heading")}</h2>
        <p className="text-sub" style={{ marginTop: "0.35rem" }}>
          {t("trends_sub")}
        </p>
      </div>

      {availableMetricKeys.length === 0 ? (
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
            <TrendingUp size={28} strokeWidth={1.8} />
          </div>

          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--teal-900)",
              marginBottom: "0.4rem"
            }}
          >
            {t("trends_heading")}
          </h3>

          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--slate-600)",
              maxWidth: "460px",
              margin: "0 auto 1.5rem auto",
              lineHeight: 1.55
            }}
          >
            {t("empty_trends_notice")}
          </p>

          <button
            type="button"
            onClick={() => navigateTo("upload")}
            className="btn-primary"
            style={{ padding: "0.8rem 1.6rem", fontSize: "0.95rem" }}
          >
            <UploadCloud size={18} />
            <span>{t("btn_upload_new")}</span>
          </button>
        </div>
      ) : (
        <>
      {/* Test Selector Tabs (Hidden for tests with no numeric history) */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          marginBottom: "1.75rem"
        }}
      >
        {availableMetricKeys.map((key) => {
          const item = allTrends[key];
          const isSelected = activeKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTrendTest(key)}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.88rem",
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? "var(--teal-primary)" : "#ffffff",
                color: isSelected ? "#ffffff" : "var(--slate-700)",
                border: `1px solid ${isSelected ? "var(--teal-primary)" : "var(--slate-200)"}`,
                boxShadow: isSelected ? "0 2px 6px rgba(4, 127, 140, 0.25)" : "var(--shadow-xs)",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap"
              }}
            >
              {item.test_name}
            </button>
          );
        })}
      </div>

      {/* Hero Trend Evaluation Card */}
      <div
        className="card"
        style={{
          padding: "1.75rem",
          marginBottom: "1.75rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)"
        }}
      >
        {/* Metric Header & Statistics Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.25rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid var(--slate-150)"
          }}
        >
          <div>
            <div style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "var(--teal-primary)", letterSpacing: "0.05em" }}>
              Parameter Longitudinal Trend
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--teal-900)", marginTop: "0.2rem" }}>
              {trendData.test_name} {trendData.unit && <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--slate-500)" }}>({trendData.unit})</span>}
            </h3>
          </div>

          {currentPt && (
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              {/* Current Value */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 600 }}>
                  {t("current_value_label")} ({currentPt.date})
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--teal-900)" }}>
                  {currentPt.value} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{trendData.unit}</span>
                </div>
              </div>

              {/* Previous Value */}
              {prevPt && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--slate-400)", textTransform: "uppercase", fontWeight: 600 }}>
                    {t("previous_value_label")} ({prevPt.date})
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--slate-600)" }}>
                    {prevPt.value} <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{trendData.unit}</span>
                  </div>
                </div>
              )}

              {/* Computed Change pill */}
              {prevPt && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--slate-100)",
                    border: "1px solid var(--slate-200)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "var(--slate-800)"
                  }}
                >
                  {getChangeIcon()}
                  <span>
                    {changeVal > 0 ? `+${changeVal}` : changeVal} {trendData.unit}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reference Range Indicator Bar */}
        {isNumeric(trendData.reference_low) && isNumeric(trendData.reference_high) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--teal-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--teal-border)",
              margin: "1.25rem 0",
              fontSize: "0.825rem",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={15} color="var(--teal-primary)" />
              <span style={{ fontWeight: 600, color: "var(--teal-900)" }}>
                {t("ref_bracket_label")}: {trendData.reference_low} — {trendData.reference_high} {trendData.unit}
              </span>
            </div>

            <StatusBadge status={latestStatus} size="sm" />
          </div>
        )}

        {!hasEnoughPoints ? (
          <div
            style={{
              padding: "3.5rem 1.5rem",
              textAlign: "center",
              backgroundColor: "var(--slate-50)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--slate-200)",
              margin: "1.5rem 0"
            }}
          >
            <AlertCircle size={32} color="var(--slate-400)" style={{ margin: "0 auto 0.75rem auto" }} />
            <p style={{ fontSize: "0.95rem", color: "var(--slate-600)", fontWeight: 500, maxWidth: "460px", margin: "0 auto 1rem auto" }}>
              {t("empty_trends_notice")}
            </p>
            <button
              type="button"
              onClick={() => navigateTo("upload")}
              className="btn-secondary"
              style={{ padding: "0.6rem 1.25rem", fontSize: "0.88rem" }}
            >
              <UploadCloud size={16} />
              <span>{t("btn_upload_new")}</span>
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", height: 320, marginTop: "1.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={numericHistory}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                
                {/* XAxis with tick padding to avoid overlap */}
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  dy={8}
                />
                
                {/* YAxis displaying numbers only (no repeating unit suffix) */}
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={yDomain}
                  width={45}
                  dx={-4}
                />

                {/* Shaded Reference Range Area Band */}
                {isNumeric(trendData.reference_low) && isNumeric(trendData.reference_high) && (
                  <ReferenceArea
                    y1={trendData.reference_low}
                    y2={trendData.reference_high}
                    fill="rgba(16, 185, 129, 0.08)"
                    stroke="rgba(16, 185, 129, 0.25)"
                    strokeDasharray="3 3"
                  />
                )}

                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--teal-primary)"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#ffffff", stroke: "var(--teal-primary)", strokeWidth: 2.5 }}
                  activeDot={{ r: 8, fill: "var(--teal-primary)", stroke: "#ffffff", strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PLAIN-LANGUAGE INTERPRETATION BOX (Generated purely from data) */}
        {generatedSentence && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem 1.5rem",
              backgroundColor: "var(--teal-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--teal-border)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem"
              }}
            >
              <Sparkles size={16} color="var(--teal-primary)" />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "var(--teal-900)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}
              >
                {t("plain_interpretation_title")}
              </span>
            </div>

            <p
              style={{
                fontSize: "0.98rem",
                color: "var(--slate-800)",
                lineHeight: 1.6,
                fontWeight: 500
              }}
            >
              {generatedSentence}
            </p>
          </div>
        )}
      </div>

      {/* Historical Records Table/Cards */}
      <div
        className="card"
        style={{
          padding: "1.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "var(--radius-lg)"
        }}
      >
        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "1rem" }}>
          {t("history_table_title")} — {trendData.test_name}
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {numericHistory.map((record, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--slate-50)",
                border: "1px solid var(--slate-150)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Calendar size={15} color="var(--teal-primary)" />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--slate-800)" }}>
                  {record.date_full || record.date}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--slate-900)" }}>
                  {record.value} <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--slate-500)" }}>{trendData.unit}</span>
                </span>
                <StatusBadge
                  status={normalizeStatus(null, record.value, trendData.reference_low, trendData.reference_high)}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

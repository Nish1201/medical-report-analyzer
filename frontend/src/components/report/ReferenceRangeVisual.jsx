import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { normalizeStatus, isNumeric } from "../../utils/status";

/**
 * ReferenceRangeVisual
 * 
 * Clean horizontal reference range visualizer:
 * - Shows reference bounds (low and high numbers)
 * - Shaded normal reference window
 * - Clamps patient value marker securely inside the bar if value is far outside
 * - Captions "Lower (x)", "Upper (x)", and "Normal Reference Window" removed per spec
 */
export function ReferenceRangeVisual({
  value,
  unit,
  referenceLow,
  referenceHigh,
  status
}) {
  const { t } = useLanguage();

  if (!isNumeric(value) || !isNumeric(referenceLow) || !isNumeric(referenceHigh)) {
    return null;
  }

  const numVal = Number(value);
  const low = Number(referenceLow);
  const high = Number(referenceHigh);

  // Determine viewing span with sensible margins around low and high
  const span = Math.max(0.1, high - low);
  const min = Math.min(low - span * 0.4, numVal - span * 0.1);
  const max = Math.max(high + span * 0.4, numVal + span * 0.1);
  const totalRange = max - min || 1;

  // Percentage calculations
  const calcPercent = (val) => {
    return ((val - min) / totalRange) * 100;
  };

  const lowPercent = Math.max(5, Math.min(90, calcPercent(low)));
  const highPercent = Math.max(lowPercent + 5, Math.min(95, calcPercent(high)));
  const refWidthPercent = Math.max(4, highPercent - lowPercent);

  // Clamp the marker inside the bar [4%, 96%]
  const rawValuePercent = calcPercent(numVal);
  const clampedValuePercent = Math.max(5, Math.min(95, rawValuePercent));

  const canonical = normalizeStatus(status, numVal, low, high);

  const getMarkerColor = () => {
    switch (canonical) {
      case "within":
        return "#10B981";
      case "above":
        return "#D97706";
      case "below":
        return "#2563EB";
      case "attention":
        return "#EA580C";
      case "unknown":
      default:
        return "#64748B";
    }
  };

  const markerColor = getMarkerColor();

  return (
    <div
      style={{
        margin: "1rem 0 0.85rem 0",
        padding: "0.85rem 1rem",
        backgroundColor: "var(--slate-50)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--slate-150)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--slate-500)",
          textTransform: "uppercase",
          letterSpacing: "0.04em"
        }}
      >
        <span>{t("reference_range")}</span>
        <span style={{ color: "var(--teal-900)", fontWeight: 700 }}>
          {low} — {high} {unit}
        </span>
      </div>

      {/* Visual Slider Track */}
      <div style={{ position: "relative", height: "46px", marginTop: "4px" }}>
        {/* Background track */}
        <div
          style={{
            position: "absolute",
            top: "22px",
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "var(--slate-200)",
            borderRadius: "4px"
          }}
        />

        {/* Normal Reference Range Highlighted Segment */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: `${lowPercent}%`,
            width: `${refWidthPercent}%`,
            height: "12px",
            backgroundColor: "rgba(16, 185, 129, 0.22)",
            border: "1.5px solid rgba(16, 185, 129, 0.45)",
            borderRadius: "6px"
          }}
          title={`Reference range: ${low} - ${high} ${unit}`}
        />

        {/* Lower Reference Label Tick */}
        <div
          style={{
            position: "absolute",
            top: "34px",
            left: `${lowPercent}%`,
            transform: "translateX(-50%)",
            fontSize: "0.75rem",
            color: "var(--slate-600)",
            fontWeight: 600
          }}
        >
          {low}
        </div>

        {/* Higher Reference Label Tick */}
        <div
          style={{
            position: "absolute",
            top: "34px",
            left: `${highPercent}%`,
            transform: "translateX(-50%)",
            fontSize: "0.75rem",
            color: "var(--slate-600)",
            fontWeight: 600
          }}
        >
          {high}
        </div>

        {/* Patient's Current Value Marker (securely clamped) */}
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: `${clampedValuePercent}%`,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 5
          }}
        >
          {/* Value pill */}
          <div
            style={{
              padding: "2px 7px",
              borderRadius: "var(--radius-full)",
              backgroundColor: markerColor,
              color: "#ffffff",
              fontSize: "0.74rem",
              fontWeight: 700,
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap",
              lineHeight: 1.2
            }}
          >
            {value} {unit}
          </div>

          {/* Marker pin stem */}
          <div
            style={{
              width: "2px",
              height: "6px",
              backgroundColor: markerColor
            }}
          />

          {/* Center marker dot on track */}
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: `3px solid ${markerColor}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
            }}
          />
        </div>
      </div>
    </div>
  );
}

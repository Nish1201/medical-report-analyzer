import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { normalizeStatus, getStatusLabel, getStatusStyle } from "../../utils/status";

export function StatusBadge({ status, value, refLow, refHigh, size = "md" }) {
  const { language } = useLanguage();
  const canonical = normalizeStatus(status, value, refLow, refHigh);
  const style = getStatusStyle(canonical);
  const label = getStatusLabel(canonical, language);
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? "0.35rem" : "0.45rem",
        padding: isSm ? "0.2rem 0.55rem" : "0.3rem 0.75rem",
        borderRadius: "var(--radius-full)",
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize: isSm ? "0.75rem" : "0.825rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap"
      }}
    >
      <span
        style={{
          width: isSm ? "6px" : "7px",
          height: isSm ? "6px" : "7px",
          borderRadius: "50%",
          backgroundColor: style.dot
        }}
      />
      {label}
    </span>
  );
}

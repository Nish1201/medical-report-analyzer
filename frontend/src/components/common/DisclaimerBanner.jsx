import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Info } from "lucide-react";

export function DisclaimerBanner() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        backgroundColor: "var(--teal-50)",
        borderTop: "1px solid var(--teal-100)",
        borderBottom: "1px solid var(--teal-100)",
        padding: "0.55rem 1.25rem",
        fontSize: "0.785rem",
        color: "var(--teal-900)",
        textAlign: "center"
      }}
    >
      <Info size={14} style={{ flexShrink: 0, color: "var(--teal-700)" }} />
      <span>{t("disclaimer")}</span>
    </div>
  );
}

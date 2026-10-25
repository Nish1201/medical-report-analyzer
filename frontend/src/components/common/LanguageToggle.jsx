import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "var(--slate-100)",
        padding: "3px",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--slate-200)",
        gap: "2px"
      }}
      role="group"
      aria-label="Language selector"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: "6px",
          color: "var(--slate-400)"
        }}
      >
        <Globe size={14} />
      </div>

      <button
        type="button"
        onClick={() => setLanguage("en")}
        style={{
          padding: "4px 10px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.8rem",
          fontWeight: language === "en" ? 700 : 500,
          color: language === "en" ? "var(--teal-900)" : "var(--slate-600)",
          backgroundColor: language === "en" ? "#ffffff" : "transparent",
          boxShadow: language === "en" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
          transition: "all 0.18s ease"
        }}
      >
        English
      </button>

      <button
        type="button"
        onClick={() => setLanguage("hi")}
        style={{
          padding: "4px 10px",
          borderRadius: "var(--radius-full)",
          fontSize: "0.8rem",
          fontWeight: language === "hi" ? 700 : 500,
          color: language === "hi" ? "var(--teal-900)" : "var(--slate-600)",
          backgroundColor: language === "hi" ? "#ffffff" : "transparent",
          boxShadow: language === "hi" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
          transition: "all 0.18s ease"
        }}
      >
        हिंदी
      </button>
    </div>
  );
}

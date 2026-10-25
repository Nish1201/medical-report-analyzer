import React from "react";
import { useReport } from "../../context/ReportContext";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { Menu } from "lucide-react";

export function Navbar({ setMobileOpen }) {
  const { activeTab, navigateTo, patient } = useReport();
  const { t } = useLanguage();

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return t("nav_dashboard");
      case "upload":
        return t("upload_heading");
      case "analysis":
        return t("report_analysis_title");
      case "reports":
        return t("my_reports_heading");
      case "trends":
        return t("trends_heading");
      case "profile":
        return t("profile_heading");
      default:
        return "HealthLens";
    }
  };

  const displayName = patient?.name ? patient.name.trim().split(/\s+/)[0] : "";
  const initial = patient?.name ? patient.name.trim()[0].toUpperCase() : "P";

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--slate-200)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.75rem",
        position: "sticky",
        top: 0,
        zIndex: 30
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.4rem",
            color: "var(--slate-700)"
          }}
          className="mobile-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--teal-900)",
              letterSpacing: "-0.01em"
            }}
          >
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* English / Hindi Language Toggle */}
        <LanguageToggle />

        {/* Patient Profile Pill */}
        {patient && (
          <button
            type="button"
            onClick={() => navigateTo("profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "4px 10px 4px 6px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--slate-200)",
              transition: "all var(--transition-fast)"
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "var(--teal-primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700
              }}
            >
              {initial}
            </div>
            {displayName && (
              <span
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  color: "var(--slate-700)"
                }}
                className="patient-name-nav"
              >
                {displayName}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}

import React from "react";
import { useReport } from "../../context/ReportContext";
import { useLanguage } from "../../context/LanguageContext";
import logoImg from "../../assets/healthlens-logo.png";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  TrendingUp,
  User,
  ChevronRight
} from "lucide-react";

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { activeTab, navigateTo, patient } = useReport();
  const { t } = useLanguage();

  const navItems = [
    {
      id: "dashboard",
      labelKey: "nav_dashboard",
      icon: LayoutDashboard
    },
    {
      id: "reports",
      labelKey: "nav_reports",
      icon: FileText
    },
    {
      id: "upload",
      labelKey: "nav_upload",
      icon: UploadCloud
    },
    {
      id: "trends",
      labelKey: "nav_trends",
      icon: TrendingUp
    },
    {
      id: "profile",
      labelKey: "nav_profile",
      icon: User
    }
  ];

  const handleNavClick = (id) => {
    navigateTo(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "PT";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const patientName = patient?.name || "";
  const patientSub = patient?.age ? `${patient.age} yrs${patient.sex ? ` • ${patient.sex}` : ""}` : "";

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(4, 54, 79, 0.4)",
            zIndex: 40,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      <aside
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid var(--slate-200)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "relative",
          zIndex: 50,
          transition: "transform 0.25s ease"
        }}
        className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.5rem 1.25rem 1.25rem 1.25rem",
            borderBottom: "1px solid var(--slate-150)"
          }}
        >
          <div
            onClick={() => handleNavClick("dashboard")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <img
              src={logoImg}
              alt="HealthLens"
              style={{
                height: "38px",
                width: "auto",
                objectFit: "contain"
              }}
            />
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--slate-500)",
              marginTop: "0.75rem",
              lineHeight: 1.35,
              paddingLeft: "0.1rem"
            }}
          >
            "{t("tagline")}"
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: "1.25rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (activeTab === "analysis" && item.id === "reports");

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "0.7rem 0.9rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.92rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--teal-primary)" : "var(--slate-600)",
                  backgroundColor: isActive ? "var(--teal-surface)" : "transparent",
                  border: isActive ? "1px solid var(--teal-border)" : "1px solid transparent",
                  transition: "all var(--transition-fast)"
                }}
                className="nav-link"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Icon
                    size={18}
                    color={isActive ? "var(--teal-primary)" : "var(--slate-400)"}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span>{t(item.labelKey)}</span>
                </div>

                {isActive && (
                  <ChevronRight size={14} color="var(--teal-primary)" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Patient Profile Footer Card */}
        {patient && (
          <div
            style={{
              padding: "1rem",
              margin: "0 0.85rem 1rem 0.85rem",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--slate-200)",
              borderRadius: "var(--radius-md)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                cursor: "pointer"
              }}
              onClick={() => handleNavClick("profile")}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  border: "1px solid var(--teal-border)"
                }}
              >
                {getInitials(patientName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--slate-800)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {patientName}
                </div>
                {patientSub && (
                  <div style={{ fontSize: "0.72rem", color: "var(--slate-500)" }}>
                    {patientSub}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { UploadZone } from "../components/upload/UploadZone";
import { ShieldCheck, FileCheck } from "lucide-react";

export function UploadPage() {
  const { t } = useLanguage();

  return (
    <div className="content-container animate-fade-in">
      {/* Page Heading */}
      <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 2.5rem auto" }}>
        <h2 className="heading-xl">{t("upload_heading")}</h2>
        <p className="text-sub" style={{ marginTop: "0.5rem" }}>
          {t("upload_sub")}
        </p>
      </div>

      {/* Main Upload Zone Simulator */}
      <UploadZone />

      {/* Trust & Guidance Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
          maxWidth: "840px",
          margin: "3rem auto 0 auto"
        }}
      >
        <div
          style={{
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--slate-200)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem"
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--teal-50)",
              color: "var(--teal-700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--slate-800)" }}>
              Private & Encrypted
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--slate-500)", marginTop: "0.2rem", lineHeight: 1.4 }}>
              Uploaded files are strictly used for your session analysis and never shared with third parties.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--slate-200)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem"
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--teal-50)",
              color: "var(--teal-700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <FileCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--slate-800)" }}>
              Multi-Lab Compatibility
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--slate-500)", marginTop: "0.2rem", lineHeight: 1.4 }}>
              Optimized for common digital PDFs, smartphone scan photos, and standard hospital printouts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

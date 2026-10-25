import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import { reportService } from "../services/reportService";
import { LanguageToggle } from "../components/common/LanguageToggle";
import { ReferenceRangeVisual } from "../components/report/ReferenceRangeVisual";
import { StatusBadge } from "../components/common/StatusBadge";
import logoImg from "../assets/healthlens-logo.png";
import {
  UploadCloud,
  Sparkles,
  TrendingUp,
  FileText,
  Sliders,
  HelpCircle,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export function WelcomePage({ onGetStarted }) {
  const { language, t } = useLanguage();
  const { navigateTo } = useReport();
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        const data = await reportService.getPreviewTest();
        setPreviewData(data);
      } catch (err) {
        console.error("Failed to load preview test", err);
      }
    }
    loadPreview();
  }, []);

  const handleStart = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      navigateTo("start");
    }
  };

  const previewTest = previewData?.test;
  const previewExplanation = previewTest
    ? language === "hi" && previewTest.simple_explanation_hi
      ? previewTest.simple_explanation_hi
      : previewTest.simple_explanation
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-app)",
        display: "flex",
        flexDirection: "column",
        color: "var(--slate-800)",
        overflowX: "hidden"
      }}
      className="animate-fade-in"
    >
      {/* Top Bar Header */}
      <header
        style={{
          borderBottom: "1px solid var(--slate-200)",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 30,
          boxShadow: "var(--shadow-xs)"
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "0.85rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <img
            src={logoImg}
            alt="HealthLens"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
              display: "block"
            }}
          />
          <LanguageToggle />
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: "1180px", width: "100%", margin: "0 auto", padding: "3rem 1.5rem 5rem 1.5rem" }}>
        {/* HERO SECTION */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3rem",
            alignItems: "center",
            marginBottom: "5rem"
          }}
        >
          {/* Left Column: Headline, subtext, CTA */}
          <div>
            <h1
              style={{
                fontSize: "clamp(2.1rem, 4vw, 3rem)",
                fontWeight: 800,
                color: "var(--teal-900)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
                marginBottom: "1.25rem"
              }}
            >
              {t("welcome_hero_title")}
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
                color: "var(--slate-600)",
                lineHeight: 1.6,
                marginBottom: "2.25rem"
              }}
            >
              {t("welcome_hero_sub")}
            </p>

            <button
              type="button"
              onClick={handleStart}
              className="btn-primary"
              style={{
                padding: "0.95rem 2.2rem",
                fontSize: "1.05rem",
                fontWeight: 700,
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 14px rgba(4, 127, 140, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem"
              }}
            >
              <span>{t("btn_get_started")}</span>
              <ArrowRight size={19} />
            </button>
          </div>

          {/* Right Column: Raised Preview Card */}
          <div>
            {previewTest && (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--slate-200)",
                  padding: "1.75rem",
                  boxShadow: "0 20px 35px -10px rgba(4, 54, 79, 0.12), 0 10px 20px -5px rgba(4, 54, 79, 0.06)",
                  transition: "all var(--transition-base)"
                }}
              >
                {/* Preview Card Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid var(--slate-150)"
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      color: "var(--teal-primary)",
                      backgroundColor: "var(--teal-surface)",
                      padding: "3px 9px",
                      borderRadius: "var(--radius-full)",
                      textTransform: "uppercase"
                    }}
                  >
                    {t("preview_sample_tag")}
                  </span>

                  <span style={{ fontSize: "0.78rem", color: "var(--slate-400)", fontWeight: 500 }}>
                    {previewData?.report_type}
                  </span>
                </div>

                {/* Test Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    marginBottom: "1.25rem"
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--teal-900)",
                        marginBottom: "0.2rem"
                      }}
                    >
                      {previewTest.test_name}
                    </h3>
                    {previewTest.category && (
                      <span style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                        {previewTest.category}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--slate-900)", lineHeight: 1 }}>
                      {previewTest.value}{" "}
                      <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--slate-500)" }}>
                        {previewTest.unit}
                      </span>
                    </div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <StatusBadge status={previewTest.status} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Visual Reference Range */}
                <div style={{ margin: "1.25rem 0" }}>
                  <ReferenceRangeVisual
                    value={previewTest.value}
                    referenceLow={previewTest.reference_low}
                    referenceHigh={previewTest.reference_high}
                    unit={previewTest.unit}
                    status={previewTest.status}
                  />
                </div>

                {/* Plain-Language Explanation Box */}
                {previewExplanation && (
                  <div
                    style={{
                      marginTop: "1.25rem",
                      padding: "0.95rem 1.1rem",
                      backgroundColor: "var(--teal-surface)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--teal-border)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--teal-primary)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        marginBottom: "0.35rem"
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{t("in_simple_words")}</span>
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "var(--slate-700)", lineHeight: 1.5 }}>
                      {previewExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section style={{ marginBottom: "5rem" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
            <h2
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--teal-900)",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem"
              }}
            >
              {t("how_it_works_heading")}
            </h2>
            <p className="text-sub">
              {language === "hi"
                ? "सरल तीन चरणों में अपनी लैब रिपोर्ट को समझना शुरू करें।"
                : "Transforming your complex laboratory results into clear patient understanding in three simple steps."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.75rem"
            }}
          >
            {/* Step 1 */}
            <div
              className="card"
              style={{
                padding: "2rem 1.75rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--slate-200)"
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  border: "1px solid var(--teal-border)"
                }}
              >
                <UploadCloud size={26} strokeWidth={1.9} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.45rem" }}>
                {t("how_step_1_title")}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
                {t("how_step_1_desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="card"
              style={{
                padding: "2rem 1.75rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--slate-200)"
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  border: "1px solid var(--teal-border)"
                }}
              >
                <Sparkles size={26} strokeWidth={1.9} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.45rem" }}>
                {t("how_step_2_title")}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
                {t("how_step_2_desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="card"
              style={{
                padding: "2rem 1.75rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--slate-200)"
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: "var(--teal-surface)",
                  color: "var(--teal-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  border: "1px solid var(--teal-border)"
                }}
              >
                <TrendingUp size={26} strokeWidth={1.9} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.45rem" }}>
                {t("how_step_3_title")}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
                {t("how_step_3_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: WHAT YOU GET */}
        <section style={{ marginBottom: "5rem" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
            <h2
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--teal-900)",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem"
              }}
            >
              {t("what_you_get_heading")}
            </h2>
            <p className="text-sub">
              {language === "hi"
                ? "आपके स्वास्थ्य को समझने के लिए आवश्यक सभी सुविधाएं एक ही स्थान पर।"
                : "Thoughtfully crafted tools to make your medical reports approachable and empowering."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem"
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--slate-200)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div style={{ color: "var(--teal-primary)", marginBottom: "0.75rem" }}>
                <Sliders size={22} />
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.35rem" }}>
                {t("feature_ref_title")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", lineHeight: 1.45 }}>
                {t("feature_ref_desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--slate-200)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div style={{ color: "var(--teal-primary)", marginBottom: "0.75rem" }}>
                <FileText size={22} />
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.35rem" }}>
                {t("feature_exp_title")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", lineHeight: 1.45 }}>
                {t("feature_exp_desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--slate-200)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div style={{ color: "var(--teal-primary)", marginBottom: "0.75rem" }}>
                <TrendingUp size={22} />
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.35rem" }}>
                {t("feature_trends_title")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", lineHeight: 1.45 }}>
                {t("feature_trends_desc")}
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#ffffff",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--slate-200)",
                boxShadow: "var(--shadow-xs)"
              }}
            >
              <div style={{ color: "var(--teal-primary)", marginBottom: "0.75rem" }}>
                <HelpCircle size={22} />
              </div>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.35rem" }}>
                {t("feature_questions_title")}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", lineHeight: 1.45 }}>
                {t("feature_questions_desc")}
              </p>
            </div>
          </div>
        </section>

        {/* TRUST & DISCLAIMER STRIP */}
        <section
          style={{
            padding: "1.75rem 2rem",
            backgroundColor: "var(--teal-surface)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--teal-border)",
            display: "flex",
            alignItems: "flex-start",
            gap: "1.25rem"
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              color: "var(--teal-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "var(--shadow-xs)"
            }}
          >
            <ShieldCheck size={22} />
          </div>

          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.35rem" }}>
              {t("trust_strip_privacy")}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--slate-600)", lineHeight: 1.55 }}>
              {t("trust_strip_disclaimer")}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--slate-200)",
          backgroundColor: "#ffffff",
          padding: "1.25rem 2rem",
          fontSize: "0.82rem",
          color: "var(--slate-500)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <strong>HealthLens</strong> — {t("tagline")}
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span>Informational Healthcare Insights</span>
        </div>
      </footer>
    </div>
  );
}

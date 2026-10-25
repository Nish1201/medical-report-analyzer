import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useReport } from "../../context/ReportContext";
import { LanguageToggle } from "../common/LanguageToggle";
import logoImg from "../../assets/healthlens-logo.png";
import {
  Activity,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";

export function PatientSetupScreen({ onFinish, onBackToWelcome }) {
  const { language, t } = useLanguage();
  const { createPatientProfile, navigateTo } = useReport();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "Female",
    known_conditions: "",
    allergies: "",
    current_medications: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    age: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSexSelect = (val) => {
    setFormData((prev) => ({ ...prev, sex: val }));
  };

  const isStep1Valid = formData.name.trim().length > 0 && formData.age.trim().length > 0 && !!formData.sex;

  const handleContinueStep1 = (e) => {
    e.preventDefault();
    if (isStep1Valid) {
      setStep(2);
    } else {
      setTouched({ name: true, age: true });
    }
  };

  const handleFinish = async (skipOptional = false) => {
    const finalProfile = {
      name: formData.name.trim(),
      age: formData.age.trim(),
      sex: formData.sex || "Female",
      known_conditions: skipOptional || !formData.known_conditions.trim()
        ? t("none_reported")
        : formData.known_conditions.trim(),
      allergies: skipOptional || !formData.allergies.trim()
        ? t("none_reported")
        : formData.allergies.trim(),
      current_medications: skipOptional || !formData.current_medications.trim()
        ? t("none_reported")
        : formData.current_medications.trim()
    };

    await createPatientProfile(finalProfile);
    if (onFinish) {
      onFinish();
    } else {
      navigateTo("dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        color: "var(--slate-800)",
        overflowX: "hidden"
      }}
      className="setup-container animate-fade-in"
    >
      <style>{`
        .setup-container {
          display: flex;
          min-height: 100vh;
        }
        .setup-left-panel {
          flex: 0 0 420px;
          background-color: var(--teal-surface);
          border-right: 1px solid var(--teal-border);
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
        }
        .setup-right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          position: relative;
        }
        .setup-form-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 2.5rem 1.5rem;
        }
        .setup-mobile-header {
          display: none;
        }
        .setup-input {
          width: 100%;
          padding: 0.85rem 1rem;
          font-size: 0.95rem;
          color: var(--slate-900);
          background-color: #ffffff;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-md);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .setup-input:focus {
          border-color: var(--teal-primary);
          box-shadow: 0 0 0 3px rgba(4, 127, 140, 0.18);
        }
        @media (max-width: 860px) {
          .setup-container {
            flex-direction: column;
          }
          .setup-left-panel {
            display: none;
          }
          .setup-mobile-header {
            display: block;
            background-color: var(--teal-surface);
            border-bottom: 1px solid var(--teal-border);
            padding: 1.25rem 1.5rem;
          }
          .setup-form-wrapper {
            padding: 2rem 1.25rem 3.5rem 1.25rem;
          }
        }
      `}</style>

      {/* DESKTOP LEFT BRANDING PANEL */}
      <aside className="setup-left-panel">
        <div>
          <button
            type="button"
            onClick={onBackToWelcome || (() => navigateTo("welcome"))}
            style={{ display: "inline-block", textAlign: "left", cursor: "pointer" }}
            title="Back to Welcome"
          >
            <img
              src={logoImg}
              alt="HealthLens"
              style={{
                height: "40px",
                width: "auto",
                objectFit: "contain"
              }}
            />
          </button>

          <div style={{ marginTop: "3.5rem" }}>
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "var(--teal-900)",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                marginBottom: "2rem"
              }}
            >
              {t("setup_left_heading")}
            </h2>

            {/* 3 Value Points */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
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
                  <Activity size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)" }}>
                    {t("setup_benefit_1")}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
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
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)" }}>
                    {t("setup_benefit_2")}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
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
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--teal-900)" }}>
                    {t("setup_benefit_3")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            paddingTop: "1.75rem",
            borderTop: "1px solid var(--teal-border)",
            fontSize: "0.82rem",
            color: "var(--slate-600)"
          }}
        >
          <ShieldCheck size={18} color="var(--teal-primary)" style={{ flexShrink: 0 }} />
          <span>{t("privacy_reassurance")}</span>
        </div>
      </aside>

      {/* MOBILE COLLAPSED HEADER */}
      <div className="setup-mobile-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <img
            src={logoImg}
            alt="HealthLens"
            style={{ height: "32px", width: "auto", objectFit: "contain" }}
          />
          <LanguageToggle />
        </div>
        <p style={{ fontSize: "0.86rem", color: "var(--teal-900)", fontWeight: 600, marginTop: "0.6rem" }}>
          {t("setup_left_heading")}
        </p>
      </div>

      {/* RIGHT FORM PANEL */}
      <main className="setup-right-panel">
        {/* Desktop Language Switcher at Top Right */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "1.25rem 2rem",
            borderBottom: "1px solid var(--slate-100)"
          }}
        >
          <LanguageToggle />
        </div>

        {/* Vertically Centered Form Card */}
        <div className="setup-form-wrapper">
          <div style={{ maxWidth: "480px", width: "100%" }}>
            {/* Step Indicator Header */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--teal-primary)",
                  marginBottom: "0.5rem"
                }}
              >
                <span>
                  {t("step_indicator")} {step} {t("step_of")} 2
                </span>
                <span style={{ color: "var(--slate-400)", fontWeight: 500 }}>
                  {step === 1 ? (language === "hi" ? "प्राथमिक जानकारी" : "Basic Details") : (language === "hi" ? "वैकल्पिक स्वास्थ्य जानकारी" : "Health Preferences")}
                </span>
              </div>

              {/* Thin Progress Bar */}
              <div
                style={{
                  height: "4px",
                  width: "100%",
                  backgroundColor: "var(--slate-200)",
                  borderRadius: "2px",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: step === 1 ? "50%" : "100%",
                    backgroundColor: "var(--teal-primary)",
                    borderRadius: "2px",
                    transition: "width 0.35s ease"
                  }}
                />
              </div>
            </div>

            {/* STEP 1: BASIC DETAILS */}
            {step === 1 && (
              <form onSubmit={handleContinueStep1}>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2
                    style={{
                      fontSize: "1.65rem",
                      fontWeight: 800,
                      color: "var(--teal-900)",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.35rem"
                    }}
                  >
                    {t("step_1_title")}
                  </h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--slate-500)" }}>
                    {t("step_1_sub")}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="setup-name"
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.4rem"
                      }}
                    >
                      {t("full_name")} <span style={{ color: "#e11d48" }}>*</span>
                    </label>
                    <input
                      id="setup-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      required
                      placeholder=""
                      className="setup-input"
                    />
                    {touched.name && !formData.name.trim() && (
                      <span style={{ fontSize: "0.78rem", color: "#e11d48", marginTop: "0.25rem", display: "block" }}>
                        {t("full_name")} is required
                      </span>
                    )}
                  </div>

                  {/* Age or Date of Birth */}
                  <div>
                    <label
                      htmlFor="setup-age"
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.4rem"
                      }}
                    >
                      {t("age_or_dob")} <span style={{ color: "#e11d48" }}>*</span>
                    </label>
                    <input
                      id="setup-age"
                      name="age"
                      type="text"
                      value={formData.age}
                      onChange={handleChange}
                      onBlur={() => setTouched((p) => ({ ...p, age: true }))}
                      required
                      placeholder="e.g. 34 or 1990-05-12"
                      className="setup-input"
                    />
                    {touched.age && !formData.age.trim() && (
                      <span style={{ fontSize: "0.78rem", color: "#e11d48", marginTop: "0.25rem", display: "block" }}>
                        {t("age_or_dob")} is required
                      </span>
                    )}
                  </div>

                  {/* Sex as Segmented Button Group */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.5rem"
                      }}
                    >
                      {t("sex_label")}
                    </label>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.6rem"
                      }}
                    >
                      {["Female", "Male", "Other"].map((val) => {
                        const isSelected = formData.sex === val;
                        const label = val === "Female" ? t("female") : val === "Male" ? t("male") : t("other");

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSexSelect(val)}
                            style={{
                              padding: "0.75rem 0.5rem",
                              borderRadius: "var(--radius-md)",
                              border: `1.5px solid ${isSelected ? "var(--teal-primary)" : "var(--slate-200)"}`,
                              backgroundColor: isSelected ? "var(--teal-primary)" : "#ffffff",
                              color: isSelected ? "#ffffff" : "var(--slate-700)",
                              fontSize: "0.9rem",
                              fontWeight: isSelected ? 700 : 500,
                              transition: "all 0.2s ease",
                              boxShadow: isSelected ? "0 2px 6px rgba(4, 127, 140, 0.25)" : "none"
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Continue CTA */}
                <div style={{ marginTop: "2.25rem" }}>
                  <button
                    type="submit"
                    disabled={!isStep1Valid}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "0.9rem",
                      fontSize: "1rem",
                      opacity: isStep1Valid ? 1 : 0.6,
                      cursor: isStep1Valid ? "pointer" : "not-allowed"
                    }}
                  >
                    <span>{t("btn_continue")}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OPTIONAL HEALTH INFO */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: "1.75rem" }}>
                  <h2
                    style={{
                      fontSize: "1.65rem",
                      fontWeight: 800,
                      color: "var(--teal-900)",
                      letterSpacing: "-0.02em",
                      marginBottom: "0.35rem"
                    }}
                  >
                    {t("step_2_title")}
                  </h2>
                  <p style={{ fontSize: "0.88rem", color: "var(--slate-500)", lineHeight: 1.45 }}>
                    {t("step_2_helper")}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Known Conditions */}
                  <div>
                    <label
                      htmlFor="setup-conditions"
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.4rem"
                      }}
                    >
                      {t("known_conditions_optional")}
                    </label>
                    <input
                      id="setup-conditions"
                      name="known_conditions"
                      type="text"
                      value={formData.known_conditions}
                      onChange={handleChange}
                      placeholder={t("placeholder_comma")}
                      className="setup-input"
                    />
                  </div>

                  {/* Allergies */}
                  <div>
                    <label
                      htmlFor="setup-allergies"
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.4rem"
                      }}
                    >
                      {t("allergies_optional")}
                    </label>
                    <input
                      id="setup-allergies"
                      name="allergies"
                      type="text"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder={t("placeholder_comma")}
                      className="setup-input"
                    />
                  </div>

                  {/* Current Medications */}
                  <div>
                    <label
                      htmlFor="setup-medications"
                      style={{
                        display: "block",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: "var(--slate-700)",
                        marginBottom: "0.4rem"
                      }}
                    >
                      {t("medications_optional")}
                    </label>
                    <input
                      id="setup-medications"
                      name="current_medications"
                      type="text"
                      value={formData.current_medications}
                      onChange={handleChange}
                      placeholder={t("placeholder_comma")}
                      className="setup-input"
                    />
                  </div>
                </div>

                {/* Step 2 Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "2.5rem",
                    gap: "0.75rem",
                    flexWrap: "wrap"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                    style={{ padding: "0.75rem 1.25rem", fontSize: "0.92rem" }}
                  >
                    <ArrowLeft size={16} />
                    <span>{t("btn_back")}</span>
                  </button>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => handleFinish(true)}
                      className="btn-subtle"
                      style={{ padding: "0.75rem 1rem", fontSize: "0.92rem" }}
                    >
                      {t("btn_skip")}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinish(false)}
                      className="btn-primary"
                      style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}
                    >
                      <Check size={16} />
                      <span>{t("btn_create_profile")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

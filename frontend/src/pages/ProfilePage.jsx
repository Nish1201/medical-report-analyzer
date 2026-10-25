import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useReport } from "../context/ReportContext";
import {
  Heart,
  Edit3,
  X,
  Check
} from "lucide-react";

export function ProfilePage() {
  const { t } = useLanguage();
  const { patient, updatePatientProfile, resetPatient } = useReport();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    age: patient?.age || "",
    sex: patient?.sex || "Female",
    known_conditions: patient?.known_conditions || "",
    allergies: patient?.allergies || "",
    current_medications: patient?.current_medications || ""
  });

  const getInitials = (name) => {
    if (!name) return "PT";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updatePatientProfile({
      ...patient,
      name: formData.name.trim() || patient?.name,
      age: formData.age || patient?.age,
      sex: formData.sex || patient?.sex,
      known_conditions: formData.known_conditions.trim() || t("none_reported"),
      allergies: formData.allergies.trim() || t("none_reported"),
      current_medications: formData.current_medications.trim() || t("none_reported")
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setFormData({
      name: patient?.name || "",
      age: patient?.age || "",
      sex: patient?.sex || "Female",
      known_conditions: patient?.known_conditions || "",
      allergies: patient?.allergies || "",
      current_medications: patient?.current_medications || ""
    });
    setIsEditing(true);
  };

  return (
    <div className="content-container animate-fade-in" style={{ maxWidth: "860px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem"
        }}
      >
        <div>
          <h2 className="heading-xl">{t("profile_heading")}</h2>
          <p className="text-sub" style={{ marginTop: "0.25rem" }}>
            {t("profile_sub")}
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="btn-secondary"
            style={{ fontSize: "0.88rem", padding: "0.55rem 1.15rem" }}
          >
            <Edit3 size={15} color="var(--teal-primary)" />
            <span>{t("btn_edit_profile")}</span>
          </button>
        )}
      </div>

      {/* Edit Form Card when editing */}
      {isEditing ? (
        <div
          className="card"
          style={{
            padding: "2rem",
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            marginBottom: "1.75rem",
            border: "1px solid var(--teal-border)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--teal-900)" }}>
              {t("btn_edit_profile")}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-subtle"
              style={{ padding: "4px" }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                {t("full_name")} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                  {t("age_or_dob")}
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                  {t("sex_label")}
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem", backgroundColor: "#ffffff" }}
                >
                  <option value="Female">{t("female")}</option>
                  <option value="Male">{t("male")}</option>
                  <option value="Other">{t("other")}</option>
                  <option value="Prefer not to say">{t("prefer_not_to_say")}</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                {t("known_conditions_optional")}
              </label>
              <input
                type="text"
                name="known_conditions"
                value={formData.known_conditions}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                {t("allergies_optional")}
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--slate-700)", marginBottom: "0.35rem" }}>
                {t("medications_optional")}
              </label>
              <input
                type="text"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", border: "1px solid var(--slate-200)", fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                <Check size={16} />
                <span>{t("btn_save_changes")}</span>
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                <span>{t("btn_cancel")}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Patient Identity Banner */}
          <div
            className="card"
            style={{
              padding: "2rem",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-lg)",
              marginBottom: "1.75rem",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
              border: "1px solid var(--slate-200)",
              boxShadow: "var(--shadow-card)"
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                backgroundColor: "var(--teal-surface)",
                color: "var(--teal-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                border: "2px solid var(--teal-border)",
                flexShrink: 0
              }}
            >
              {getInitials(patient?.name)}
            </div>

            <div style={{ flex: 1, minWidth: "220px" }}>
              <h3 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--teal-900)" }}>
                {patient?.name}
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  fontSize: "0.88rem",
                  color: "var(--slate-500)",
                  marginTop: "0.35rem",
                  flexWrap: "wrap"
                }}
              >
                {patient?.age && (
                  <span>
                    {t("age")}: <strong style={{ color: "var(--slate-700)" }}>{patient.age}</strong>
                  </span>
                )}
                {patient?.age && patient?.sex && <span>•</span>}
                {patient?.sex && (
                  <span>
                    {t("gender")}: <strong style={{ color: "var(--slate-700)" }}>{patient.sex}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* HEALTH INFORMATION SECTION (Neutral card style for all fields) */}
          <div
            className="card"
            style={{
              padding: "1.75rem",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-lg)",
              marginBottom: "2rem"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.25rem"
              }}
            >
              <Heart size={18} color="var(--teal-primary)" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--teal-900)" }}>
                {t("health_info_title")}
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1.25rem"
              }}
            >
              {/* Known Conditions */}
              <div
                style={{
                  padding: "1.15rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--slate-150)"
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("known_conditions")}
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: 600, color: "var(--slate-800)", marginTop: "0.4rem" }}>
                  {patient?.known_conditions || t("none_reported")}
                </div>
              </div>

              {/* Allergies (in same neutral card style, no alert styling) */}
              <div
                style={{
                  padding: "1.15rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--slate-150)"
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("allergies")}
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: 600, color: "var(--slate-800)", marginTop: "0.4rem" }}>
                  {patient?.allergies || t("none_reported")}
                </div>
              </div>

              {/* Current Medications */}
              <div
                style={{
                  padding: "1.15rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--slate-150)"
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--slate-400)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("medications")}
                </div>
                <div style={{ fontSize: "1.02rem", fontWeight: 600, color: "var(--slate-800)", marginTop: "0.4rem" }}>
                  {patient?.current_medications || t("none_reported")}
                </div>
              </div>
            </div>
          </div>

          {/* Switch patient / start over text link per Requirement E.4 */}
          <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
            <button
              type="button"
              onClick={resetPatient}
              style={{
                fontSize: "0.85rem",
                color: "var(--slate-500)",
                textDecoration: "underline",
                cursor: "pointer",
                transition: "color 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--teal-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--slate-500)")}
            >
              {t("switch_patient")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

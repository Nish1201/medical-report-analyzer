import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { HelpCircle, Copy, Check, Printer } from "lucide-react";

export function DoctorQuestionsCard({ doctorQuestions }) {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(new Set());

  // If empty, hide the Doctor Questions section completely
  if (!doctorQuestions) return null;
  const list = Array.isArray(doctorQuestions) ? doctorQuestions : [doctorQuestions];
  if (list.length === 0) return null;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="card animate-fade-in"
      id="doctor-questions-section"
      style={{
        padding: "1.75rem",
        marginBottom: "2rem",
        backgroundColor: "#ffffff",
        border: "1px solid var(--slate-200)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1rem"
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.35rem"
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                backgroundColor: "var(--teal-surface)",
                color: "var(--teal-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--teal-border)"
              }}
            >
              <HelpCircle size={16} />
            </div>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--teal-900)",
                letterSpacing: "-0.015em"
              }}
            >
              {t("doctor_questions_title")}
            </h3>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--slate-500)", maxWidth: "600px" }}>
            {t("doctor_questions_sub")}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-secondary"
          style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
        >
          <Printer size={14} />
          <span>{t("print_report")}</span>
        </button>
      </div>

      {/* Questions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
        {list.map((item, index) => {
          // Defensive: item can be string OR { question, note }
          const isString = typeof item === "string";
          const qText = isString ? item : (item.question || "");
          const noteText = !isString && item.note ? item.note : null;
          const itemId = `dq-${index}`;

          const isCopied = copiedId === itemId;
          const isChecked = checkedIds.has(itemId);

          if (!qText.trim()) return null;

          return (
            <div
              key={itemId}
              style={{
                padding: "1rem 1.15rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: isChecked ? "var(--teal-surface)" : "var(--slate-50)",
                border: `1px solid ${isChecked ? "var(--teal-border)" : "var(--slate-200)"}`,
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1 }}>
                <input
                  type="checkbox"
                  id={`q-check-${itemId}`}
                  checked={isChecked}
                  onChange={() => toggleCheck(itemId)}
                  style={{
                    marginTop: "0.25rem",
                    width: "16px",
                    height: "16px",
                    accentColor: "var(--teal-primary)",
                    cursor: "pointer"
                  }}
                  aria-label="Select question for visit"
                />

                <div>
                  <label
                    htmlFor={`q-check-${itemId}`}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: isChecked ? "var(--teal-900)" : "var(--slate-800)",
                      cursor: "pointer",
                      lineHeight: 1.45,
                      display: "block"
                    }}
                  >
                    "{qText}"
                  </label>
                  {noteText && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--slate-500)",
                        marginTop: "0.3rem"
                      }}
                    >
                      {noteText}
                    </div>
                  )}
                </div>
              </div>

              {/* Copy button */}
              <button
                type="button"
                onClick={() => handleCopy(itemId, qText)}
                title="Copy question text"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  color: isCopied ? "var(--teal-primary)" : "var(--slate-500)",
                  backgroundColor: isCopied ? "var(--teal-surface)" : "#ffffff",
                  border: "1px solid var(--slate-200)",
                  flexShrink: 0
                }}
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                <span>{isCopied ? t("copied") : t("copy_question")}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

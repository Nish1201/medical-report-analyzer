import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { GitMerge, CheckCircle, MessageSquare } from "lucide-react";

export function RelatedFindingsCard({ relatedFindings, onDiscussClick }) {
  const { t } = useLanguage();
  const [marked, setMarked] = useState(false);

  // If empty or null, hide the Related Findings section completely
  if (!relatedFindings) return null;
  const list = Array.isArray(relatedFindings) ? relatedFindings : [relatedFindings];
  if (list.length === 0) return null;

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "1.75rem",
        marginBottom: "2rem",
        backgroundColor: "#ffffff",
        border: "1px solid var(--slate-200)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          marginBottom: "0.5rem"
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
          <GitMerge size={16} />
        </div>
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 800,
            color: "var(--teal-900)",
            textTransform: "uppercase",
            letterSpacing: "0.06em"
          }}
        >
          {t("related_findings_title")}
        </span>
      </div>

      {list.map((item, idx) => {
        // Defensive rendering: item can be string OR { title, tests, text }
        const isString = typeof item === "string";
        const title = isString ? "" : item.title || "";
        const tests = !isString && Array.isArray(item.tests) ? item.tests : [];
        const text = isString ? item : (item.text || "");

        return (
          <div key={idx} style={{ marginTop: idx > 0 ? "1.25rem" : "0.5rem" }}>
            {title && (
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--teal-900)",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.015em"
                }}
              >
                {title}
              </h3>
            )}

            {/* Tags Cluster if provided */}
            {tests.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.75rem"
                }}
              >
                {tests.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      backgroundColor: "var(--slate-100)",
                      color: "var(--slate-700)",
                      border: "1px solid var(--slate-200)",
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)"
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {text && (
              <p
                style={{
                  fontSize: "0.935rem",
                  color: "var(--slate-600)",
                  lineHeight: 1.6
                }}
              >
                {text}
              </p>
            )}
          </div>
        );
      })}

      {/* CTA Button: Discuss with your doctor (clinical context subtitle removed per spec) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "1rem",
          marginTop: "1.25rem",
          borderTop: "1px solid var(--slate-150)"
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMarked(!marked);
            if (onDiscussClick) onDiscussClick();
          }}
          className={marked ? "btn-secondary" : "btn-primary"}
          style={{ fontSize: "0.875rem", padding: "0.55rem 1.15rem" }}
        >
          {marked ? (
            <>
              <CheckCircle size={15} color="var(--teal-primary)" />
              <span>Added to Doctor Checklist</span>
            </>
          ) : (
            <>
              <MessageSquare size={15} />
              <span>{t("discuss_doctor")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

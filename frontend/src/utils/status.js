/**
 * HealthLens - Status Normalization Utility
 * 
 * Maps any backend status representation to one of 5 canonical statuses:
 * 'within' | 'above' | 'below' | 'attention' | 'unknown'
 */

export function isNumeric(val) {
  if (val === null || val === undefined || val === '') return false;
  return !isNaN(Number(val));
}

/**
 * Normalizes a status string or derives it from numeric bounds if missing
 * @param {string} rawStatus
 * @param {number|string} value
 * @param {number|string} refLow
 * @param {number|string} refHigh
 * @returns {'within' | 'above' | 'below' | 'attention' | 'unknown'}
 */
export function normalizeStatus(rawStatus, value, refLow, refHigh) {
  const s = (rawStatus || "").toString().trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (s === "within_range" || s === "within" || s === "normal" || s === "in_range") {
    return "within";
  }
  if (s === "above_range" || s === "above" || s === "high") {
    return "above";
  }
  if (s === "below_range" || s === "below" || s === "low") {
    return "below";
  }
  if (s === "needs_attention" || s === "attention" || s === "review" || s === "borderline") {
    return "attention";
  }

  // If status is missing or unknown, but value and both reference bounds are numeric, compute it
  if (isNumeric(value) && isNumeric(refLow) && isNumeric(refHigh)) {
    const numVal = Number(value);
    const low = Number(refLow);
    const high = Number(refHigh);

    if (numVal < low) return "below";
    if (numVal > high) return "above";
    return "within";
  }

  return "unknown";
}

/**
 * Returns translated display label for canonical status
 */
export function getStatusLabel(canonicalStatus, lang = "en") {
  const isHi = lang === "hi";
  switch (canonicalStatus) {
    case "within":
      return isHi ? "सामान्य सीमा में" : "Within Range";
    case "above":
      return isHi ? "सीमा से अधिक" : "Above Range";
    case "below":
      return isHi ? "सीमा से कम" : "Below Range";
    case "attention":
      return isHi ? "ध्यान दें" : "Needs Attention";
    case "unknown":
    default:
      return isHi ? "मूल्यांकन नहीं किया गया" : "Not Rated";
  }
}

/**
 * Returns badge styling tokens for canonical status
 */
export function getStatusStyle(canonicalStatus) {
  switch (canonicalStatus) {
    case "within":
      return {
        bg: "var(--status-normal-bg)",
        border: "var(--status-normal-border)",
        text: "var(--status-normal-text)",
        dot: "var(--status-normal-dot)"
      };
    case "above":
      return {
        bg: "var(--status-above-bg)",
        border: "var(--status-above-border)",
        text: "var(--status-above-text)",
        dot: "var(--status-above-dot)"
      };
    case "below":
      return {
        bg: "var(--status-below-bg)",
        border: "var(--status-below-border)",
        text: "var(--status-below-text)",
        dot: "var(--status-below-dot)"
      };
    case "attention":
      return {
        bg: "var(--status-attention-bg)",
        border: "var(--status-attention-border)",
        text: "var(--status-attention-text)",
        dot: "var(--status-attention-dot)"
      };
    case "unknown":
    default:
      return {
        bg: "var(--status-unknown-bg)",
        border: "var(--status-unknown-border)",
        text: "var(--status-unknown-text)",
        dot: "var(--status-unknown-dot)"
      };
  }
}

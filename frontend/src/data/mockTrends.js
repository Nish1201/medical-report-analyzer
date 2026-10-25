/**
 * HealthLens - Health Trends Mock Data (Stand-in only)
 * 
 * Historical data series matching the reports archive.
 */

export const mockTrends = {
  hemoglobin: {
    test_name: "Hemoglobin",
    unit: "g/dL",
    reference_low: 12.0,
    reference_high: 15.5,
    history: [
      { date: "Jun 2026", date_full: "12 June 2026", value: 13.5 },
      { date: "Aug 2026", date_full: "01 August 2026", value: 13.2 },
      { date: "Oct 2026", date_full: "18 October 2026", value: 12.8 }
    ]
  },

  glucose: {
    test_name: "Fasting Glucose",
    unit: "mg/dL",
    reference_low: 70,
    reference_high: 99,
    history: [
      { date: "Jun 2026", date_full: "12 June 2026", value: 91 },
      { date: "Aug 2026", date_full: "01 August 2026", value: 94 },
      { date: "Oct 2026", date_full: "18 October 2026", value: 108 }
    ]
  },

  creatinine: {
    test_name: "Creatinine",
    unit: "mg/dL",
    reference_low: 0.6,
    reference_high: 1.2,
    history: [
      { date: "Jun 2026", date_full: "12 June 2026", value: 0.82 },
      { date: "Aug 2026", date_full: "01 August 2026", value: 0.85 },
      { date: "Oct 2026", date_full: "18 October 2026", value: 0.88 }
    ]
  },

  platelets: {
    test_name: "Platelet Count",
    unit: "×10³/µL",
    reference_low: 150,
    reference_high: 450,
    history: [
      { date: "Jun 2026", date_full: "12 June 2026", value: 255 },
      { date: "Aug 2026", date_full: "01 August 2026", value: 250 },
      { date: "Oct 2026", date_full: "18 October 2026", value: 242 }
    ]
  }
};

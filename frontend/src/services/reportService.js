/**
 * HealthLens - Frontend Service Layer (API Abstraction)
 * 
 * ============================================================================
 * EXPECTED REPORT OBJECT SHAPE:
 * ============================================================================
 * {
 *   patient_id: string,
 *   patient_name: string,
 *   age: number | string,
 *   sex: string,
 *   report_date: string,
 *   report_type: string,
 *   lab_name: string,
 *   tests: [
 *     {
 *       test_name: string,
 *       category?: string,
 *       value: number | string, // number OR qualitative text (e.g. "O Positive")
 *       unit: string,
 *       reference_low: number | null,
 *       reference_high: number | null,
 *       status: string, // e.g. "within_range" | "above_range" | "below_range" | "needs_attention"
 *       medical_explanation?: string,
 *       simple_explanation?: string,
 *       simple_explanation_hi?: string
 *     }
 *   ],
 *   summary: {
 *     total: number,
 *     within_range: number,
 *     outside_range: number,
 *     unknown: number,
 *     text: string
 *   },
 *   related_findings: (string | { title: string, tests: string[], text: string })[],
 *   doctor_questions: (string | { question: string, note?: string })[]
 * }
 * ============================================================================
 */

import { mockReports } from "../data/mockReports";
import { mockTrends } from "../data/mockTrends";

export const USE_MOCK = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const STORAGE_KEY_PATIENT = "healthlens_patient_profile";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory session store for reports belonging to the current patient.
// Note: This in-memory behaviour is a mock stand-in; the real backend will return reports and history keyed by patient_id.
let sessionReports = [];

export const reportService = {
  /**
   * Get the current patient profile.
   * Reads from localStorage cache if available.
   * Returns null if no patient profile has been set yet.
   */
  async getPatient() {
    await delay(50);
    const cached = localStorage.getItem(STORAGE_KEY_PATIENT);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached patient profile", e);
      }
    }
    return null;
  },

  /**
   * Create a new patient profile.
   * A newly created patient starts with no reports and no history.
   */
  async createPatient(profile) {
    await delay(100);
    // Reset session-scoped reports for the new patient
    sessionReports = [];

    // TODO: The real patient_id will come from the backend (e.g. POST /api/patient).
    const created = {
      ...profile,
      patient_id: profile.patient_id || `PT-${Math.floor(10000 + Math.random() * 90000)}`
    };
    localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(created));
    return created;
  },

  /**
   * Update an existing patient profile.
   */
  async updatePatient(profile) {
    await delay(100);
    // TODO: Real endpoint to be decided by backend team (e.g. PUT /api/patient/:id)
    const current = await this.getPatient();
    const updated = {
      ...(current || {}),
      ...profile,
      patient_id: profile.patient_id || current?.patient_id || "PT-10001"
    };
    localStorage.setItem(STORAGE_KEY_PATIENT, JSON.stringify(updated));
    return updated;
  },

  /**
   * Clear the patient profile from cache (for switch patient / start over).
   */
  async clearPatient() {
    localStorage.removeItem(STORAGE_KEY_PATIENT);
    sessionReports = [];
  },

  /**
   * Fetch all reports for the active patient.
   * In mock mode, only returns in-memory reports uploaded by the active patient.
   */
  async getReports() {
    await delay(150);
    if (!USE_MOCK) {
      // TODO: Real endpoint to be decided by backend team (e.g. GET /api/reports)
    }
    // In-memory mock stand-in: the real backend will return reports keyed by patient_id.
    return [...sessionReports];
  },

  /**
   * Fetch a single report by ID.
   */
  async getReport(id) {
    await delay(100);
    if (!USE_MOCK) {
      // TODO: Real endpoint to be decided by backend team (e.g. GET /api/reports/:id)
    }
    // In-memory mock stand-in: the real backend will return reports keyed by patient_id.
    const found = sessionReports.find((r) => r.id === id);
    return found || sessionReports[0] || null;
  },

  /**
   * Fetch longitudinal trend data for a specific test parameter.
   */
  async getTrend(testName) {
    await delay(100);
    if (!USE_MOCK) {
      // TODO: Real endpoint to be decided by backend team (e.g. GET /api/trends?test=...)
    }
    // Note: This in-memory behaviour is a mock stand-in; the real backend will return reports and history keyed by patient_id.
    // When fewer than 2 reports exist, return empty history so Trends shows its empty state.
    if (sessionReports.length < 2) {
      return {
        test_name: testName || "",
        unit: "",
        reference_low: null,
        reference_high: null,
        history: []
      };
    }

    const key = (testName || "").toLowerCase().replace(/[\s-]+/g, "");
    for (const [k, data] of Object.entries(mockTrends)) {
      if (k === key || data.test_name.toLowerCase().replace(/[\s-]+/g, "") === key) {
        return data;
      }
    }
    return mockTrends.hemoglobin;
  },

  /**
   * Fetch all trend series.
   */
  async getAllTrends() {
    await delay(50);
    if (!USE_MOCK) {
      // TODO: Real endpoint to be decided by backend team (e.g. GET /api/trends)
    }
    // Note: This in-memory behaviour is a mock stand-in; the real backend will return reports and history keyed by patient_id.
    // When fewer than 2 reports exist, return empty trends so Trends shows its empty state.
    if (sessionReports.length < 2) {
      return {};
    }
    return mockTrends;
  },

  /**
   * Provide a sample test for the Welcome Page landing preview card.
   * Does not attach any reports to the active patient profile.
   */
  async getPreviewTest() {
    await delay(20);
    const sample = mockReports[0];
    const test = sample.tests.find((t) => t.test_name === "Fasting Glucose") || sample.tests[1] || sample.tests[0];
    return {
      test,
      report_type: sample.report_type,
      lab_name: sample.lab_name
    };
  },

  /**
   * Upload and process a new medical report file.
   */
  async uploadReport(file, patientId, onProgress) {
    if (!USE_MOCK) {
      const formData = new FormData();
      formData.append("file", file);
      if (patientId) formData.append("patient_id", patientId);

      const url = `${API_BASE_URL}/api/upload`;
      const res = await fetch(url, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }
      return await res.json();
    }

    // Mock progress simulation
    if (onProgress) onProgress({ stage: "uploading", progress: 30 });
    await delay(300);
    if (onProgress) onProgress({ stage: "uploading", progress: 75 });
    await delay(300);
    if (onProgress) onProgress({ stage: "analyzing", step: 1 });
    await delay(400);
    if (onProgress) onProgress({ stage: "analyzing", step: 2 });
    await delay(450);
    if (onProgress) onProgress({ stage: "analyzing", step: 3 });
    await delay(400);
    if (onProgress) onProgress({ stage: "ready", progress: 100 });

    // Note: This in-memory behaviour is a mock stand-in; the real backend will return reports and history keyed by patient_id.
    const currentPatient = await this.getPatient();
    const templateIndex = file?.reportIndex !== undefined ? file.reportIndex : 0;
    const template = mockReports[templateIndex] || mockReports[0];

    const newReport = {
      ...template,
      id: `rep-${Date.now()}`,
      patient_id: currentPatient?.patient_id || patientId || "PT-NEW",
      patient_name: currentPatient?.name || "Patient",
      age: currentPatient?.age || "--",
      sex: currentPatient?.sex || "--",
      report_date: new Date().toISOString().split("T")[0]
    };

    sessionReports = [newReport, ...sessionReports];
    return newReport;
  }
};

// Named function exports for direct imports per specification
export async function getPatient() {
  return reportService.getPatient();
}

export async function createPatient(profile) {
  return reportService.createPatient(profile);
}

export async function updatePatient(profile) {
  return reportService.updatePatient(profile);
}

export async function clearPatient() {
  return reportService.clearPatient();
}

export async function getReports() {
  return reportService.getReports();
}

export async function getReport(id) {
  return reportService.getReport(id);
}

export async function getTrend(testName) {
  return reportService.getTrend(testName);
}

export async function getAllTrends() {
  return reportService.getAllTrends();
}

export async function getPreviewTest() {
  return reportService.getPreviewTest();
}

export async function uploadReport(file, patientId, onProgress) {
  return reportService.uploadReport(file, patientId, onProgress);
}


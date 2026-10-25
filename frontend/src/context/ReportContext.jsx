import React, { createContext, useContext, useState, useEffect } from "react";
import { reportService } from "../services/reportService";

const ReportContext = createContext();

export function ReportProvider({ children }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [trends, setTrends] = useState({});
  const [selectedTrendTest, setSelectedTrendTest] = useState("hemoglobin");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [setupView, setSetupView] = useState(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/start") {
      return "start";
    }
    return "welcome";
  });

  // Initialize data and patient on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        // Load patient profile from service/cache
        const patientData = await reportService.getPatient();
        setPatient(patientData);

        // Load reports (empty for new patient)
        const all = await reportService.getReports();
        setReports(all);
        if (all.length > 0) {
          setCurrentReport(all[0]);
        } else {
          setCurrentReport(null);
        }

        // Load trends (empty for new patient)
        const allTrends = await reportService.getAllTrends();
        setTrends(allTrends || {});
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();

    // Listen to browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === "/start") {
        setSetupView("start");
      } else if (path === "/upload") {
        setActiveTab("upload");
      } else if (path === "/analysis") {
        setActiveTab("analysis");
      } else if (path === "/trends") {
        setActiveTab("trends");
      } else if (path === "/reports") {
        setActiveTab("reports");
      } else if (path === "/profile") {
        setActiveTab("profile");
      } else {
        setSetupView("welcome");
        setActiveTab("dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const createPatientProfile = async (profileData) => {
    const created = await reportService.createPatient(profileData);
    setPatient(created);
    setReports([]);
    setCurrentReport(null);
    setTrends({});
    setActiveTab("dashboard");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
    return created;
  };

  const updatePatientProfile = async (profileData) => {
    const updated = await reportService.updatePatient(profileData);
    setPatient(updated);
    return updated;
  };

  const resetPatient = async () => {
    await reportService.clearPatient();
    setPatient(null);
    setReports([]);
    setCurrentReport(null);
    setTrends({});
    setSetupView("welcome");
    setActiveTab("dashboard");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
  };

  const addReport = (newReport) => {
    setReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    setCurrentReport(newReport);
  };

  /**
   * Seamless in-app navigation helper
   */
  const navigateTo = (tab, payload = null) => {
    if (tab === "trends" && payload?.trend_id) {
      setSelectedTrendTest(payload.trend_id);
    }
    if (tab === "analysis" && payload?.report) {
      setCurrentReport(payload.report);
    }

    if (tab === "start") {
      setSetupView("start");
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/start");
      }
      return;
    }

    if (tab === "welcome") {
      setSetupView("welcome");
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/");
      }
      return;
    }

    setActiveTab(tab);
    if (typeof window !== "undefined" && patient) {
      const urlPath = tab === "dashboard" ? "/" : `/${tab}`;
      window.history.pushState(null, "", urlPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ReportContext.Provider
      value={{
        activeTab,
        setActiveTab,
        setupView,
        setSetupView,
        navigateTo,
        reports,
        setReports,
        addReport,
        currentReport,
        setCurrentReport,
        selectedTrendTest,
        setSelectedTrendTest,
        trends,
        patient,
        createPatientProfile,
        updatePatientProfile,
        resetPatient,
        loading
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}

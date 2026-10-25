import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ReportProvider, useReport } from "./context/ReportContext";
import { WelcomePage } from "./pages/WelcomePage";
import { PatientSetupScreen } from "./components/profile/PatientSetupScreen";
import { Sidebar } from "./components/common/Sidebar";
import { Navbar } from "./components/common/Navbar";
import { DisclaimerBanner } from "./components/common/DisclaimerBanner";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadPage } from "./pages/UploadPage";
import { ReportAnalysisPage } from "./pages/ReportAnalysisPage";
import { TrendsPage } from "./pages/TrendsPage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { ProfilePage } from "./pages/ProfilePage";
import "./App.css";

function AppContent() {
  const { activeTab, patient, loading, setupView, setSetupView } = useReport();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If initial load in progress
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app)",
          color: "var(--slate-500)"
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  // FLOW WITH NO PATIENT PROFILE SET:
  // "/" shows Welcome landing page; "/start" shows 2-step setup screen.
  // Sidebar and top bar must NOT appear on Welcome or setup screens.
  if (!patient) {
    const isStartPath = setupView === "start" || (typeof window !== "undefined" && window.location.pathname === "/start");
    if (isStartPath) {
      return (
        <PatientSetupScreen
          onBackToWelcome={() => {
            if (typeof window !== "undefined") {
              window.history.pushState(null, "", "/");
            }
            setSetupView("welcome");
          }}
          onFinish={() => {
            if (typeof window !== "undefined") {
              window.history.pushState(null, "", "/");
            }
            setSetupView("welcome");
          }}
        />
      );
    }

    return (
      <WelcomePage
        onGetStarted={() => {
          if (typeof window !== "undefined") {
            window.history.pushState(null, "", "/start");
          }
          setSetupView("start");
        }}
      />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "upload":
        return <UploadPage />;
      case "analysis":
        return <ReportAnalysisPage />;
      case "trends":
        return <TrendsPage />;
      case "reports":
        return <MyReportsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Header */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Informational Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Dynamic Page Router */}
        <main style={{ flex: 1 }}>{renderActivePage()}</main>

        {/* Clean Footer */}
        <footer
          style={{
            borderTop: "1px solid var(--slate-200)",
            backgroundColor: "#ffffff",
            padding: "1.25rem 2rem",
            fontSize: "0.8rem",
            color: "var(--slate-500)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div>
            <strong>HealthLens</strong> — {t("tagline")}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ReportProvider>
        <AppContent />
      </ReportProvider>
    </LanguageProvider>
  );
}

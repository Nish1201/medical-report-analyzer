import React, { useState, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useReport } from "../../context/ReportContext";
import { reportService } from "../../services/reportService";
import {
  UploadCloud,
  FileCheck2,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Zap
} from "lucide-react";

export function UploadZone() {
  const { t } = useLanguage();
  const { navigateTo, setCurrentReport, addReport, patient } = useReport();

  // Upload States: 'empty' | 'selected' | 'uploading' | 'analyzing' | 'ready'
  const [state, setState] = useState("empty");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type || "application/pdf",
      rawFile: file
    });
    setState("selected");
  };

  const handleChooseSample = (sampleType) => {
    setSelectedFile({
      name: sampleType === "cbc" ? "Apex_Labs_CBC_Oct2026.pdf" : "Routine_Metabolic_Aug2026.pdf",
      size: "1.4 MB",
      type: "application/pdf",
      isSample: true,
      reportIndex: sampleType === "cbc" ? 0 : 1
    });
    setState("selected");
  };

  const startAnalysisFlow = async () => {
    setState("uploading");
    setUploadProgress(20);

    try {
      const fileToUpload = selectedFile?.rawFile || selectedFile;
      const resultReport = await reportService.uploadReport(
        fileToUpload,
        patient?.patient_id,
        (update) => {
          if (update.stage === "uploading") {
            setUploadProgress(update.progress);
          } else if (update.stage === "analyzing") {
            setState("analyzing");
            setAnalysisStep(update.step);
          } else if (update.stage === "ready") {
            setUploadProgress(100);
            setState("ready");
          }
        }
      );

      if (resultReport) {
        addReport(resultReport);
        setCurrentReport(resultReport);
      }
    } catch (err) {
      console.error("Upload error", err);
      setState("ready");
    }
  };

  const handleViewReport = () => {
    navigateTo("analysis");
  };

  const handleReset = () => {
    setState("empty");
    setSelectedFile(null);
    setUploadProgress(0);
    setAnalysisStep(1);
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto" }}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.png,.jpg,.jpeg"
        style={{ display: "none" }}
      />

      {/* STATE 1: EMPTY UPLOAD */}
      {state === "empty" && (
        <div className="animate-fade-in">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: isDragOver ? "var(--teal-surface)" : "#ffffff",
              border: `2px dashed ${isDragOver ? "var(--teal-primary)" : "var(--teal-border)"}`,
              borderRadius: "var(--radius-xl)",
              padding: "3.5rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--transition-base)",
              boxShadow: "var(--shadow-card)"
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "20px",
                backgroundColor: "var(--teal-surface)",
                color: "var(--teal-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.25rem",
                border: "1px solid var(--teal-border)"
              }}
            >
              <UploadCloud size={34} strokeWidth={1.8} />
            </div>

            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--teal-900)",
                marginBottom: "0.4rem"
              }}
            >
              {t("dropzone_title")}
            </h3>

            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--slate-400)",
                margin: "0.6rem 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem"
              }}
            >
              <span style={{ height: "1px", width: "40px", backgroundColor: "var(--slate-200)" }} />
              <span>{t("dropzone_or")}</span>
              <span style={{ height: "1px", width: "40px", backgroundColor: "var(--slate-200)" }} />
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ margin: "0.5rem 0 1rem 0" }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {t("choose_file_btn")}
            </button>

            <div style={{ fontSize: "0.8rem", color: "var(--slate-400)" }}>
              {t("supported_formats")}
            </div>
          </div>

          {/* Quick Demo Samples for instant testing without uploading a personal file */}
          <div
            style={{
              marginTop: "1.75rem",
              padding: "1.25rem",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--slate-200)",
              boxShadow: "var(--shadow-xs)"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--slate-700)",
                marginBottom: "0.85rem"
              }}
            >
              <Zap size={14} color="var(--teal-primary)" />
              <span>{t("try_demo_sample")}</span>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleChooseSample("cbc")}
                className="btn-secondary"
                style={{ flex: 1, minWidth: "220px", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                <FileText size={18} color="var(--teal-primary)" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>Complete Blood Count (CBC)</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>Apex Labs • Oct 2026 • 1.4 MB</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChooseSample("metabolic")}
                className="btn-secondary"
                style={{ flex: 1, minWidth: "220px", justifyContent: "flex-start", padding: "0.75rem 1rem" }}
              >
                <FileText size={18} color="var(--teal-primary)" />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>Metabolic Panel</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--slate-400)" }}>City Health Labs • Aug 2026 • 1.1 MB</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: FILE SELECTED */}
      {state === "selected" && selectedFile && (
        <div
          className="card animate-fade-in"
          style={{
            padding: "2.5rem 2rem",
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "var(--teal-surface)",
              color: "var(--teal-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              border: "1px solid var(--teal-border)"
            }}
          >
            <FileCheck2 size={28} />
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--teal-primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t("selected_file_label")}
          </div>

          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--teal-900)",
              margin: "0.4rem 0 0.2rem 0"
            }}
          >
            {selectedFile.name}
          </h3>

          <div style={{ fontSize: "0.85rem", color: "var(--slate-500)", marginBottom: "1.75rem" }}>
            {selectedFile.size} • Ready for analysis
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "0.85rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              {t("btn_change_file")}
            </button>

            <button
              type="button"
              onClick={startAnalysisFlow}
              className="btn-primary"
            >
              <Sparkles size={16} />
              <span>{t("btn_start_analysis")}</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: UPLOADING */}
      {state === "uploading" && (
        <div
          className="card animate-fade-in"
          style={{
            padding: "3rem 2rem",
            textAlign: "center"
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              backgroundColor: "var(--teal-surface)",
              color: "var(--teal-primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem"
            }}
            className="pulse-glow"
          >
            <UploadCloud size={26} />
          </div>

          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--teal-900)", marginBottom: "0.5rem" }}>
            {t("uploading_title")}
          </h3>

          <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", marginBottom: "1.5rem" }}>
            {selectedFile?.name}
          </p>

          {/* Progress Bar */}
          <div
            style={{
              maxWidth: "380px",
              margin: "0 auto 0.75rem auto",
              height: "8px",
              backgroundColor: "var(--slate-150)",
              borderRadius: "4px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: "var(--teal-primary)",
                borderRadius: "4px",
                transition: "width 0.4s ease"
              }}
            />
          </div>

          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--teal-primary)" }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {/* STATE 4: ANALYZING REPORT */}
      {state === "analyzing" && (
        <div
          className="card animate-fade-in"
          style={{
            padding: "2.5rem 2rem"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                backgroundColor: "var(--teal-surface)",
                color: "var(--teal-primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.75rem",
                border: "1px solid var(--teal-border)"
              }}
            >
              <Sparkles size={24} className="pulse-glow" />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--teal-900)" }}>
              {t("analyzing_title")}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--slate-500)", marginTop: "0.25rem" }}>
              Simulating patient-friendly extraction & reference check
            </p>
          </div>

          {/* Step-by-Step Animated Indicators */}
          <div style={{ maxWidth: "460px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {/* Step 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: analysisStep >= 1 ? "var(--teal-surface)" : "var(--slate-50)",
                border: `1px solid ${analysisStep >= 1 ? "var(--teal-border)" : "var(--slate-200)"}`,
                transition: "all 0.3s ease"
              }}
            >
              {analysisStep > 1 ? (
                <CheckCircle2 size={18} color="var(--teal-primary)" />
              ) : (
                <RefreshCw size={18} color="var(--teal-primary)" className="pulse-glow" />
              )}
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-800)" }}>
                {t("step_ocr")}
              </span>
            </div>

            {/* Step 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: analysisStep >= 2 ? "var(--teal-surface)" : "var(--slate-50)",
                border: `1px solid ${analysisStep >= 2 ? "var(--teal-border)" : "var(--slate-200)"}`,
                opacity: analysisStep >= 2 ? 1 : 0.6,
                transition: "all 0.3s ease"
              }}
            >
              {analysisStep > 2 ? (
                <CheckCircle2 size={18} color="var(--teal-primary)" />
              ) : analysisStep === 2 ? (
                <RefreshCw size={18} color="var(--teal-primary)" className="pulse-glow" />
              ) : (
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--slate-300)" }} />
              )}
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-800)" }}>
                {t("step_ranges")}
              </span>
            </div>

            {/* Step 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: analysisStep >= 3 ? "var(--teal-surface)" : "var(--slate-50)",
                border: `1px solid ${analysisStep >= 3 ? "var(--teal-border)" : "var(--slate-200)"}`,
                opacity: analysisStep >= 3 ? 1 : 0.6,
                transition: "all 0.3s ease"
              }}
            >
              {analysisStep === 3 ? (
                <RefreshCw size={18} color="var(--teal-primary)" className="pulse-glow" />
              ) : (
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid var(--slate-300)" }} />
              )}
              <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--slate-800)" }}>
                {t("step_translating")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 5: ANALYSIS READY */}
      {state === "ready" && (
        <div
          className="card animate-fade-in"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            backgroundColor: "#ffffff",
            border: "1.5px solid var(--teal-border)"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--status-normal-bg)",
              color: "var(--status-normal-text)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              border: "1px solid var(--status-normal-border)"
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--teal-900)", marginBottom: "0.4rem" }}>
            {t("ready_title")}
          </h3>

          <p style={{ fontSize: "0.92rem", color: "var(--slate-600)", maxWidth: "440px", margin: "0 auto 1.75rem auto" }}>
            {t("ready_sub")}
          </p>

          <button
            type="button"
            onClick={handleViewReport}
            className="btn-primary"
            style={{ padding: "0.75rem 1.75rem", fontSize: "1rem" }}
          >
            <span>{t("btn_view_report_now")}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Subtle Privacy Reassurance Notice */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1.5rem",
          fontSize: "0.8rem",
          color: "var(--slate-500)",
          textAlign: "center"
        }}
      >
        <Lock size={13} color="var(--teal-primary)" />
        <span>{t("privacy_reassurance")}</span>
      </div>
    </div>
  );
}

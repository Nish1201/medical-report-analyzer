# HealthLens — Frontend Application

> **Tagline:** *"Understand your health reports, clearly."*

HealthLens is a polished, patient-facing healthcare application designed to transform complex lab tests and medical reports into calm, clear, trustworthy insights.

---

## 🚀 How to Run Locally

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start the Vite development server
npm run dev

# Open http://localhost:5173/ in your browser
```

To create a production build:
```bash
npm run build
npm run preview
```

---

## 📁 Architecture & Key Folders

```
frontend/
├── src/
│   ├── assets/                # Static brand assets
│   ├── context/
│   │   ├── LanguageContext.jsx # English / हिंदी dynamic translation provider
│   │   └── ReportContext.jsx   # Active report, trends selection & page routing
│   ├── data/
│   │   ├── mockReports.js     # Patient reports conforming to backend contract
│   │   ├── mockTrends.js      # Historical test series (Hemoglobin, Glucose, etc.)
│   │   ├── mockProfile.js     # Patient profile data (Ananya Sharma)
│   │   └── translations.js    # Bilingual dictionary (EN & HI)
│   ├── services/
│   │   └── reportService.js   # ⚡ API ABSTRACTION LAYER (Replace with real endpoints)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx         # Sticky header with lang toggle & patient profile
│   │   │   ├── Sidebar.jsx        # Navigation shell with HealthLens branding
│   │   │   ├── StatusBadge.jsx    # Restrained non-alarmist status badges
│   │   │   ├── DisclaimerBanner.jsx # Medical informational reassurance
│   │   │   └── LanguageToggle.jsx # Pill switch for English / हिंदी
│   │   ├── report/
│   │   │   ├── ReferenceRangeVisual.jsx # Horizontal range visual with marker
│   │   │   ├── TestResultCard.jsx       # Result card with "In Simple Words" box
│   │   │   ├── ReportOverviewCard.jsx   # Calm summary & breakdown pills
│   │   │   ├── RelatedFindingsCard.jsx  # Red blood cell cluster insights
│   │   │   └── DoctorQuestionsCard.jsx  # Doctor questions with copy & print
│   │   └── upload/
│   │       └── UploadZone.jsx           # 5-state drag & drop / demo simulator
│   ├── pages/
│   │   ├── DashboardPage.jsx      # Welcoming patient dashboard
│   │   ├── UploadPage.jsx         # Report upload & multi-state analyzer
│   │   ├── ReportAnalysisPage.jsx # 🌟 HERO SCREEN: redesigned digital report
│   │   ├── TrendsPage.jsx         # Longitudinal line charts & interpretations
│   │   ├── MyReportsPage.jsx      # Chronological archive with search/filter
│   │   └── ProfilePage.jsx        # Patient health profile & allergies
│   ├── index.css                  # Custom healthcare design system & tokens
│   ├── App.css                    # Responsive drawer & print media styles
│   ├── App.jsx                    # Root layout & view router
│   └── main.jsx                   # Entry point
```

---

## 🤝 For Backend / API / OCR Teammates

All components interact **exclusively** with `src/services/reportService.js`. When your FastAPI / Express / Flask endpoints are live:

1. Open [`src/services/reportService.js`](file:///c:/Users/Nishigandha/OneDrive/Desktop/medical-report-analyzer/frontend/src/services/reportService.js).
2. Replace mock return promises with real HTTP requests:
   - `getAllReports()` -> `fetch('/api/v1/reports')`
   - `getReportById(id)` -> `fetch('/api/v1/reports/' + id)`
   - `uploadAndAnalyzeReport(file)` -> `fetch('/api/v1/reports/upload', { method: 'POST', body: formData })`
   - `getTrendData(testId)` -> `fetch('/api/v1/trends?test=' + testId)`
3. Ensure the backend returns objects matching the documented schema in `src/data/mockReports.js`:
   - `report_type`, `report_date`, `overall_summary`
   - `tests`: `[ { test_name, value, unit, reference_low, reference_high, status, medical_explanation, simple_explanation } ]`
   - `related_findings`: `{ title, tags, description, action_text }`
   - `doctor_questions`: `[ { id, question, context } ]`

---

## 🌟 Demo Walkthrough Flow for Judges

1. **Dashboard** (`/`)
   - Welcoming greeting for Ananya Sharma
   - Prominent **Upload New Report** CTA
   - Recent Report card (Complete Blood Count) with calm summary
   - Recent Results snapshot (Hemoglobin, Fasting Glucose, Creatinine)
   - Health Trends preview
2. **Upload Report**
   - Drag & drop zone or one-click demo sample (`Complete Blood Count - Oct 2026`)
   - Click **Start Analysis** to view the live animated 5-step simulation
   - Click **View Report Analysis**
3. **Report Analysis (Hero Screen)**
   - Calm **Report Overview** card & test breakdown (4 Within Range, 1 Above Range, 1 Needs Attention)
   - Visual result cards with **Horizontal Reference Range** tracks and patient pin markers
   - Prominent **IN SIMPLE WORDS** box explaining results clearly without alarm
   - **Related Findings** cluster card for red blood cell parameters
   - **Questions to Ask Your Doctor** with copy to clipboard and print support
   - Click **View Trend →** on Hemoglobin to jump directly to Trends
4. **Trends**
   - Interactive line chart for Hemoglobin over June, August, and October 2026
   - Test parameter tabs (Hemoglobin, Fasting Glucose, Creatinine, Platelet Count)
   - Shaded reference area and plain-language non-diagnostic interpretation
5. **English / हिंदी Localization**
   - Click **हिंदी** in the header at any time: the entire interface, summaries, "सरल शब्दों में", and doctor questions switch dynamically.
6. **My Reports & Profile**
   - Chronological archive with search
   - Patient profile with documented Penicillin allergy and emergency contacts

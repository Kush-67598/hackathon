import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SymptomCheckinPage } from "./pages/SymptomCheckinPage";
import { LabUploadPage } from "./pages/LabUploadPage";
import { TimelinePage } from "./pages/TimelinePage";
import { LandingPage } from "./pages/LandingPage";
import { ResultDashboardPage } from "./pages/ResultDashboardPage";
import { ReportViewPage } from "./pages/ReportViewPage";
import { NearbyDoctorsPage } from "./pages/NearbyDoctorsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HealthChatbot } from "./components/HealthChatbot";

function App() {
  return (
    <>
      <AppShell>
        <Routes>
          {/* public auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* App routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/checkin" element={<SymptomCheckinPage />} />
          <Route path="/labs/upload" element={<LabUploadPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/timeline/:userId" element={<TimelinePage />} />
          <Route path="/results/:sessionId" element={<ResultDashboardPage />} />
          <Route path="/report/:sessionId" element={<ReportViewPage />} />
          <Route path="/doctors" element={<NearbyDoctorsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/signup" replace />} />
        </Routes>
      </AppShell>

      {/* Global chatbot — visible on all pages */}
      <HealthChatbot />
    </>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RaiseIssuePage from "./pages/RaiseIssuePage";
import IssueDetailPage from "./pages/IssueDetailPage";
import MyIssuesPage from "./pages/MyIssuesPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SchemeFeedbackPage from "./pages/SchemeFeedbackPage";
import PFIPage from "./pages/PFIPage";
import AboutPage from "./pages/AboutPage";
import DistrictComparePage from "./pages/DistrictComparePage";
import AdminDashboard from "./pages/AdminDashboard";
import WeeklyReportsPage from "./pages/WeeklyReportsPage";

// Components
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import MakkalKuralAI from "./components/MakkalKuralAI";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/issues/:issueId" element={<IssueDetailPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/:district" element={<DashboardPage />} />
                <Route path="/pfi" element={<PFIPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/compare" element={<DistrictComparePage />} />
                <Route path="/reports" element={<WeeklyReportsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Protected Routes */}
                <Route path="/raise-issue" element={
                  <ProtectedRoute>
                    <RaiseIssuePage />
                  </ProtectedRoute>
                } />
                <Route path="/my-issues" element={
                  <ProtectedRoute>
                    <MyIssuesPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/schemes" element={
                  <ProtectedRoute>
                    <SchemeFeedbackPage />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Toaster position="top-center" richColors />
            <MakkalKuralAI />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { ExploreChallenges } from './pages/public/ExploreChallenges';
import { ChallengeDetails } from './pages/public/ChallengeDetails';
import { PublicMap } from './pages/public/PublicMap';
import { AnalyticsOverview } from './pages/public/AnalyticsOverview';
import { Login } from './pages/public/Login';
import { Register } from './pages/public/Register';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { ReportChallenge } from './pages/citizen/ReportChallenge';
import { MyChallenges } from './pages/citizen/MyChallenges';

// University Pages
import { UniversityDashboard } from './pages/university/UniversityDashboard';
import { ProjectWorkspace } from './pages/university/ProjectWorkspace';

// Industry Pages
import { IndustryDashboard } from './pages/industry/IndustryDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { VerificationQueue } from './pages/admin/VerificationQueue';
import { InstitutionsManager } from './pages/admin/InstitutionsManager';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="text-center py-16 text-xs text-slate-500">Checking credentials...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Manager
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Determine if current route should have dashboard sidebar
  const isDashboardRoute =
    location.pathname.startsWith('/citizen') ||
    location.pathname.startsWith('/university') ||
    location.pathname.startsWith('/industry') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/projects');

  const showSidebar = isAuthenticated && isDashboardRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Main Top Header */}
      <Navbar />

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 overflow-y-auto ${showSidebar ? 'p-6' : ''}`}>
          {children}
        </main>
      </div>

      {/* Simple Gov Footer */}
      {!showSidebar && (
        <footer className="bg-gov-950 text-slate-400 text-xs py-8 border-t border-gov-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-semibold text-slate-200">
                SamadhanSetu • State Civic Problem-Solving Platform
              </p>
              <p className="text-[11px] text-slate-400">
                A digital platform crowdsourcing societal challenges with university & industry collaborative solutions.
              </p>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <span>Dept. of Higher Education & IT, Govt. of Jharkhand</span>
              <span>•</span>
              <span>OpenStreetMap / Leaflet</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExploreChallenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetails />} />
            <Route path="/map" element={<PublicMap />} />
            <Route path="/analytics" element={<AnalyticsOverview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Routes */}
            <Route
              path="/citizen/dashboard"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/report"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'student', 'university', 'industry', 'admin']}>
                  <ReportChallenge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/my-challenges"
              element={
                <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                  <MyChallenges />
                </ProtectedRoute>
              }
            />

            {/* University & Student Routes */}
            <Route
              path="/university/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student', 'university', 'admin']}>
                  <UniversityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/university/projects"
              element={
                <ProtectedRoute allowedRoles={['student', 'university', 'admin']}>
                  <UniversityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'university', 'industry', 'admin']}>
                  <ProjectWorkspace />
                </ProtectedRoute>
              }
            />

            {/* Industry Routes */}
            <Route
              path="/industry/dashboard"
              element={
                <ProtectedRoute allowedRoles={['industry', 'admin']}>
                  <IndustryDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/industry/partnerships"
              element={
                <ProtectedRoute allowedRoles={['industry', 'admin']}>
                  <IndustryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verification"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VerificationQueue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/institutions"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InstitutionsManager />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader } from 'lucide-react';

// Lazy load pages for better performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Subjects = lazy(() => import('./pages/Subjects').then(module => ({ default: module.Subjects })));
const UsersPage = lazy(() => import('./pages/Users').then(module => ({ default: module.UsersPage })));
const ContentPage = lazy(() => import('./pages/Content').then(module => ({ default: module.ContentPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsPage })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ReelsPage = lazy(() => import('./pages/Reels').then(module => ({ default: module.ReelsPage })));
const ChallengesPage = lazy(() => import('./pages/Challenges').then(module => ({ default: module.ChallengesPage })));
const AnalyticsPage = lazy(() => import('./pages/Analytics').then(module => ({ default: module.AnalyticsPage })));
const LearningPaths = lazy(() => import('./pages/LearningPaths').then(module => ({ default: module.LearningPaths })));

// Auth Guard Component
function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-primary" /></div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-[#F5F7FA]">
              <Loader className="animate-spin text-primary" size={32} />
            </div>
          }>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route path="/" element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }>
                <Route index element={<Dashboard />} />
                <Route path="categories" element={<ContentPage />} /> {/* Reusing Content for Categories */}
                <Route path="reels" element={<ReelsPage />} />
                <Route path="learning-paths" element={<LearningPaths />} />
                <Route path="challenges" element={<ChallengesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;

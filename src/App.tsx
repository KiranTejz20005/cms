import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader } from 'lucide-react';

// Lazy load pages for better performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const CategoriesPage = lazy(() => import('./pages/Categories').then(module => ({ default: module.CategoriesPage })));
const ItemsPage = lazy(() => import('./pages/Items').then(module => ({ default: module.ItemsPage })));
const UsersPage = lazy(() => import('./pages/Users').then(module => ({ default: module.UsersPage })));
const SettingsPage = lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsPage })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ChallengesPage = lazy(() => import('./pages/Challenges').then(module => ({ default: module.ChallengesPage })));
const AnalyticsPage = lazy(() => import('./pages/Analytics').then(module => ({ default: module.AnalyticsPage })));
const LearningPaths = lazy(() => import('./pages/LearningPaths').then(module => ({ default: module.LearningPaths })));
const ByteSizedLearning = lazy(() => import('./pages/ByteSizedLearning').then(module => ({ default: module.ByteSizedLearning })));
const WorkshopsPage = lazy(() => import('./pages/Workshops').then(module => ({ default: module.WorkshopsPage })));

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
                <Route path="byte-sized-learning" element={<ByteSizedLearning />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="items" element={<ItemsPage />} />
                <Route path="learning-paths" element={<LearningPaths />} />
                <Route path="challenges" element={<ChallengesPage />} />
                <Route path="workshops" element={<WorkshopsPage />} />
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

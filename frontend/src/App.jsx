import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Parkings from './pages/Parkings';
import CarEntries from './pages/CarEntries';
import { OutgoingReport, EnteredReport } from './pages/Reports';
import Users from './pages/Users';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

// ── Guards ────────────────────────────────────────────────────────────────────
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const Loader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', flexDirection: 'column', gap: 16,
  }}>
    <div style={{
      width: 44, height: 44,
      border: '3px solid #e5e7eb',
      borderTopColor: '#4f46e5',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
  </div>
);

// ── Routes ────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"    element={<PublicOnly><Login /></PublicOnly>} />
    <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

    {/* Protected — inside sidebar layout */}
    <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
      <Route path="/dashboard"        element={<Dashboard />} />
      <Route path="/parkings"         element={<Parkings />} />
      <Route path="/car-entries"      element={<CarEntries />} />
      <Route path="/reports/outgoing" element={<RequireAdmin><OutgoingReport /></RequireAdmin>} />
      <Route path="/reports/entered"  element={<RequireAdmin><EnteredReport /></RequireAdmin>} />
      <Route path="/users"            element={<RequireAdmin><Users /></RequireAdmin>} />
    </Route>

    {/* Fallback */}
    <Route path="/"   element={<Navigate to="/dashboard" replace />} />
    <Route path="*"   element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

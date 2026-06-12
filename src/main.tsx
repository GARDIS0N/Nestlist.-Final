import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from './AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from './Login';
import { SignUp } from './SignUp';
import App from './App';
import './index.css';

const CLERK_PUBLISHABLE_KEY = "pk_test_YmFsYW5jZWQtZWxmLTU5LmNsZXJrLmFjY291bnRzLmRldiQ";

// Helper component to redirect authenticated users based on their custom profiles
const HomeRedirect = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#F8F9FA',
        color: '#2D3142'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(30, 70, 32, 0.1)',
          borderTop: '3px solid #1E4620',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === 'landlord' || profile?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/browse" replace />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />

            {/* Protected Application Routes */}
            <Route 
              path="/browse" 
              element={
                <ProtectedRoute allowedRole="tenant">
                  <App defaultView="browse" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRole="landlord">
                  <App defaultView="dashboard" />
                </ProtectedRoute>
              } 
            />

            {/* Fallbacks & Redirects */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ClerkProvider>
  </StrictMode>,
);

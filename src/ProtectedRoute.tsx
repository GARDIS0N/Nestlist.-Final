import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'landlord' | 'tenant' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  // Show a beautifully aligned, minimalist loading indicator during session restore
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
        <p style={{ marginTop: '16px', fontSize: '14px', fontWeight: 500, color: '#6C757D' }}>
          Verifying secure environment...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 1. Unauthenticated users redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Route role authorizations
  if (allowedRole && profile && profile.role !== allowedRole) {
    if (profile.role === 'admin') {
      return <>{children}</>;
    }
    // If landlord role is required but profile is tenant, bounce to /browse
    if (allowedRole === 'landlord' && profile.role === 'tenant') {
      return <Navigate to="/browse" replace />;
    }
    // If tenant role is required but profile is landlord, bounce to /dashboard
    if (allowedRole === 'tenant' && profile.role === 'landlord') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

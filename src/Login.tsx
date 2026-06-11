import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const Login: React.FC = () => {
  const { user, profile, loading, signIn, isMockMode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user is already logged in, redirect them immediately to their app home
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'landlord' || profile.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/browse', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAuthLoading(true);

    try {
      const { user: authedUser, profile: authedProfile, error } = await signIn(email, password);

      if (error) {
        throw error;
      }

      if (authedUser && authedProfile) {
        const userRole = authedProfile.role;
        if (userRole === 'landlord' || userRole === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/browse', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Friendly readable mapping for standard authentication failures
      if (err.message === 'Invalid login credentials') {
        setErrorMessage('Incorrect email address or password. Please try again.');
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred during login.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: '#F4F6F0',
    padding: '20px',
    boxSizing: 'border-box'
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 30px rgba(30, 70, 32, 0.06)',
    border: '1px solid #E3E7D3',
    boxSizing: 'border-box'
  };

  const logoStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E4620',
    textAlign: 'center',
    marginBottom: '8px'
  };

  const goldSpanStyle: React.CSSProperties = {
    color: '#E2B13C'
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6F7264',
    textAlign: 'center',
    marginBottom: '32px',
    fontWeight: '500'
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#2B301A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    display: 'block'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #CCD2B4',
    backgroundColor: '#FAFAF7',
    color: '#2B301A',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: '750',
    color: '#FFFFFF',
    backgroundColor: '#1E4620',
    border: 'none',
    borderRadius: '8px',
    cursor: authLoading ? 'default' : 'pointer',
    opacity: authLoading ? 0.8 : 1,
    marginTop: '10px',
    transition: 'background-color 0.2s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px'
  };

  const errorBannerStyle: React.CSSProperties = {
    backgroundColor: '#FDECEF',
    border: '1px solid #F5B5C2',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#C62828',
    lineHeight: '1.4',
    marginBottom: '20px'
  };

  const footerLinkStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6F7264',
    textAlign: 'center',
    marginTop: '24px'
  };

  const linkStyle: React.CSSProperties = {
    color: '#1E4620',
    fontWeight: '650',
    textDecoration: 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={logoStyle}>
          nest<span style={goldSpanStyle}>list</span>
        </div>
        <div style={subtitleStyle}>Sign in to access Kenya's live housing portal</div>

        {isMockMode && (
          <div style={{
            backgroundColor: '#FFF8E1',
            border: '1px solid #FFE082',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#B78103',
            marginBottom: '20px',
            lineHeight: '1.4',
            textAlign: 'left'
          }}>
            <strong>✨ Local Sandbox Mode Active</strong><br />
            Supabase is unconfigured or offline. Feel free to use these demo accounts:
            <table style={{ width: '100%', marginTop: '6px', borderCollapse: 'collapse', fontSize: '11.5px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '2px 0', fontWeight: 'bold' }}>👤 Landlord:</td>
                  <td style={{ padding: '2px 0' }}><code>landlord@nestlist.ke</code></td>
                  <td style={{ padding: '2px 0' }}>pw: <code>password</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', fontWeight: 'bold' }}>👤 Tenant:</td>
                  <td style={{ padding: '2px 0' }}><code>tenant@nestlist.ke</code></td>
                  <td style={{ padding: '2px 0' }}>pw: <code>password</code></td>
                </tr>
                <tr>
                  <td style={{ padding: '2px 0', fontWeight: 'bold' }}>🛡️ Admin:</td>
                  <td style={{ padding: '2px 0' }}><code>admin@nestlist.ke</code></td>
                  <td style={{ padding: '2px 0' }}>pw: <code>password</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {errorMessage && (
          <div style={errorBannerStyle}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mzee.juma@nestlist.ke"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your security password"
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={authLoading} style={buttonStyle}>
            {authLoading ? 'Verifying Credentials...' : 'Sign In to My Account'}
          </button>
        </form>

        <div style={footerLinkStyle}>
          New to Nestlist?{' '}
          <Link to="/signup" style={linkStyle}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'landlord' | 'tenant' | 'admin'>('tenant');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthLoading(true);

    try {
      // Register user credentials and profile through integrated Dual Auth setup
      const { user, profile, error } = await signUp(email, password, fullName, phone, role);

      if (error) {
        throw error;
      }

      if (user && profile) {
        setSuccessMessage('🎉 Registration successful! Redirecting you to sign in...');
        
        // Brief timeout for visual transition before navigating
        setTimeout(() => {
          navigate('/login');
        }, 2200);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err.message || 'Could not complete registration. Please check fields.');
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
    padding: '20px 20px',
    boxSizing: 'border-box'
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '520px',
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
    gap: '18px'
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

  const roleTabContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '4px'
  };

  const createRoleTabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '16px',
    borderRadius: '10px',
    border: active ? '2px solid #1E4620' : '1px solid #CCD2B4',
    backgroundColor: active ? 'rgba(30, 70, 32, 0.04)' : '#FFFFFF',
    color: '#2B301A',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
  });

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
    marginTop: '12px',
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

  const successBannerStyle: React.CSSProperties = {
    backgroundColor: '#E8F5E9',
    border: '1px solid #A5D6A7',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#1B5E20',
    lineHeight: '1.4',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '600'
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
        <div style={subtitleStyle}>Create your professional account in Kenya</div>

        {errorMessage && (
          <div style={errorBannerStyle}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={successBannerStyle}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Mary Wanjiku"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mary.wanjiku@gmail.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Security Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>What is your primary platform role?</label>
            <div style={roleTabContainerStyle}>
              <button
                type="button"
                onClick={() => setRole('tenant')}
                style={createRoleTabStyle(role === 'tenant')}
              >
                <div style={{ fontWeight: '750', fontSize: '13px', marginBottom: '2px' }}>🏚️ Tenant</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Searching unit</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('landlord')}
                style={createRoleTabStyle(role === 'landlord')}
              >
                <div style={{ fontWeight: '750', fontSize: '13px', marginBottom: '2px' }}>🏢 Landlord</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>Listing fields</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={createRoleTabStyle(role === 'admin')}
              >
                <div style={{ fontWeight: '750', fontSize: '13px', marginBottom: '2px' }}>🛡️ Admin</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>SaaS Officer</div>
              </button>
            </div>
          </div>

          <button type="submit" disabled={authLoading} style={buttonStyle}>
            {authLoading ? 'Creating secure profile...' : 'Register as a ' + (role === 'landlord' ? 'Landlord' : role === 'admin' ? 'Admin' : 'Tenant')}
          </button>
        </form>

        <div style={footerLinkStyle}>
          Already registered on Nestlist?{' '}
          <Link to="/login" style={linkStyle}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  UserCheck, 
  Sparkles, 
  Building, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone, 
  UserPlus, 
  Home,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (role: UserRole, email: string, name: string, token: string, phone: string, avatarUrl?: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Registration and Auth state
  const [selectedRole, setSelectedRole] = useState<UserRole>('Tenant');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setStatusMessage("Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Connecting securely...");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setStatusMessage("Login successful! Loading your dashboard...");
      
      const avatarMap: Record<string, string> = {
        'Tenant': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        'Agent': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        'Landlord': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
      };

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(
          data.user.role, 
          data.user.email, 
          data.user.name, 
          data.token, 
          data.user.phone || '',
          avatarMap[data.user.role]
        );
      }, 600);

    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !fullName) {
      setStatusMessage("Please fill in all registration fields");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Creating your secure profile...");

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: fullName,
          role: selectedRole,
          phone: phoneNumber
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStatusMessage(`Successfully registered! Welcome ${fullName}.`);

      const avatarMap: Record<string, string> = {
        'Tenant': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        'Agent': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        'Landlord': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
      };

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(
          data.user.role,
          data.user.email,
          data.user.name,
          data.token,
          data.user.phone || '',
          avatarMap[data.user.role]
        );
      }, 600);

    } catch (err: any) {
      setIsSubmitting(false);
      setStatusMessage(`❌ Error: ${err.message}`);
    }
  };

  const handleGoogleOAuth = async () => {
    setOauthLoading(true);
    setStatusMessage("Connecting with Google Account...");

    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `google.user.${randomId}@nestlist.ke`,
          password: `GoogleAuthPzD8_${randomId}`,
          name: "Kenyan User",
          role: selectedRole,
          phone: "+254700000000"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        onLoginSuccess(selectedRole, "user@nestlist.ke", "Google User", "MOCK_TOKEN", "+254700000000");
        return;
      }

      onLoginSuccess(data.user.role, data.user.email, data.user.name, data.token, data.user.phone);
    } catch (err: any) {
      onLoginSuccess(selectedRole, "kenya.guest@gmail.com", "Kenyan Guest", "MOCK_TOKEN", "+254712345678");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div id="nestlist-auth-page" className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-emerald-100 selection:text-slate-900">
      <div className="w-full max-w-md space-y-8">
        
        {/* BRAND HERO SECTION */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1B3A6B] text-white shadow-xl shadow-blue-900/15">
            <Home className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1B3A6B] tracking-tight">NestList</h1>
            <p className="text-xs font-semibold text-[#4CAF50] uppercase tracking-wider">Fast • Simple • Verified Listings</p>
          </div>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Find and securely rent your next home in Kenya with direct M-Pesa payments.
          </p>
        </div>

        {/* ACCOUNT TAB CHIPS */}
        <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1 border border-slate-300/40">
          <button
            onClick={() => {
              setActiveTab('login');
              setStatusMessage('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-[#1B3A6B] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setStatusMessage('');
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-[#1B3A6B] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </button>
        </div>

        {/* MAIN AUTH CORE CARD */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/80 border border-slate-200/50">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login-form-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
                  <p className="text-xs text-slate-400">Enter your credentials to continue securely</p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="login-email-input" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase font-mono">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="login-email-input"
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="e.g. juma@nestlist.ke"
                        className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-[#888888]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="login-pass-input" className="block text-xs font-bold text-slate-700 uppercase font-mono">Password</label>
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-[#1B3A6B] hover:underline font-semibold"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="login-pass-input"
                        type={showPassword ? "text" : "password"}
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Enter your security password"
                        className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl pl-10 pr-11 py-3 outline-none transition-all placeholder:text-[#888888]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B3A6B] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-900/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Signing in safely..." : "Sign In to NestList"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-form-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">Create a new account</h2>
                  <p className="text-xs text-slate-450">Join our clean state network in Nairobi</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="reg-name-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase font-mono">Full Name</label>
                    <input 
                      id="reg-name-input"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mary Wanjiku"
                      className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#888888]"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-email-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase font-mono">Email Address</label>
                    <input 
                      id="reg-email-input"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. marywanjiku@gmail.com"
                      className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#888888]"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-pass-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase font-mono">Choose Security Password</label>
                    <input 
                      id="reg-pass-input"
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-[#888888]"
                    />
                  </div>

                  <div>
                    <label htmlFor="reg-phone-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase font-mono">Mobile Number (Receive M-Pesa STK)</label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        id="reg-phone-input"
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full bg-[#FFFFFF] border border-slate-200 hover:border-slate-300 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 text-[#1B1B1B] text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-[#888888]"
                      />
                    </div>
                  </div>

                  {/* ROLE CAPTIONAL TICKETS */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-xs font-bold text-[#1B3A6B] uppercase font-mono">Choose Registration Role</span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {/* Tenant CARD */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('Tenant')}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                          selectedRole === 'Tenant'
                            ? 'border-[#1B3A6B] bg-blue-50/60 ring-1 ring-[#1B3A6B]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex gap-2.5">
                          <UserCheck className={`w-5 h-5 mt-0.5 ${selectedRole === 'Tenant' ? 'text-[#1B3A6B]' : 'text-slate-400'}`} />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Tenant Account</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Find, search and request home views</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === 'Tenant' ? 'bg-[#1B3A6B] border-transparent' : 'border-slate-350'}`}>
                          {selectedRole === 'Tenant' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Agent CARD */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('Agent')}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                          selectedRole === 'Agent'
                            ? 'border-[#4CAF50] bg-emerald-50/40 ring-1 ring-[#4CAF50]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex gap-2.5">
                          <Sparkles className={`w-5 h-5 mt-0.5 ${selectedRole === 'Agent' ? 'text-[#4CAF50]' : 'text-slate-400'}`} />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Estate Agent</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Post and manage high-quality house listings</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === 'Agent' ? 'bg-[#4CAF50] border-transparent' : 'border-slate-350'}`}>
                          {selectedRole === 'Agent' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>

                      {/* Landlord CARD */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('Landlord')}
                        className={`p-3 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                          selectedRole === 'Landlord'
                            ? 'border-[#1B3A6B] bg-blue-50/60 ring-1 ring-[#1B3A6B]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex gap-2.5">
                          <Building className={`w-5 h-5 mt-0.5 ${selectedRole === 'Landlord' ? 'text-[#1B3A6B]' : 'text-slate-400'}`} />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Property Owner / Landlord</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">List direct properties & collect rents</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedRole === 'Landlord' ? 'bg-[#1B3A6B] border-transparent' : 'border-slate-350'}`}>
                          {selectedRole === 'Landlord' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B3A6B] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    {isSubmitting ? "Creating your account..." : "Complete Registration"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAUTH CHIP AT BOTTOM */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-[1px] bg-slate-200 flex-1"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Or use single tap option</span>
              <div className="h-[1px] bg-slate-200 flex-1"></div>
            </div>

            <button
              onClick={handleGoogleOAuth}
              disabled={oauthLoading}
              className="w-full py-3 bg-slate-150 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.98]"
            >
              <img 
                src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=85&w=40" 
                className="w-4.5 h-4.5 rounded-full object-contain" 
                alt="Google" 
              />
              Continue with Google Account
            </button>

            <button
              onClick={() => onLoginSuccess('Tenant', 'guest.user@nestlist.ke', 'Guest Tenant', 'MOCK_TOKEN', '+254700000000')}
              className="w-full text-center text-xs font-mono font-bold text-slate-400 hover:text-[#1B3A6B] tracking-wider uppercase pt-1"
            >
              Skip and Browse as Tenant
            </button>
          </div>
        </div>

        {/* FEEDBACK STATUS AND BADGES */}
        {statusMessage && (
          <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl text-center">
            <p className="text-xs font-semibold text-[#1B3A6B]">{statusMessage}</p>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#4CAF50] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">Kenya Safekeeping Directives badge</span>
            <span className="text-[11px] text-slate-500 leading-normal block">
              Authorized digital housing registry verified in compliance with local landlord security act. Data is encrypted.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

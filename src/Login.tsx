import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSignIn } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Home, 
  CheckCircle, 
  Smartphone, 
  Building, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  Building2,
  CalendarCheck,
  Compass,
  CreditCard,
  Send,
  HelpCircle,
  X,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

const mapClerkError = (err: any): string => {
  const errorMsg = err?.message || err?.errors?.[0]?.message || "";
  const errCode = err?.errors?.[0]?.code || "";
  
  if (errCode === "form_password_incorrect" || errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("incorrect")) {
    return "Incorrect password. Please try again.";
  }
  if (errCode === "form_identifier_not_found" || errorMsg.toLowerCase().includes("no account found") || errorMsg.toLowerCase().includes("not found")) {
    return "No account found with this email.";
  }
  if (errCode === "form_identifier_exists" || errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("taken")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (errCode === "verification_failed" || errorMsg.toLowerCase().includes("incorrect code") || errorMsg.toLowerCase().includes("invalid code")) {
    return "Incorrect code. Please check your email and try again.";
  }
  if (errorMsg.toLowerCase().includes("expired") || errCode.includes("expired")) {
    return "Code has expired. Click resend to get a new one.";
  }
  return errorMsg || "An error occurred. Please try again.";
};

export const Login: React.FC = () => {
  const { user, profile, loading, signIn: contextSignIn } = useAuth();
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  // Primary Views inside the Login container: "login", "forgot", "verification", "reset-password", "mfa"
  const [activeView, setActiveView] = useState<'login' | 'forgot' | 'verification' | 'reset-password' | 'mfa'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset password states
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // MFA / Double-Factor verification states
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<string>('email_code');

  // Focus refs
  const emailInputRef = useRef<HTMLInputElement>(null);
  const forgotInputRef = useRef<HTMLInputElement>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Auto-focus email field on load
  useEffect(() => {
    if (activeView === 'login' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (activeView === 'forgot' && forgotInputRef.current) {
      forgotInputRef.current.focus();
    }
  }, [activeView]);

  // Load remembered email
  useEffect(() => {
    const rememberedMail = localStorage.getItem('nestlist_remembered_email');
    if (rememberedMail) {
      setEmail(rememberedMail);
      setRememberMe(true);
    }
  }, []);

  // Redirect users already authenticated
  useEffect(() => {
    if (!loading && user && profile) {
      triggerToast(`Welcome back, ${profile.full_name || 'User'}!`, 'success');
      if (profile.role === 'landlord' || profile.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/browse', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please type your security password.");
      return;
    }

    setAuthLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isDemoDomain = cleanEmail.endsWith("@nestlist.ke") || cleanEmail.endsWith("@nestlist.com");

      if (isDemoDomain) {
        // Direct local login for demo/testing accounts under the hood
        const res = await contextSignIn(cleanEmail, password);
        if (res.error) {
          throw res.error;
        }

        if (rememberMe) {
          localStorage.setItem('nestlist_remembered_email', email);
          localStorage.setItem('nestlist_remember_me', 'true');
        } else {
          localStorage.removeItem('nestlist_remembered_email');
          localStorage.setItem('nestlist_remember_me', 'false');
        }

        triggerToast("Welcome back (Demo Account)!", "success");
        // Navigation is handled automatically by the redirect effect waiting on user/profile,
        // or we can redirect immediately
        const targetRole = res.profile?.role || "tenant";
        if (targetRole === "landlord" || targetRole === "admin") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/browse", { replace: true });
        }
        return;
      }

      if (!isSignInLoaded || !signIn) {
        throw new Error("Clerk authentication is loading. Please reload the page.");
      }

      // Initiate login
      const result = await signIn.create({
        identifier: cleanEmail,
        password: password,
      });

      if (result.status === "complete") {
        if (rememberMe) {
          localStorage.setItem('nestlist_remembered_email', email);
          localStorage.setItem('nestlist_remember_me', 'true');
        } else {
          localStorage.removeItem('nestlist_remembered_email');
          localStorage.setItem('nestlist_remember_me', 'false');
        }

        await setActive({ session: result.createdSessionId });
        triggerToast("Welcome back!", "success");
        navigate("/dashboard", { replace: true });
      } else if (result.status === "needs_second_factor") {
        const targetFactor = result.supportedSecondFactors?.find(
          (f: any) => f.strategy === "phone_code" || f.strategy === "email_code"
        );
        if (targetFactor) {
          triggerToast("Preparing dual-factor security code...", "info");
          await signIn.prepareSecondFactor({ strategy: targetFactor.strategy as any });
          setMfaStrategy(targetFactor.strategy);
        } else {
          const firstFactor = result.supportedSecondFactors?.[0];
          if (firstFactor) {
            setMfaStrategy(firstFactor.strategy);
          }
        }
        setActiveView('mfa');
        triggerToast("Multi-Factor verification required.", "info");
      } else {
        // Confirm Factor if needed
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: "password",
          password: password,
        });

        if (completeSignIn.status === "complete") {
          if (rememberMe) {
            localStorage.setItem('nestlist_remembered_email', email);
            localStorage.setItem('nestlist_remember_me', 'true');
          } else {
            localStorage.removeItem('nestlist_remembered_email');
            localStorage.setItem('nestlist_remember_me', 'false');
          }

          await setActive({ session: completeSignIn.createdSessionId });
          triggerToast("Welcome back!", "success");
          navigate("/dashboard", { replace: true });
        } else if (completeSignIn.status === "needs_second_factor") {
          const targetFactor = completeSignIn.supportedSecondFactors?.find(
            (f: any) => f.strategy === "phone_code" || f.strategy === "email_code"
          );
          if (targetFactor) {
            triggerToast("Preparing dual-factor security code...", "info");
            await signIn.prepareSecondFactor({ strategy: targetFactor.strategy as any });
            setMfaStrategy(targetFactor.strategy);
          } else {
            const firstFactor = completeSignIn.supportedSecondFactors?.[0];
            if (firstFactor) {
              setMfaStrategy(firstFactor.strategy);
            }
          }
          setActiveView('mfa');
          triggerToast("Multi-Factor verification code sent. Please check your phone/email.", "info");
        } else {
          throw new Error("Login status incomplete. Secondary factors required.");
        }
      }
    } catch (err: any) {
      console.error('Login request failed:', err);
      setErrorMessage(mapClerkError(err));
      triggerToast('Authentication failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider.toLowerCase() === 'google') {
      try {
        setAuthLoading(true);
        triggerToast(`Connecting to your Google Account safely...`, 'info');
        
        // Let's set a default role in pending store just in case they sign in as new google user
        localStorage.setItem("nestlist_oauth_pending_role", "tenant");
        localStorage.setItem("nestlist_remember_me", rememberMe ? "true" : "false");

        await signIn?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } catch (err: any) {
        console.error("Google Sign-In failed:", err);
        setErrorMessage(mapClerkError(err));
        triggerToast("Google OAuth failed", "error");
        setAuthLoading(false);
      }
    } else {
      triggerToast(`${provider} social authentication is only supported through Google integration currently.`, 'info');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage('Please enter your email address to recover your key.');
      return;
    }
    setErrorMessage(null);
    setForgotLoading(true);

    try {
      if (!signIn) throw new Error("Authentication module is not loaded.");

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: forgotEmail,
      });

      setActiveView('reset-password');
      triggerToast('Verification instructions have been dispatched to your email.', 'success');
    } catch (err: any) {
      console.error("Forgot password failure:", err);
      setErrorMessage(mapClerkError(err));
      triggerToast('Dispatch failed', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetCode) {
      setErrorMessage("Please enter the verification code sent to your email.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setResetLoading(true);

    try {
      if (!signIn) throw new Error("Authentication module is not loaded.");

      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
        password: newPassword,
      });

      if (completeSignIn.status === "complete") {
        if (rememberMe) {
          localStorage.setItem('nestlist_remember_me', 'true');
        } else {
          localStorage.setItem('nestlist_remember_me', 'false');
        }

        await setActive({ session: completeSignIn.createdSessionId });
        triggerToast("Password reset successfully!", "success");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Secondary factors or parameters requested.");
      }
    } catch (err: any) {
      console.error("Password reset failure:", err);
      setErrorMessage(mapClerkError(err));
      triggerToast("Update rejected", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode) {
      setErrorMessage("Please enter your verification code.");
      return;
    }
    setErrorMessage(null);
    setMfaLoading(true);

    try {
      if (!signIn) throw new Error("Authentication module is not loaded.");

      const completeMFA = await signIn.attemptSecondFactor({
        strategy: mfaStrategy as any,
        code: mfaCode,
      });

      if (completeMFA.status === "complete") {
        if (rememberMe) {
          localStorage.setItem('nestlist_remembered_email', email);
          localStorage.setItem('nestlist_remember_me', 'true');
        } else {
          localStorage.removeItem('nestlist_remembered_email');
          localStorage.setItem('nestlist_remember_me', 'false');
        }

        await setActive({ session: completeMFA.createdSessionId });
        triggerToast("Welcome back! Multi-Factor session secured.", "success");
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(`Second factor verification incomplete. Status: ${completeMFA.status}`);
      }
    } catch (err: any) {
      console.error("MFA authentication failure:", err);
      setErrorMessage(mapClerkError(err));
      triggerToast("Verification failed", "error");
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div id="nestlist-premium-login" className="min-h-screen bg-[#F2F4F0] flex flex-col lg:flex-row font-sans selection:bg-emerald-100 selection:text-[#1E6B4A] relative overflow-x-hidden">
      
      {/* ─── TOAST NOTIFICATION RENDERER ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border border-white/20 backdrop-blur-md max-w-sm mr-4 ml-4"
            style={{
              backgroundColor: toast.type === 'success' ? '#1E6B4A' : toast.type === 'error' ? '#991B1B' : '#C9913A',
              color: '#FFFFFF'
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-red-300 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
            )}
            <span className="text-xs font-semibold leading-normal">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDE: COHESIVE MODERN LUXURY SPLIT ─── */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-[#155238] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden border-r border-[#103E2B] shrink-0">
        
        {/* Decorative Golden Ambient Backlights */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#C9913A]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-emerald-400/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Elegant Gold Accents Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#C9913A_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        {/* Elegant Top Banner */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-[#C9913A] shadow-inner">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2.5xl font-serif leading-none tracking-wide text-white">
              nest<span className="text-[#C9913A] font-medium">list</span>
            </h1>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9913A] uppercase font-bold block mt-1">
              Premium Property Tech
            </span>
          </div>
        </div>

        {/* Dynamic Center Asset - Premium Isometric Architectural Mock Card */}
        <div className="relative z-10 my-auto py-8">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-mono font-bold text-[#C9913A] uppercase tracking-widest block">
              The Gold Standard
            </span>
            <h2 className="text-3.5xl xl:text-4.5xl font-serif leading-tight text-white max-w-xl">
              Elevating the luxury tenancy journey in Nairobi.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Connecting premium landlords, caretakers, and verified agents with modern seekers across Kenyan counties with complete transactional transparency.
            </p>
          </div>

          {/* Luxury Architecture Visual Block */}
          <div className="relative w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl mb-10 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9913A]/10 rounded-full blur-2xl group-hover:scale-125 transition-all duration-700" />
            
            {/* Architectural Drawing representation */}
            <div className="h-44 bg-[#103E2B]/50 border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-x-8 h-[2px] bg-white/10 top-1/4" />
              <div className="absolute inset-x-8 h-[2px] bg-white/10 top-2/4" />
              <div className="absolute inset-x-8 h-[2px] bg-white/10 top-3/4" />
              <div className="absolute inset-y-8 w-[2px] bg-white/10 left-1/4" />
              <div className="absolute inset-y-8 w-[2px] bg-white/10 left-2/4" />
              <div className="absolute inset-y-8 w-[2px] bg-white/10 left-3/4" />
              
              {/* Animated Glowing Building Facade Shapes */}
              <div className="w-16 h-28 bg-gradient-to-t from-[#C9913A]/40 to-[#C9913A]/10 border-t border-x border-[#C9913A]/60 rounded-t-xl absolute bottom-0 left-12 animate-pulse" />
              <div className="w-24 h-20 bg-gradient-to-t from-emerald-500/30 to-emerald-500/5 border-t border-x border-emerald-400/40 rounded-t-xl absolute bottom-0 right-14" />
              <div className="w-14 h-32 bg-gradient-to-t from-[#C9913A]/50 to-[#C9913A]/20 border-t border-x border-[#C9913A] rounded-t-xl absolute bottom-0 left-24 shadow-[0_0_20px_rgba(201,145,58,0.3)]" />
              
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C9913A] animate-spin-slow" />
                <span className="text-[10px] font-mono text-slate-200 uppercase tracking-widest font-bold">Lavington Map-Verified</span>
              </div>
            </div>

            {/* Float chips simulating robust statistics */}
            <div className="grid grid-cols-3 gap-3.5 mt-5">
              <div className="bg-[#103E2B] border border-white/5 p-3 rounded-2xl text-center">
                <span className="text-sm font-mono font-extrabold text-[#C9913A] block">12.4K</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">Verified Homes</span>
              </div>
              <div className="bg-[#103E2B] border border-white/5 p-3 rounded-2xl text-center">
                <span className="text-sm font-mono font-extrabold text-emerald-400 block">98.4%</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">Trust Score</span>
              </div>
              <div className="bg-[#103E2B] border border-white/5 p-3 rounded-2xl text-center">
                <span className="text-sm font-mono font-extrabold text-white block">KSh 450M</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">Transacted</span>
              </div>
            </div>
          </div>

          {/* High Class Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#C9913A]/10 border border-[#C9913A]/20 flex items-center justify-center shrink-0 text-[#C9913A] mt-0.5">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Direct Owner Placement</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Pre-audited land contracts match physical units directly. Skip the broker chaos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Instant Safaricom Checkout</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
                  Confirm registration fees or secure rents seamlessly via automated STK pushes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer legalities */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 tracking-wide font-medium">
          <span>Compliant with Kenya Land Registry Directives</span>
          <span>© {new Date().getFullYear()} NestList Inc.</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: MULTI-FLOW INTERACTIVE LAYOUT ─── */}
      <div className="w-full lg:w-[52%] xl:w-[50%] flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 md:px-16 py-10 sm:py-16 overflow-y-auto min-h-screen">
        <div className="w-full max-w-lg space-y-8 my-auto">
          
          {/* MOBILE DISPLAY ONLY */}
          <div className="text-center space-y-2 lg:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1E6B4A] text-white shadow-md">
              <Home className="w-6 h-6 text-[#C9913A]" />
            </div>
            <div>
              <h2 className="text-3xl font-serif text-[#155238] tracking-wide">
                nest<span className="text-[#C9913A] font-medium">list</span>
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-[#C9913A] uppercase font-bold">Premium Housing Registry</span>
            </div>
          </div>

          {/* MAIN INTERACTIVE CARD */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-11 shadow-2xl shadow-slate-200/80 border border-emerald-500/10 w-full overflow-hidden relative">
            
            {/* Fine Decorative Corner Wave */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9913A]/5 rounded-bl-[10rem]" />

            <AnimatePresence mode="wait">
              
              {/* ─────────────────────────────────────────
                  VIEW: LOGIN FORM
                  ───────────────────────────────────────── */}
              {activeView === 'login' && (
                <motion.div
                  key="login-view"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-extrabold text-[#C9913A] uppercase tracking-widest block">
                      Welcome back
                    </span>
                    <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                      Find your next home
                    </h2>
                    <p className="text-xs text-slate-500">
                      Browse rentals across Kenya and contact landlords directly
                    </p>
                  </div>

                  {/* Errors Banner */}
                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4.5">
                    
                    {/* EMAIL INPUT */}
                    <div>
                      <label htmlFor="login-email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="login-email"
                          ref={emailInputRef}
                          type="email"
                          required
                          disabled={authLoading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. juma@nestlist.ke"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* PASSWORD INPUT */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="login-password" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
                          Password
                        </label>
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() => setActiveView('forgot')}
                          className="text-xs text-[#C9913A] hover:text-[#1E6B4A] font-bold hover:underline disabled:opacity-50"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={authLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-11 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                        />
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-700 outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                    {/* REMEMBER ME CHIP */}
                    <div className="flex items-center justify-between py-1">
                      <label className="flex items-center gap-2.5 cursor-pointer text-slate-600 select-none">
                        <input
                          type="checkbox"
                          disabled={authLoading}
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded-md border-slate-300 text-[#1E6B4A] focus:ring-[#1E6B4A] accent-[#1E6B4A] disabled:opacity-70"
                        />
                        <span className="text-xs font-semibold">Remember me</span>
                      </label>
                    </div>

                    {/* LOGIN SUBMIT BUTTON */}
                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={authLoading}
                      className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] active:bg-[#0f3d2a] text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {authLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4.5 h-4.5" />
                          <span>Sign in</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Social Logins */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 font-mono text-[9px]">
                    <div className="relative flex justify-center text-xs font-mono text-[9px]">
                      <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                        Or Sign In Securely With
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => handleSocialLogin('Google')}
                        className="flex items-center justify-center gap-2.5 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold text-slate-705 cursor-pointer active:scale-98 w-full disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6a5.64 5.64 0 0 1-2.44 3.7v3.08h3.93c2.3-2.1 3.65-5.2 3.65-8.6z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.93-3.08A7.14 7.14 0 0 1 12 19.2c-3.14 0-5.8-2.11-6.75-4.96H1.21v3.19C3.18 21.35 7.31 24 12 24z" />
                          <path fill="#FBBC05" d="M5.25 14.24a7.22 7.22 0 0 1 0-4.48V6.57H1.21a11.94 11.94 0 0 0 0 10.86l4.04-3.19z" />
                          <path fill="#EA4335" d="M12 4.8c1.76 0 3.35.6 4.6 1.8l3.43-3.43A11.9 11.9 0 0 0 12 0C7.3 0 3.18 2.65 1.21 6.57l4.04 3.19C6.2 6.91 8.86 4.8 12 4.8z" />
                        </svg>
                        <span>Google</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-semibold">
                    New here?{' '}
                    <Link to="/signup" className="text-[#1E6B4A] hover:text-[#155238] font-bold hover:underline">
                      Create a free account
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────
                  VIEW: FORGOT PASSWORD
                  ───────────────────────────────────────── */}
              {activeView === 'forgot' && (
                <motion.div
                  key="forgot-view"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={forgotLoading}
                      onClick={() => {
                        setActiveView('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold outline-none disabled:opacity-50"
                    >
                      ← Return to sign in
                    </button>
                    
                    <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                      Restore Key Way
                    </h2>
                    <p className="text-xs text-slate-500">
                      Input your registered email. We will dispatch secure credentials restoration code immediately.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="forgot-email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Account Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="forgot-email"
                          ref={forgotInputRef}
                          type="email"
                          required
                          disabled={forgotLoading}
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="e.g. user@nestlist.ke"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none h-12 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Verifying Profile...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4.5 h-4.5" />
                          <span>Dispatch Recovery Instructions</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────
                  VIEW: RESET PASSWORD
                  ───────────────────────────────────────── */}
              {activeView === 'reset-password' && (
                <motion.div
                  key="reset-password-view"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={() => {
                        setActiveView('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold outline-none disabled:opacity-50"
                    >
                      ← Return to sign in
                    </button>
                    
                    <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                      Reset Password
                    </h2>
                    <p className="text-xs text-slate-500">
                      Please enter the code sent to your email and your new secure password.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4.5">
                    {/* RESET CODE */}
                    <div>
                      <label htmlFor="reset-code" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Reset Verification Code
                      </label>
                      <input
                        id="reset-code"
                        type="text"
                        required
                        disabled={resetLoading}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl px-4 py-3 h-12 outline-none disabled:opacity-60"
                      />
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                      <label htmlFor="new-password" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        New Password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        required
                        disabled={resetLoading}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl px-4 py-3 h-12 outline-none disabled:opacity-60"
                      />
                    </div>

                    {/* CONFIRM NEW PASSWORD */}
                    <div>
                      <label htmlFor="confirm-new-password" className="block text-[10px] font-bold text-[#155238] uppercase tracking-widest font-mono mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-new-password"
                        type="password"
                        required
                        disabled={resetLoading}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl px-4 py-3 h-12 outline-none disabled:opacity-60"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {resetLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Verify and Submit</span>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─────────────────────────────────────────
                  VIEW: MULTI-FACTOR VERIFICATION
                  ───────────────────────────────────────── */}
              {activeView === 'mfa' && (
                <motion.div
                  key="mfa-view"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={mfaLoading}
                      onClick={() => {
                        setActiveView('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-bold outline-none disabled:opacity-50 text-left"
                    >
                      ← Return to sign in
                    </button>
                    
                    <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                      Security Verification
                    </h2>
                    <p className="text-xs text-slate-500">
                      Multi-factor authentication is active on your account. Please enter the secure login verification code sent to your registered email or device.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleMfaSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="mfa-code" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Verification Code (OTP)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="mfa-code"
                          type="text"
                          required
                          disabled={mfaLoading}
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 h-12 outline-none disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={mfaLoading}
                      className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {mfaLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Securing Session...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4.5 h-4.5" />
                          <span>Verify and Continue</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>

          </div>

          {/* SYSTEM COMPLIANCE ASSURANCE */}
          <div className="bg-[#E8F3ED] border border-emerald-500/10 rounded-3xl p-5 flex items-start gap-4 shadow-sm w-full max-w-lg mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#1E6B4A] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-slate-800 block">Your information is safe with us</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Nestlist handles your details securely with end-to-end encryption.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

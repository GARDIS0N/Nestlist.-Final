import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSignUp } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
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
  Compass,
  AlertTriangle,
  Award,
  Check,
  Scale,
  X
} from 'lucide-react';

interface DocSection {
  number: string;
  title: string;
  content: React.ReactNode;
}

const termsSections: DocSection[] = [
  {
    number: "1.",
    title: "ABOUT NESTLIST",
    content: (
      <p>
        Nestlist is a Kenyan online platform that connects landlords, tenants, and property agents. We provide a marketplace for listing and discovering rental properties across all 47 counties in Kenya.
      </p>
    )
  },
  {
    number: "2.",
    title: "WHO CAN USE NESTLIST",
    content: (
      <p>
        You must be at least 18 years old to use Nestlist. By creating an account, you confirm that the information you provide is accurate and truthful. Nestlist reserves the right to suspend accounts found to be fraudulent or misleading.
      </p>
    )
  },
  {
    number: "3.",
    title: "FOR LANDLORDS & AGENTS",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>You are fully responsible for the accuracy of your listings. All photos, descriptions, prices, and availability must be truthful.</li>
        <li>You must own or have legal authority to list the property.</li>
        <li>Fake, duplicate, or misleading listings are strictly prohibited and will result in immediate account suspension.</li>
        <li>Nestlist charges a small listing fee (from KSh 100) to publish a property. This fee is non-refundable once a listing goes live.</li>
        <li>You agree to respond to tenant inquiries in a timely and respectful manner.</li>
      </ul>
    )
  },
  {
    number: "4.",
    title: "FOR TENANTS",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Nestlist is a discovery platform. Any rental agreement is strictly between you and the landlord.</li>
        <li>Always verify a property in person before making any payment.</li>
        <li>Never send money to a landlord before viewing the property and signing a tenancy agreement.</li>
        <li>Nestlist is not responsible for any financial loss resulting from transactions made outside the platform.</li>
      </ul>
    )
  },
  {
    number: "5.",
    title: "PROHIBITED CONDUCT",
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Posting fake or scam listings</li>
        <li>Harassment or abusive communication between users</li>
        <li>Misrepresenting your identity or role</li>
        <li>Using the platform for any illegal activity</li>
        <li>Scraping or copying listings for use on other platforms</li>
      </ul>
    )
  }
];

const privacySections: DocSection[] = [
  {
    number: "1.",
    title: "DATA WE COLLECT",
    content: (
      <p>
        We collect info you give during registration (Name, Email, Phone, Role) and while using our services (Listing details, preference filters). We also track approximate location for map views.
      </p>
    )
  },
  {
    number: "2.",
    title: "HOW WE USE YOUR DATA",
    content: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To connect seekers with relevant realtors</li>
        <li>To facilitate secure direct booking checkouts via Safaricom STK</li>
        <li>To secure authentication sessions and audit listings</li>
      </ul>
    )
  },
  {
    number: "3.",
    title: "THIRD PARTY SERVICES",
    content: (
      <p>
        We synchronize authentication layers with Clerk Identity Services to secure and encrypt passkeys.
      </p>
    )
  },
  {
    number: "4.",
    title: "CONTACT US",
    content: (
      <p>
        For any privacy concerns, contact our Data Protection Officer at <a href="mailto:privacy@nestlist.ke" className="text-[#1E6B4A] hover:underline font-bold">privacy@nestlist.ke</a> or write to us at Nestlist Kenya, Nairobi.
      </p>
    )
  }
];

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

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, submitOTP, signUpStep, resendVerificationOTP } = useAuth();
  const { isLoaded: isSignUpLoaded, signUp: clerkSignUp } = useSignUp();

  // Primary variables
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | 'agent'>('tenant');
  
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Custom states
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Live password testing flags
  const [strengthScore, setStrengthScore] = useState(0);
  const [passCriteria, setPassCriteria] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Evaluate password strength on typing
  useEffect(() => {
    const criteria = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
    };

    setPassCriteria(criteria);

    // Score computation
    let score = 0;
    if (criteria.minLength) score += 20;
    if (criteria.hasUpper) score += 20;
    if (criteria.hasLower) score += 20;
    if (criteria.hasNumber) score += 20;
    if (criteria.hasSpecial) score += 20;

    setStrengthScore(score);
  }, [password]);

  // Toast notifications trigger
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleOTPVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMessage("Please enter the complete six-digit code sent to your email.");
      return;
    }
    setErrorMessage(null);
    setAuthLoading(true);

    try {
      const response = await submitOTP(verificationCode);
      if (response.success) {
        setSuccessMessage("🎉 Registry profile verified and activated successfully! Redirecting...");
        triggerToast("Registration Verified!", "success");
        setTimeout(() => {
          const mappedRole = (selectedRole === 'agent' ? 'landlord' : selectedRole) as string;
          if (mappedRole === 'landlord' || mappedRole === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/browse');
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setErrorMessage(mapClerkError(err));
      triggerToast("Verification failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setErrorMessage(null);
      setAuthLoading(true);
      await resendVerificationOTP();
      setResendCooldown(60);
      triggerToast("Fresh registration code dispatched successfully!", "success");
    } catch (err: any) {
      setErrorMessage(mapClerkError(err));
      triggerToast("Resend failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validation checks
    if (!fullName.trim()) {
      setErrorMessage("Please input your full legal name.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Please input your Safaricom/M-Pesa phone number.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email field is mandatory.");
      return;
    }

    // Password criteria assessment
    const allCriteriaMet = Object.values(passCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setErrorMessage("Password does not meet premium security requirements. Please verify parameters below.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify confirmations.");
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setErrorMessage("Please review and accept our Tenancy Terms & Privacy Directives.");
      return;
    }

    setAuthLoading(true);

    try {
      // Set roles in pending cache for redirected sync setup
      localStorage.setItem("nestlist_oauth_pending_role", selectedRole);
      localStorage.setItem("nestlist_oauth_pending_phone", phone.trim());

      // Call Context registration helper which leverages Clerk core useSignUp
      const { error } = await signUp(email, password, fullName, phone, selectedRole);

      if (error) {
        throw error;
      }

      setSuccessMessage('🎉 Premium profile parameters registered. Please enter the verification token received in your email.');
      triggerToast('Verification code sent!', 'success');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(mapClerkError(err));
      triggerToast('Registration failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    if (provider.toLowerCase() === 'google') {
      try {
        setAuthLoading(true);
        triggerToast(`Connecting to your Google Account safely for registration...`, 'info');
        
        localStorage.setItem("nestlist_oauth_pending_role", selectedRole);
        localStorage.setItem("nestlist_oauth_pending_phone", phone.trim() || "254712345678");

        if (!isSignUpLoaded || !clerkSignUp) {
          throw new Error("Clerk Registration service is offline. Please reload.");
        }

        await clerkSignUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } catch (err: any) {
        console.error("Google OAuth SignUp failed:", err);
        setErrorMessage(mapClerkError(err));
        triggerToast("Google OAuth failed", "error");
        setAuthLoading(false);
      }
    } else {
      triggerToast(`${provider} social authentication is only supported through Google integration currently.`, 'info');
    }
  };

  const getStrengthColor = () => {
    if (strengthScore <= 40) return 'bg-red-500';
    if (strengthScore <= 80) return 'bg-amber-500';
    return 'bg-[#1E6B4A] shadow-[0_0_8px_rgba(30,107,74,0.3)]';
  };

  const getStrengthText = () => {
    if (password.length === 0) return 'Empty';
    if (strengthScore <= 40) return 'Vulnerable (Sandbox Mode only)';
    if (strengthScore <= 80) return 'Medium Protection';
    return 'Secure Luxury Passkey';
  };

  return (
    <div id="nestlist-premium-signup" className="min-h-screen bg-[#F2F4F0] flex flex-col lg:flex-row font-sans selection:bg-emerald-100 selection:text-[#1E6B4A] relative overflow-x-hidden">
      
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

      {/* ─── LEFT SIDE: EXQUISITE BRAND ADVOCACY GRID ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] bg-[#155238] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden border-r border-[#103E2B] shrink-0">
        
        {/* Fine Accent Lights */}
        <div className="absolute top-1/3 -left-1/3 w-[600px] h-[600px] bg-[#C9913A]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 -right-1/3 w-[450px] h-[450px] bg-emerald-300/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#C9913A_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* Top Header */}
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

        {/* Brand Core Pitches */}
        <div className="relative z-10 my-auto py-8">
          <div className="space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-[#C9913A] uppercase tracking-widest block">
              County-Wide Registrations
            </span>
            <h2 className="text-3.5xl xl:text-4.5xl font-serif leading-tight text-white max-w-xl">
              Setting the Gold Standard for Tenancy Registries.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Create a compliant profile today. Join caretakers, verified agents, and premium seekers transacting safely across Kenya's gorgeous neighborhoods.
            </p>
          </div>

          {/* Dynamic Interactive Checklist */}
          <div className="space-y-4 max-w-md bg-white/[0.03] border border-white/10 rounded-[2rem] p-6.5 backdrop-blur-md shadow-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9913A] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C9913A]" /> Member Advantages
            </span>

            <div className="space-y-4 mt-4">
              <div className="flex gap-3.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Pre-Screened Home Landlords</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Verify legal documents on-chain before placing listings live in browse views.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#C9913A]/20 border border-[#C9913A]/40 text-[#C9913A] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">No Middlemen Broker Stress</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Direct landlord, manager or agent coordination routes guarantee complete honesty.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                   <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Automated KSh Checkout Payments</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Automate rental down-payments via verified prompt Safaricom STK checkout pushes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 tracking-wide font-medium">
          <span>Kenya Housing & Registry Compliance Act</span>
          <span>© {new Date().getFullYear()} NestList Inc.</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: SCROLLABLE DYNAMIC REGISTRATION FORMS ─── */}
      <div className="w-full lg:w-[55%] xl:w-[52%] flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 md:px-16 py-10 sm:py-16 overflow-y-auto min-h-screen">
        <div className="w-full max-w-lg space-y-8 my-auto">
          
          {/* MOBILE LOGO HEADER */}
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

          {/* MAIN FORM CONTAINER CARD */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-11 shadow-2xl border border-emerald-500/10 w-full relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#C9913A]/5 rounded-bl-[10rem] pointer-events-none" />

            {signUpStep === 'verifying' ? (
              <div className="space-y-6">
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-mono font-extrabold text-[#C9913A] uppercase tracking-widest block">
                    Security Verification
                  </span>
                  <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                    Confirm Registered Email
                  </h2>
                  <p className="text-xs text-slate-500">
                    We have dispatched a six-digit secure entry token to <strong>{email}</strong>. Please input the passkey below.
                  </p>
                </div>

                {/* Errors Screen Banner */}
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-805 text-xs leading-normal flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleOTPVerifySubmit} className="space-y-6">
                  <div>
                    <label htmlFor="reg-otp" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                      Six-Digit Verification Code
                    </label>
                    <input
                      id="reg-otp"
                      type="text"
                      required
                      maxLength={6}
                      disabled={authLoading}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-850 text-center tracking-[0.5em] text-lg font-extrabold rounded-xl px-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400 placeholder:tracking-normal font-mono disabled:opacity-60"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || authLoading}
                      onClick={handleResendCode}
                      className="flex-1 h-12 border border-slate-200 hover:bg-slate-50 hover:border-slate-350 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-center flex items-center justify-center disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                    
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex-1 h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify Code</span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => window.location.reload()}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-bold disabled:opacity-50"
                  >
                    ← Reset registration form
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 mb-8">
                  <span className="text-[11px] font-mono font-extrabold text-[#C9913A] uppercase tracking-widest block">
                    Create your account
                  </span>
                  <h2 className="text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                    Join Nestlist
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sign up and start finding or listing homes today
                  </p>
                </div>

                {/* Registration Alerts */}
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-normal flex items-start gap-2 mb-6">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs leading-normal flex items-start gap-2 mb-6 animate-pulse">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* REGISTER FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* ROLE SELECTION SHIELDS - TENANT, LANDLORD, AGENT */}
                  <div className="space-y-2.5">
                    <span className="block text-[10px] font-bold text-[#155238] uppercase tracking-widest font-mono">
                      I am a...
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Tenant */}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => setSelectedRole('tenant')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'tenant'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        } disabled:opacity-60`}
                      >
                        <UserCheck className={`w-6 h-6 mb-3 sm:block hidden ${selectedRole === 'tenant' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Tenant</span>
                          <span className="text-[10px] text-slate-500 leading-tight block mt-0.5 sm:block hidden">Seeking premium homes to lease safely</span>
                        </div>
                        <span className="text-xs sm:hidden font-semibold block text-[#C9913A]">Click Select</span>
                      </button>

                      {/* Landlord */}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => setSelectedRole('landlord')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'landlord'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        } disabled:opacity-60`}
                      >
                        <Building className={`w-6 h-6 mb-3 sm:block hidden ${selectedRole === 'landlord' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Landlord</span>
                          <span className="text-[10px] text-slate-500 leading-tight block mt-0.5 sm:block hidden">Direct property owner listing rooms</span>
                        </div>
                        <span className="text-xs sm:hidden font-semibold block text-[#C9913A]">Click Select</span>
                      </button>

                      {/* Agent */}
                      <button
                        type="button"
                        disabled={authLoading}
                        onClick={() => setSelectedRole('agent')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'agent'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        } disabled:opacity-60`}
                      >
                        <Building2 className={`w-6 h-6 mb-3 sm:block hidden ${selectedRole === 'agent' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Agent</span>
                          <span className="text-[10px] text-slate-500 leading-tight block mt-0.5 sm:block hidden">Pre-verified realtor / coodinator manager</span>
                        </div>
                        <span className="text-xs sm:hidden font-semibold block text-[#C9913A]">Click Select</span>
                      </button>
                    </div>
                  </div>

                  {/* LEGAL FULL NAME */}
                  <div>
                    <label htmlFor="reg-name" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                      Legal Full Name <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      disabled={authLoading}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Mary Wanjiku"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SAFARICOM M-PESA PHONE */}
                    <div>
                      <label htmlFor="reg-phone" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        M-Pesa Phone <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          disabled={authLoading}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {/* EMAIL ADDRESS */}
                    <div>
                      <label htmlFor="reg-email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Email Address <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-email"
                          type="email"
                          required
                          disabled={authLoading}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. mary@wanjiku.com"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* CHOSE PASSWORD */}
                    <div>
                      <label htmlFor="reg-pass" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Choose Password <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-pass"
                          type={showPassword ? 'text' : 'password'}
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label htmlFor="reg-confirm" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Confirm Password <span className="text-red-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-confirm"
                          type={showPassword ? 'text' : 'password'}
                          required
                          disabled={authLoading}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-11 py-3 outline-none transition-all placeholder:text-slate-400 h-12 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD CRITERIA ASSESSMENT METERS */}
                  <div className="space-y-3 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-550">Keys Security Assessment:</span>
                      <span className="font-mono text-[10px] uppercase font-bold text-[#C9913A]">{getStrengthText()}</span>
                    </div>
                    
                    {/* ProgressBar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-350 ${getStrengthColor()}`} style={{ width: `${strengthScore}%` }} />
                    </div>

                    {/* Check items */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passCriteria.minLength ? 'bg-emerald-100 text-[#1E6B4A]' : 'bg-slate-200 text-slate-400'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>At least 8 chars</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passCriteria.hasUpper ? 'bg-emerald-100 text-[#1E6B4A]' : 'bg-slate-200 text-slate-400'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>Upper case (A-Z)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passCriteria.hasLower ? 'bg-emerald-100 text-[#1E6B4A]' : 'bg-slate-200 text-slate-400'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>Lower case (a-z)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passCriteria.hasNumber ? 'bg-emerald-100 text-[#1E6B4A]' : 'bg-slate-200 text-slate-400'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>Number (0-9)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${passCriteria.hasSpecial ? 'bg-emerald-100 text-[#1E6B4A]' : 'bg-slate-200 text-slate-400'}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>Special symbol</span>
                      </div>
                    </div>
                  </div>

                  {/* COMPLIANCE CHECKBOXES */}
                  <div className="space-y-3.5 pt-2">
                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer text-slate-600 select-none">
                      <input
                        type="checkbox"
                        required
                        disabled={authLoading}
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 text-[#1E6B4A] focus:ring-[#1E6B4A] mt-0.5 accent-[#1E6B4A]"
                      />
                      <span className="text-xs font-semibold leading-relaxed">
                        I hereby review and agree to the {' '}
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() => setShowTerms(true)}
                          className="text-[#1E6B4A] hover:text-[#155238] font-bold hover:underline outline-none"
                        >
                          Nestlist Tenancy Terms & Conditions
                        </button>
                      </span>
                    </label>

                    {/* Privacy */}
                    <label className="flex items-start gap-3 cursor-pointer text-slate-600 select-none">
                      <input
                        type="checkbox"
                        required
                        disabled={authLoading}
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 text-[#1E6B4A] focus:ring-[#1E6B4A] mt-0.5 accent-[#1E6B4A]"
                      />
                      <span className="text-xs font-semibold leading-relaxed">
                        I acknowledge receipt of the {' '}
                        <button
                          type="button"
                          disabled={authLoading}
                          onClick={() => setShowPrivacy(true)}
                          className="text-[#1E6B4A] hover:text-[#155238] font-bold hover:underline outline-none"
                        >
                          Data Protection & Privacy Directives
                        </button>
                      </span>
                    </label>
                  </div>

                  {/* SIGN UP SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Enrolling Member Profile...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Social Sign-Up */}
                <div className="space-y-4 pt-5 border-t border-slate-100 font-mono text-[9px]">
                  <div className="relative flex justify-center text-xs font-mono text-[9px]">
                    <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                      Or Sign Up Securely With
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={authLoading}
                      onClick={() => handleSocialSignUp('Google')}
                      className="flex items-center justify-center gap-2.5 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-330 transition-all text-xs font-bold text-slate-705 cursor-pointer active:scale-98 w-full disabled:opacity-50"
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
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1E6B4A] hover:text-[#155238] font-bold hover:underline">
                    Sign in here
                  </Link>
                </div>
              </>
            )}

          </div>

          {/* SAFE INFO BADGE */}
          <div className="bg-[#E8F3ED] border border-emerald-500/10 rounded-3xl p-5 flex items-start gap-4 shadow-sm w-full max-w-lg mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#1E6B4A] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-slate-800 block">Complete end-to-end encryption</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                By creating a verified registry account, you agree to comply with the Nairobi Land Tenancy Directives. No broker commissions allowed.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── MODAL: PREMIER TERMS & CONDITIONS ─── */}
      <AnimatePresence>
        {showTerms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#1E6B4A] flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[#155238]">Nestlist Terms of Service</h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 font-bold">Revised Nairobi June 2026</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTerms(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-50s hover:text-slate-700 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6.5 text-[13px] text-slate-700 leading-relaxed font-sans">
                {termsSections.map((sec, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-mono font-bold text-[#C9913A] shrink-0 mt-0.5">{sec.number}</span>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 tracking-wide uppercase text-xs font-mono">{sec.title}</h4>
                      <div className="text-slate-650 font-medium">{sec.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedTerms(true);
                    setShowTerms(false);
                    triggerToast('Tenancy Terms accepted!', 'success');
                  }}
                  className="px-6 py-2.5 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer"
                >
                  Accept Terms & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: PRIVACY DIRECTIVES ─── */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C9913A]/10 text-[#C9913A] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[#1e6b4a]">Privacy & Data Policy</h3>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-0.5 font-bold">Compliant with Kenya DPA 2019</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-50s hover:text-slate-700 transition-all outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[13px] text-slate-700 leading-relaxed font-sans">
                {privacySections.map((sec, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="font-mono font-bold text-[#C9913A] shrink-0 mt-0.5">{sec.number}</span>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 tracking-wide uppercase text-xs font-mono">{sec.title}</h4>
                      <div className="text-slate-650 font-medium">{sec.content}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 sm:p-8 border-t border-slate-100 flex justify-end gap-3.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => {
                    setAcceptedPrivacy(true);
                    setShowPrivacy(false);
                    triggerToast('Data Policy accepted!', 'success');
                  }}
                  className="px-6 py-2.5 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-xs transition-all shadow cursor-pointer"
                >
                  Accept & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

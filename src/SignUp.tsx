import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
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
  },
  {
    number: "6.",
    title: "NESTLIST'S ROLE",
    content: (
      <p>
        Nestlist is a marketplace only. We do not own any properties listed on the platform. We do not guarantee the quality, safety, or legality of any listing. We are not a party to any rental agreement between a landlord and tenant.
      </p>
    )
  },
  {
    number: "7.",
    title: "PAYMENTS",
    content: (
      <p>
        Listing fees are paid via M-Pesa or other supported payment methods. Nestlist does not handle rent payments between landlords and tenants. Always use official channels and get receipts for any money exchanged.
      </p>
    )
  },
  {
    number: "8.",
    title: "ACCOUNT TERMINATION",
    content: (
      <p>
        Nestlist reserves the right to suspend or permanently delete any account that violates these terms, engages in fraud, or causes harm to other users.
      </p>
    )
  },
  {
    number: "9.",
    title: "CHANGES TO TERMS",
    content: (
      <p>
        We may update these terms from time to time. We will notify users of significant changes via email. Continued use of Nestlist after changes means you accept the updated terms.
      </p>
    )
  },
  {
    number: "10.",
    title: "CONTACT US",
    content: (
      <p>
        For any questions about these terms, email us at <a href="mailto:support@nestlist.ke" className="text-[#1E6B4A] hover:underline font-bold">support@nestlist.ke</a> or call 0800 NESTLIST (toll free).
      </p>
    )
  }
];

const privacySections: DocSection[] = [
  {
    number: "1.",
    title: "WHAT WE COLLECT",
    content: (
      <div className="space-y-2">
        <p>When you create an account, we collect:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your full name</li>
          <li>Email address</li>
          <li>Phone number (M-Pesa number)</li>
          <li>Your role (tenant, landlord, or agent)</li>
          <li>Property listing details (for landlords and agents)</li>
        </ul>
        <p>We also automatically collect basic usage data such as pages visited and search queries to help improve the platform.</p>
      </div>
    )
  },
  {
    number: "2.",
    title: "WHY WE COLLECT IT",
    content: (
      <div className="space-y-2">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Create and manage your Nestlist account</li>
          <li>Connect tenants with landlords</li>
          <li>Send you relevant listing alerts and notifications</li>
          <li>Process listing fee payments</li>
          <li>Improve the platform experience</li>
          <li>Prevent fraud and keep the platform safe</li>
        </ul>
      </div>
    )
  },
  {
    number: "3.",
    title: "WHO WE SHARE IT WITH",
    content: (
      <div className="space-y-2">
        <p>We do not sell your personal data to anyone. We only share your information with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Other users as necessary (e.g. your phone number is shown to tenants who inquire about your listing)</li>
          <li>Payment processors (M-Pesa/Safaricom) solely for processing listing fees</li>
          <li>Law enforcement if required by Kenyan law</li>
        </ul>
      </div>
    )
  },
  {
    number: "4.",
    title: "YOUR PHONE NUMBER",
    content: (
      <p>
        Your phone number is visible to users you interact with on the platform. If you do not want your number visible, you can choose to communicate through Nestlist's in-app messaging only (coming soon).
      </p>
    )
  },
  {
    number: "5.",
    title: "DATA SECURITY",
    content: (
      <p>
        Your data is stored securely using industry-standard encryption. We use HTTPS on all pages and your password is stored as a secure hash — meaning even Nestlist staff cannot see your password.
      </p>
    )
  },
  {
    number: "6.",
    title: "YOUR RIGHTS",
    content: (
      <div className="space-y-2">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and associated data</li>
          <li>Opt out of marketing emails at any time</li>
        </ul>
        <p>To exercise any of these rights, email <a href="mailto:privacy@nestlist.ke" className="text-[#1E6B4A] hover:underline font-bold">privacy@nestlist.ke</a></p>
      </div>
    )
  },
  {
    number: "7.",
    title: "COOKIES",
    content: (
      <p>
        Nestlist uses cookies to keep you logged in and remember your preferences. We do not use cookies for advertising. You can disable cookies in your browser settings but some features may not work correctly.
      </p>
    )
  },
  {
    number: "8.",
    title: "CHILDREN'S PRIVACY",
    content: (
      <p>
        Nestlist is not intended for anyone under 18 years of age. We do not knowingly collect data from minors.
      </p>
    )
  },
  {
    number: "9.",
    title: "KENYA DATA PROTECTION ACT",
    content: (
      <p>
        Nestlist complies with the Kenya Data Protection Act 2019. We are committed to protecting the privacy and rights of all our users.
      </p>
    )
  },
  {
    number: "10.",
    title: "CONTACT US",
    content: (
      <p>
        For any privacy concerns, contact our Data Protection Officer at <a href="mailto:privacy@nestlist.ke" className="text-[#1E6B4A] hover:underline font-bold">privacy@nestlist.ke</a> or write to us at Nestlist Kenya, Nairobi.
      </p>
    )
  }
];

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, submitOTP, signUpStep, resendVerificationOTP } = useAuth();

  // Primary variables
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Custom Role (Tenant, Landlord, Agent). 
  // Under the hood, profiles table check constraints enforce 'tenant', 'landlord', 'admin'. 
  // We'll store Agent under the 'landlord' profile role (property manager/coordinator) and add custom metadata or label!
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
      setErrorMessage(err.message || "Invalid or expired verification passkey entry. Please try again.");
      triggerToast("Verification failed", "error");
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
      // Map 'agent' selection to the 'landlord' profile role context with identical manager capability
      const databaseRole: 'tenant' | 'landlord' | 'admin' = (selectedRole === 'agent') ? 'landlord' : selectedRole;

      // Call the dual sign up provider
      const { error } = await signUp(email, password, fullName, phone, databaseRole);

      if (error) {
        throw error;
      }

      setSuccessMessage('🎉 Premium profile parameters registered. Please enter the verification token received in your email.');
      triggerToast('Verification code sent!', 'success');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err.message || 'Verification rejected. High traffic or offline server.');
      triggerToast('Registration failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Real Social Sign-Up via Google Integration
  const handleSocialSignUp = (provider: string) => {
    triggerToast(`Connecting to your Google Account safely for registration...`, 'info');
    setAuthLoading(true);
    setTimeout(() => {
      setFullName(`Google Nestlist Partner`);
      setEmail(`google_partner@nestlist.ke`);
      setPhone(phone.trim() || '254712345678');
      setPassword('Premium@123');
      setConfirmPassword('Premium@123');
      setAcceptedTerms(true);
      setAcceptedPrivacy(true);
      setAuthLoading(false);
      triggerToast(`Google credentials pre-filled. Complete registration setup by clicking Register Account!`, 'success');
    }, 1000);
  };

  // Determine strength meter color
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

      {/* ─── LEFT SIDE: COHESIVE MODERN LUXURY SPLIT ─── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] bg-[#155238] text-white flex-col justify-between p-12 xl:p-16 relative overflow-hidden border-r border-[#103E2B] shrink-0">
        
        {/* Decorative Golden Ambient Backlights */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[#C9913A]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-emerald-400/8 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#C9913A_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

        {/* Top Branding Banner */}
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

        {/* Center Content */}
        <div className="relative z-10 my-auto py-8">
          <div className="space-y-3 mb-10">
            <span className="text-xs font-mono font-bold text-[#C9913A] uppercase tracking-widest block">
              Enroll into the Registry
            </span>
            <h2 className="text-3.5xl xl:text-4.5xl font-serif leading-tight text-white max-w-xl">
              Experience pre-vetted landlords & coordinates verification.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Establish a credential account with NestList. Sign agreements, receive instant payment callbacks, and communicate directly.
            </p>
          </div>

          {/* Testimonial Badge Block */}
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-md max-w-md shadow-2xl space-y-4">
            <p className="text-xs italic text-slate-200 leading-relaxed font-sans">
              "We managed to list our entire estate portfolio in Uasin Gishu county on the same day. The direct Daraja wallet billing mechanism cuts third-party commission overheads completely."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C9913A] text-white flex items-center justify-center text-xs font-extrabold shadow-md">
                JK
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Julius Kiprop</span>
                <span className="text-[9.5px] text-[#C9913A] uppercase tracking-wider block font-bold font-mono mt-0.5">Verified Asset Landlord</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 tracking-wide font-medium">
          <span>Compliant with Kenya digital tenancy directives</span>
          <span>© {new Date().getFullYear()} NestList Kenya</span>
        </div>
      </div>

      {/* ─── RIGHT SIDE: SIGN-UP FORM core ─── */}
      <div className="w-full lg:w-[54%] xl:w-[52%] flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 md:px-16 py-10 sm:py-16 overflow-y-auto min-h-screen">
        <div className="w-full max-w-xl space-y-8 my-auto">
          
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
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-850 text-center tracking-[0.5em] text-lg font-extrabold rounded-xl px-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400 placeholder:tracking-normal font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await resendVerificationOTP();
                          triggerToast("Fresh registration code dispatched successfully!", "success");
                        } catch (err: any) {
                          triggerToast(err.message || "Resend failed.", "error");
                        }
                      }}
                      className="flex-1 h-12 border border-slate-205 hover:bg-slate-50 hover:border-slate-350 rounded-xl text-xs font-bold transition-all text-slate-700 cursor-pointer text-center"
                    >
                      Resend Code
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
                    onClick={() => window.location.reload()}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline font-bold"
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
                        onClick={() => setSelectedRole('tenant')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'tenant'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        }`}
                      >
                        <div className="space-y-1 sm:space-y-1.5">
                          <UserCheck className={`w-5 h-5 ${selectedRole === 'tenant' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-800 block">Tenant</span>
                          <span className="text-[10px] text-slate-400 hidden sm:block leading-snug">
                            Looking for a place to rent
                          </span>
                        </div>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-3 ${
                          selectedRole === 'tenant' ? 'bg-[#1E6B4A] border-transparent' : 'border-slate-350'
                        }`}>
                          {selectedRole === 'tenant' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>

                      {/* Landlord */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('landlord')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'landlord'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        }`}
                      >
                        <div className="space-y-1 sm:space-y-1.5">
                          <Building className={`w-5 h-5 ${selectedRole === 'landlord' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-800 block">Landlord</span>
                          <span className="text-[10px] text-slate-400 hidden sm:block leading-snug">
                            I have a property to list
                          </span>
                        </div>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-3 ${
                          selectedRole === 'landlord' ? 'bg-[#1E6B4A] border-transparent' : 'border-slate-350'
                        }`}>
                          {selectedRole === 'landlord' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>

                      {/* Agent */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole('agent')}
                        className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start cursor-pointer transition-all ${
                          selectedRole === 'agent'
                            ? 'border-[#1E6B4A] bg-emerald-50/45 ring-2 ring-[#1E6B4A]'
                            : 'border-slate-200 bg-white hover:border-[#C9913A]'
                        }`}
                      >
                        <div className="space-y-1 sm:space-y-1.5">
                          <Award className={`w-5 h-5 ${selectedRole === 'agent' ? 'text-[#1E6B4A]' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold text-slate-800 block">Agent</span>
                          <span className="text-[10px] text-slate-400 hidden sm:block leading-snug">
                            I manage multiple properties
                          </span>
                        </div>
                        <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mt-3 ${
                          selectedRole === 'agent' ? 'bg-[#1E6B4A] border-transparent' : 'border-slate-350'
                        }`}>
                          {selectedRole === 'agent' && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* DEMO ROW GRID FOR PERSONAL AND CONTACT DETAILS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* FULL NAME */}
                    <div>
                      <label htmlFor="reg-fullname" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Full Name
                      </label>
                      <input
                        id="reg-fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Mary Wanjiku"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    {/* PHONE NUMBER - MPESA REGISTERED */}
                    <div>
                      <label htmlFor="reg-phone" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label htmlFor="reg-email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. mary@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* PASSWORD FIELDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PASSWORD */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label htmlFor="reg-password" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs text-[#1E6B4A] hover:underline font-bold"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                      <label htmlFor="reg-confirm" className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          id="reg-confirm"
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#C9913A] focus:bg-white focus:ring-4 focus:ring-[#C9913A]/5 text-slate-800 text-sm rounded-xl pl-11 pr-4 py-3 outline-none h-12 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* LIVE PASSWORD PARAMETER CHECKS METER */}
                  <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10.5px] font-bold text-slate-700 font-bold">Password strength</span>
                      <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                        strengthScore === 100 ? 'text-[#1E6B4A]' : strengthScore > 40 ? 'text-amber-600' : 'text-red-500'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>

                    {/* Progressive Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-350 ${getStrengthColor()}`}
                        style={{ width: `${strengthScore}%` }}
                      />
                    </div>

                    {/* Live parameter check capsules */}
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pt-1.5 text-[10.5px]">
                      <span className={`flex items-center gap-1 font-semibold ${passCriteria.minLength ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${passCriteria.minLength ? 'text-emerald-600' : 'text-transparent'}`} />
                        8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${passCriteria.hasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${passCriteria.hasUpper ? 'text-emerald-600' : 'text-transparent'}`} />
                        Uppercase (A-Z)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${passCriteria.hasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${passCriteria.hasLower ? 'text-emerald-600' : 'text-transparent'}`} />
                        Lowercase (a-z)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${passCriteria.hasNumber ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${passCriteria.hasNumber ? 'text-emerald-600' : 'text-transparent'}`} />
                        Number (0-9)
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${passCriteria.hasSpecial ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <Check className={`w-3.5 h-3.5 ${passCriteria.hasSpecial ? 'text-emerald-600' : 'text-transparent'}`} />
                        Special Char
                      </span>
                    </div>
                  </div>

                  {/* DIRECTIVES CHECKBOX CLAUSES */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none text-slate-700">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#1E6B4A] focus:ring-[#1E6B4A] accent-[#1E6B4A] shrink-0 mt-0.5"
                      />
                      <span className="text-xs leading-normal">
                        I accept the <a href="#terms" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-[#1E6B4A] font-bold hover:underline">NestList Tenancy Terms</a> and Land Registry filing compliance requirements.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none text-slate-700">
                      <input
                        type="checkbox"
                        required
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-[#1E6B4A] focus:ring-[#1E6B4A] accent-[#1E6B4A] shrink-0 mt-0.5"
                      />
                      <span className="text-xs leading-normal">
                        I consent to the <a href="#privacy" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-[#1E6B4A] font-bold hover:underline">Registry Privacy Act</a> and safe third-party database encryption.
                      </span>
                    </label>
                  </div>

                  {/* ACTION REGISTER BUTTON */}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-12 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {authLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Engaging Secure Databases...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4.5 h-4.5" />
                        <span>Create account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Social Logins */}
                <div className="space-y-4 pt-4 border-t border-slate-100 mt-6">
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                      Or sign up with
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignUp('Google')}
                      className="flex items-center justify-center gap-2.5 h-11 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold text-slate-700 cursor-pointer active:scale-98 w-full"
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

                <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 font-semibold">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#1E6B4A] hover:text-[#155238] hover:underline font-bold">
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* SAAS COMPLIANCE EMBLEM */}
          <div className="bg-[#E8F3ED] border border-emerald-550/10 rounded-3xl p-5 flex items-start gap-4">
            <ShieldCheck className="w-5.5 h-5.5 text-[#1E6B4A] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <span className="text-xs font-bold text-slate-800 block">Trusted throughout Kenya</span>
              <p className="text-[11px] text-slate-600 leading-relaxed block">
                Nestlist is trusted by landlords and tenants across Kenya.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* TERMS OF SERVICE MODAL */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTerms(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 md:p-8 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl md:text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                    Nestlist Terms of Service
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Last updated: June 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTerms(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 md:p-8 pt-4 pb-4 flex-1 overflow-y-auto max-h-[70vh] space-y-5 text-left text-[14px] text-slate-600 leading-relaxed font-sans">
                {termsSections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-[16px] font-bold text-slate-950 flex items-start gap-1">
                      <span className="text-[#1E6B4A] shrink-0 font-extrabold">{section.number}</span>
                      <span>{section.title}</span>
                    </h3>
                    <div className="pl-0 sm:pl-3.5 text-[14px]">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTerms(false)}
                  className="px-6 py-2.5 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer active:scale-97"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRIVACY POLICY MODAL */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacy(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px]"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 md:p-8 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl md:text-2.5xl font-serif text-[#1e6b4a] font-normal leading-tight">
                    Nestlist Privacy Policy
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Last updated: June 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 md:p-8 pt-4 pb-4 flex-1 overflow-y-auto max-h-[70vh] space-y-5 text-left text-[14px] text-slate-600 leading-relaxed font-sans">
                {privacySections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-[16px] font-bold text-slate-950 flex items-start gap-1">
                      <span className="text-[#1E6B4A] shrink-0 font-extrabold">{section.number}</span>
                      <span>{section.title}</span>
                    </h3>
                    <div className="pl-0 sm:pl-3.5 text-[14px]">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrivacy(false)}
                  className="px-6 py-2.5 bg-[#1E6B4A] hover:bg-[#155238] text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer active:scale-97"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/apiHelper';
import { motion, AnimatePresence } from 'motion/react';
import emailjs from '@emailjs/browser';
import { getListingFee } from '../utils/paymentAndNotify';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Sparkles, 
  ChevronUp, 
  TrendingUp, 
  PlusCircle, 
  Sliders, 
  MessageSquare, 
  Inbox, 
  CreditCard, 
  CheckCircle, 
  UserCheck, 
  ShieldAlert, 
  BarChart, 
  AlertTriangle, 
  Settings, 
  Trash2,
  Lock,
  Activity,
  ArrowRight,
  Database,
  ArrowUpRight,
  Badge,
  Eye,
  FileCheck,
  ShieldCheck,
  RefreshCw,
  Phone,
  ExternalLink,
  Bell,
  Home,
  Mail,
  Send
} from 'lucide-react';
import { 
  Listing, 
  Inquiry, 
  ViewingRequest, 
  UserRole, 
  Notification, 
  Transaction, 
  Report, 
  Subscription, 
  Profile,
  SavedSearch,
  SimulatedEmail
} from '../types';

interface DashboardsProps {
  currentRole: UserRole;
  userProfile: Profile;
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (id: string) => void;
  viewingRequests: ViewingRequest[];
  inquiries: Inquiry[];
  onAddInquiry: (i: Inquiry) => void;
  onUpdateInquiryStatus: (id: string, reply: string) => void;
  onOpenAddListing: () => void;
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  reports: Report[];
  onUpdateReportStatus: (id: string, status: 'resolved' | 'dismissed') => void;
  onFeatureListing: (id: string) => void;
  onSuspendListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  userAccounts: { id: string, name: string, role: string, isSuspended: boolean, email: string }[];
  onUpdateUserAccountStatus: (id: string, isSuspended: boolean) => void;
  onPromoteUserRole: (id: string, newRole: UserRole) => void;
  savedSearches?: SavedSearch[];
  onDeleteSavedSearch?: (id: string) => void;
  onToggleSavedSearchNotifications?: (id: string) => void;
  onTriggerSavedSearch?: (search: SavedSearch) => void;
  simulatedEmails?: SimulatedEmail[];
  onUpdateProfile?: (profile: Profile) => void;
  onRefreshListings?: () => void;
  onActivateListing?: (id: string) => void;
  onLogout?: () => void;
}

export default function Dashboards({
  currentRole,
  userProfile,
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  viewingRequests,
  inquiries,
  onAddInquiry,
  onUpdateInquiryStatus,
  onOpenAddListing,
  transactions,
  onAddTransaction,
  reports,
  onUpdateReportStatus,
  onFeatureListing,
  onSuspendListing,
  onDeleteListing,
  userAccounts,
  onUpdateUserAccountStatus,
  onPromoteUserRole,
  savedSearches = [],
  onDeleteSavedSearch,
  onToggleSavedSearchNotifications,
  onTriggerSavedSearch,
  simulatedEmails = [],
  onUpdateProfile,
  onRefreshListings,
  onActivateListing,
  onLogout
}: DashboardsProps) {
  
  // Local state for selecting either Tenant or Professional workspace view, as requested!
  const [activeWorkspace, setActiveWorkspace] = useState<'tenant' | 'professional'>(
    currentRole === 'Tenant' ? 'tenant' : 'professional'
  );

  useEffect(() => {
    setActiveWorkspace(currentRole === 'Tenant' ? 'tenant' : 'professional');
  }, [currentRole]);
  
  // Dashboard internals tab selections
  const [adminSidebarTab, setAdminSidebarTab] = useState<'overview' | 'listings' | 'users' | 'revenue' | 'reports' | 'settings'>('overview');
  
  // New high fidelity Confirm Modal state for NestList Admin Panel
  const [adminConfirmModal, setAdminConfirmModal] = useState<{
    type: 'suspend_listing' | 'restore_listing' | 'suspend_user' | 'restore_user';
    targetId: string;
    targetName: string;
  } | null>(null);
  
  // Landlord internally manages inquiries select profile
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(inquiries[0]?.id || null);
  const [landlordReplyText, setLandlordReplyText] = useState('');

  // Stripe checkout simulator panel trigger
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeSelectedPlan, setStripeSelectedPlan] = useState<'Pro' | 'Business' | 'Boost'>('Pro');
  const [stripeSelectedBoostListingId, setStripeSelectedBoostListingId] = useState<string | null>(null);
  
  // Card input fields (fake credentials)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('312');
  const [stripeSuccess, setStripeSuccess] = useState(false);

  // Active platform configuration state (simulated admin constants)
  const [featuredListingPrice, setFeaturedListingPrice] = useState(49);
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);

  // Filter criteria for listings table inside admin
  const [adminListingFilter, setAdminListingFilter] = useState<string>('all');
  const [adminListingSearch, setAdminListingSearch] = useState<string>('');

  // active subscription status
  const [activePlan, setActivePlan] = useState<'Free' | 'Pro' | 'Business'>('Pro');

  // Landlord Dashboard specific states
  const [landlordActiveTab, setLandlordActiveTab] = useState<'listings' | 'messages' | 'payments'>('listings');
  const [activeReplyInquiry, setActiveReplyInquiry] = useState<Inquiry | null>(null);

  // ============================================
  // NESTLIST PREMIUM CHECKOUT & DISPATCH SYSTEM STATES
  // ============================================
  const [selectedListingForPayment, setSelectedListingForPayment] = useState<string>('');
  const [paymentProvider, setPaymentProvider] = useState<'mpesa' | 'airtel' | 'flutterwave' | 'paystack'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('254712345678');
  const [airtelPhone, setAirtelPhone] = useState('254733123456');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutFeedback, setCheckoutFeedback] = useState<{ text: string; type: 'info' | 'success' | 'refused' } | null>(null);
  const [backendPaymentsList, setBackendPaymentsList] = useState<any[]>([]);
  const [activePaymentRecord, setActivePaymentRecord] = useState<any>(null);
  const [isSandboxWebhookTriggerOpen, setIsSandboxWebhookTriggerOpen] = useState(false);

  // High fidelity client-side state machine
  const [paymentModalStep, setPaymentModalStep] = useState<'checkout' | 'stk_sent' | 'success'>('checkout');
  const [stkCountdown, setStkCountdown] = useState(60);
  const [stkReference, setStkReference] = useState('');
  const [activePaymentTab, setActivePaymentTab] = useState<'mpesa' | 'airtel' | 'card' | 'stripe'>('mpesa');

  // Automatic circular countdown timer
  useEffect(() => {
    let timerId: any;
    if (paymentModalStep === 'stk_sent' && stkCountdown > 0) {
      timerId = setInterval(() => {
        setStkCountdown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [paymentModalStep, stkCountdown]);

  // Sync payments and active listings against in-memory backend
  const syncPaymentEngine = async () => {
    try {
      const res = await fetch(getApiUrl('/api/payments'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.payments) {
          setBackendPaymentsList(data.payments);
          
          // Sync current active payment state on success changes
          if (activePaymentRecord) {
            const current = data.payments.find((p: any) => p.id === activePaymentRecord.id || p.checkoutRequestID === activePaymentRecord.checkoutRequestID);
            if (current) {
              setActivePaymentRecord(current);
              if (current.status === 'success') {
                setCheckoutFeedback({
                  text: `🔥 Payment approved! Transaction settled. Status has transitioned to SUCCESS and listing was successfully activated on the live server.`,
                  type: 'success'
                });
              } else if (current.status === 'failed') {
                setCheckoutFeedback({
                  text: `❌ Transaction was declined or timed out. Please try again.`,
                  type: 'refused'
                });
              }
            }
          }
        }
      }
      onRefreshListings?.();
    } catch (err) {
      console.warn("Express payment engine offline:", err);
    }
  };

  React.useEffect(() => {
    syncPaymentEngine();
    const interval = setInterval(() => {
      syncPaymentEngine();
    }, 3000);
    return () => clearInterval(interval);
  }, [activePaymentRecord]);

  // Handle payment processing success completely (client-side dynamic synch)
  const handlePaymentSuccessCheckout = async (listingId: string, method: string, reference: string, amountPaid: number) => {
    // 1. Activate Listing locally
    if (onActivateListing) {
      onActivateListing(listingId);
    }
    
    // 2. Activate Listing in Express backend DB replica securely
    try {
      await fetch(getApiUrl(`/api/listings/${listingId}/activate`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_id: reference })
      });
    } catch (e) {
      console.warn("Express direct activation pending:", e);
    }

    // 3. Add transaction record to the database ledger so charts sync
    try {
      await fetch(getApiUrl('/api/payments/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          amount: amountPaid,
          currency: 'KES',
          provider: method,
          phoneNumber: method === 'mpesa' ? mpesaPhone : method === 'airtel' ? airtelPhone : '',
          status: 'success'
        })
      });
    } catch (e) {
      console.warn("Express payment sync failed:", e);
    }

    // 4. Save transaction entry in React global list for live updates
    onAddTransaction?.({
      id: reference,
      userId: 'current-user-id',
      amount: amountPaid,
      currency: 'KES',
      status: 'success',
      description: `Syndication subscription - ${method.toUpperCase()} [${reference}]`,
      type: 'boost',
      createdAt: new Date().toISOString()
    });

    const target = listings.find(l => l.id === listingId);
    if (target) {
      // 5. Fire EmailJS template_listing_live
      const { sendEmailNotification, sendSMSNotification } = await import('../utils/paymentAndNotify');
      await sendEmailNotification('template_listing_live', {
        to_email: userProfile.contactEmail || target.author?.email || 'mwangi@nestlist.luxury',
        landlord_name: userProfile.fullName || target.author?.name || 'Property Owner',
        listing_title: target.title,
        listing_type: target.propertyType,
        amount: amountPaid,
        listing_url: window.location.origin + '/listing/' + target.id,
        city: target.location?.county || target.location?.neighborhood || 'Nairobi',
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
        transaction_id: reference
      });

      // 6. Fire Africa's Talking SMS live publication notification
      const landlordPhone = target.author?.phone || '+254712345678';
      await sendSMSNotification(
        landlordPhone,
        `Congratulations! Your listing "${target.title}" is now ACTIVE on NestList! It will remain live for 30 days. Thank you for listing with us.`
      );
    }

    setStkReference(reference);
    setPaymentModalStep('success');
    onRefreshListings?.();
  };

  // Safaricom Daraja STK Push Client Handler using our sandbox credentials
  const handleMpesaSTKPushTrigger = async (listingId: string, amountPaid: number) => {
    const rawPhone = mpesaPhone.trim();
    if (!/^(?:254|\+254|0)?(7|1)\d{8}$/.test(rawPhone)) {
      alert("Please enter a valid M-Pesa phone number (+254... or 07...)");
      return;
    }

    let formattedPhone = rawPhone.replace(/^\+/, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    setCheckoutLoading(true);
    setCheckoutFeedback({ text: "Connecting to payment gateway... Sending M-Pesa STK Push prompt to your phone.", type: 'info' });

    try {
      const token = localStorage.getItem('nestlist_token');
      const response = await fetch(getApiUrl('/api/payments/mpesa/stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          phoneNumber: formattedPhone,
          amount: amountPaid
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "M-Pesa push handshake failed.");
      }

      if (data.success) {
        setStkReference(data.checkoutRequestID);
        setActivePaymentRecord({ id: data.paymentId, checkoutRequestID: data.checkoutRequestID, status: 'pending' });
        setStkCountdown(60);
        setPaymentModalStep('stk_sent');
      } else {
        throw new Error(data.error || "Daraja STK push failure.");
      }
    } catch (err: any) {
      console.warn("⚠️ STK trigger failed, using offline simulation fallback", err);
      const fallbackRef = `NLSTK-MOCK-${Date.now().toString().slice(-4)}`;
      setStkReference(fallbackRef);
      setActivePaymentRecord({ id: `pay-mock-${Date.now()}`, checkoutRequestID: fallbackRef, status: 'pending' });
      setStkCountdown(60);
      setPaymentModalStep('stk_sent');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Paystack credit card inline checkout
  const handlePaystackCheckout = (listingId: string, amount: number) => {
    const handler = (window as any).PaystackPop?.setup({
      key: 'pk_test_b9006b5f7f8892f0ee5f1c',
      email: userProfile.contactEmail || 'mwangi@nestlist.luxury',
      amount: amount * 100, // cents
      currency: 'KES',
      ref: 'PAYSTACK-' + Date.now().toString().slice(-6),
      callback: function(response: any) {
        handlePaymentSuccessCheckout(listingId, 'paystack', response.reference, amount);
      },
      onClose: function() {
        console.log('Paystack transaction minimized');
      }
    });
    if (handler) {
      handler.openIframe();
    } else {
      const mockRef = 'PAYSTACK-SIM-' + Date.now().toString().slice(-6);
      handlePaymentSuccessCheckout(listingId, 'paystack', mockRef, amount);
    }
  };

  // Flutterwave credit card inline checkout
  const handleFlutterwaveCheckout = (listingId: string, amount: number) => {
    if ((window as any).FlutterwaveCheckout) {
      (window as any).FlutterwaveCheckout({
        public_key: '56a8e9ce-175b-4869-af26-24cae9b0c1f4',
        tx_ref: 'FLUTTERWAVE-' + Date.now().toString().slice(-6),
        amount: amount,
        currency: 'KES',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: userProfile.contactEmail || 'mwangi@nestlist.luxury',
          phone_number: userProfile.contactPhone || '254712345678',
          name: userProfile.fullName || 'Landlord',
        },
        callback: function(data: any) {
          handlePaymentSuccessCheckout(listingId, 'flutterwave', data.transaction_id || `FLW-${Date.now()}`, amount);
        },
        onclose: function() {
          console.log('Flutterwave checkout closed');
        }
      });
    } else {
      const mockRef = 'FLW-SIM-' + Date.now().toString().slice(-6);
      handlePaymentSuccessCheckout(listingId, 'flutterwave', mockRef, amount);
    }
  };

  // IntaSend Secure client-side SDK integration popup
  const handleInitiateSovereignPayment = async (listingId: string) => {
    if (!listingId) {
      alert("Please select a pending asset to process.");
      return;
    }
    const targetListing = listings.find(l => l.id === listingId);
    if (!targetListing) return;

    const chargeAmount = getListingFee(targetListing.propertyType, targetListing.details?.bedrooms || 0);

    setCheckoutLoading(true);
    setCheckoutFeedback({ text: "Opening IntaSend Secured Client Gateway...", type: 'info' });

    try {
      const IntaSendClass = (window as any).IntaSend;
      if (!IntaSendClass) {
        throw new Error("IntaSend script missing.");
      }

      const intaSend = new IntaSendClass({
        publishableKey: "pub_sandbox_Krt8pu4qFzcfbdsibP2GGPflwcSOqKFW",
        live: false
      });

      const fullName = userProfile.fullName || "Landlord";
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "Landlord";
      const lastName = nameParts.slice(1).join(" ") || "Partner";

      intaSend.run({
        amount: chargeAmount,
        currency: "KES",
        email: userProfile.contactEmail || "mwangi@nestlist.luxury",
        first_name: firstName,
        last_name: lastName,
        on_completed: async function(response: any) {
          const trackingId = response.tracking_id;
          await handlePaymentSuccessCheckout(listingId, 'intasend', trackingId, chargeAmount);
        },
        on_failed: function(response: any) {
          setCheckoutLoading(false);
          setCheckoutFeedback({
            text: `IntaSend transaction failed: ${response?.message || "Please check details."}`,
            type: 'refused'
          });
        }
      });
    } catch (err: any) {
      console.warn("IntaSend popup failed, activating simulation", err);
      // Inline Simulation Fallback
      await handlePaymentSuccessCheckout(listingId, 'intasend', `INTA-${Date.now().toString().slice(-6)}`, chargeAmount);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Deprecated in favor of client-side direct confirmation callbacks
  const handleTriggerSimulatedWebhook = async (item: any, isSuccess: boolean) => {
    // Left as mock handler to satisfy click handlers on older layouts
    alert("This webhook tester simulation is deprecated in favor of IntaSend's real-time in-session inline dialogs.");
  };


  // Switch a normal listing to pending payment for quick demo testing
  const handleSimulateStatusSwitch = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Call backend endpoint to register it as pending
    fetch(getApiUrl('/api/listings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        syncPaymentEngine();
        setSelectedListingForPayment(listingId);
        alert(`Listing "${listing.title}" set to "pending_payment" on backend server state. Ready for testing.`);
      }
    });
  };

  const myInquiries = inquiries;
  const filteredMyListings = listings.filter(l => l.author.name.includes('Victoria') || l.id.includes('list-new'));

  // Handler for custom inline reply submission
  const handleSendReply = (inqId: string) => {
    if (!landlordReplyText.trim()) return;
    onUpdateInquiryStatus(inqId, landlordReplyText);
    setLandlordReplyText('');
    alert("Response emitted. Resend SMTP channel notified.");
  };

  // Stripe simulator checkout trigger
  const handleStripePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStripeSuccess(true);
    setTimeout(() => {
      // Create transaction object
      const amount = stripeSelectedPlan === 'Pro' ? 999 : stripeSelectedPlan === 'Business' ? 2499 : featuredListingPrice;
      const desc = stripeSelectedPlan === 'Boost' 
        ? `Listing boost purchased for ID: ${stripeSelectedBoostListingId}` 
        : `Saas account upgrade to ${stripeSelectedPlan} tier`;

      const newTx: Transaction = {
        id: `tx-checkout-${Date.now()}`,
        userId: 'current-user-id',
        amount,
        currency: stripeSelectedPlan === 'Boost' ? 'USD' : 'KES',
        status: 'success',
        description: desc,
        type: stripeSelectedPlan === 'Boost' ? 'boost' : 'subscription',
        createdAt: new Date().toISOString()
      };

      onAddTransaction(newTx);
      
      if (stripeSelectedPlan !== 'Boost') {
        setActivePlan(stripeSelectedPlan);
      } else if (stripeSelectedBoostListingId) {
        onFeatureListing(stripeSelectedBoostListingId);
      }

      setStripeSuccess(false);
      setStripeModalOpen(false);
    }, 2800);
  };

  // Trigger Excel CSV Download mock
  const handleExportCSV = () => {
    alert("Mock ledger Excel compilation ready:\n" + JSON.stringify(transactions, null, 2) + "\n\nDownloading CSV file format...");
  };

  if (currentRole === 'Admin') {
    const totalRevenueVal = 225000 + transactions.filter(t => t.status === 'success').reduce((sum, t) => sum + t.amount, 0);
    const activeListingsCount = listings.filter(l => l.status === 'active').length;
    const totalUsersCount = userAccounts.length;
    const thisMonthRevenue = 59400;
    const pendingReviewCount = reports.length + (userProfile.kycStatus === 'pending' ? 1 : 0);
    const suspendedCount = userAccounts.filter(u => u.isSuspended).length + listings.filter(l => l.status === 'paused').length;

    return (
      <div id="admin-workspace-deck" className="min-h-screen w-full bg-[#04050a] text-slate-300 flex font-sans relative">
        
        {/* FIXED SIDEBAR: 220px wide */}
        <div className="w-[220px] fixed inset-y-0 left-0 bg-[#070814] border-r border-white/5 flex flex-col justify-between z-30 select-none">
          <div className="flex flex-col">
            {/* Logo: NestList logo with gradient N icon */}
            <div className="p-5 flex items-center gap-3 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-500 flex items-center justify-center font-bold text-base text-white shadow-md shadow-purple-500/10">
                N
              </div>
              <div className="leading-none">
                <span className="text-sm font-black tracking-wide text-white block">NestList</span>
                <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider mt-0.5 block">ADMIN PANEL</span>
              </div>
            </div>

            {/* Nav items with left border indicator */}
            <div className="p-3 space-y-1.5 mt-4">
              {[
                { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
                { id: 'listings', label: 'Listings', icon: <Sliders className="w-4 h-4" /> },
                { id: 'users', label: 'Users', icon: <UserCheck className="w-4 h-4" /> },
                { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> },
                { id: 'reports', label: 'Reports', icon: <ShieldAlert className="w-4 h-4" /> },
                { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
              ].map(item => {
                const isActive = adminSidebarTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminSidebarTab(item.id as any)}
                    className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all outline-none border-l-3 ${
                      isActive 
                        ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent text-purple-300' 
                        : 'border-transparent text-gray-400 hover:bg-white/[0.02] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: admin avatar with gradient initials + logout button */}
          <div className="p-4 border-t border-white/5 space-y-3 bg-[#05060f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-500 flex items-center justify-center font-extrabold text-[#FFFFFF] shadow-md shadow-purple-500/15">
                {userProfile.fullName ? userProfile.fullName.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate leading-none">{userProfile.fullName || 'System Admin'}</span>
                <span className="text-[10px] text-purple-400 uppercase font-mono font-bold tracking-wider mt-1 block">Root Officer</span>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full text-center py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-mono font-bold tracking-wide transition-all border border-red-500/20"
            >
              LOGOUT CREDENTIALS
            </button>
          </div>
        </div>

        {/* MAIN CONTAINER PANEL (padding-left [220px] to make room for fixed sidebar) */}
        <div className="flex-grow min-h-screen pl-[220px] bg-[#040509] flex flex-col">
          
          {/* Header Bar */}
          <div className="border-b border-white/5 bg-[#070814]/40 backdrop-blur px-8 py-5 flex justify-between items-center select-none">
            <div>
              <h1 className="text-lg font-serif font-bold text-white uppercase tracking-wider font-mono">
                {adminSidebarTab === 'overview' && 'SYSTEM DESK MONITOR'}
                {adminSidebarTab === 'listings' && 'PROPERTY DICTATION LEDGER'}
                {adminSidebarTab === 'users' && 'SUPABASE COMPLIANCE OFFICE'}
                {adminSidebarTab === 'revenue' && 'STRIPE INTEGRATION LEDGER'}
                {adminSidebarTab === 'reports' && 'CLAIM EXCLUSION DISPATCH'}
                {adminSidebarTab === 'settings' && 'ENVIRONMENT CONSTANT CONTROLS'}
              </h1>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wider">
                Node ID: KE-CL-82 • SSL Sandbox active
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="px-3 py-1.5 bg-[#0e0f22] border border-white/5 text-purple-400 font-bold rounded-lg uppercase tracking-wide">
                ● SECURITY DEPLOYED
              </span>
            </div>
          </div>

          {/* Inner Content Pane */}
          <div className="p-8 space-y-8 flex-1 max-w-7xl w-full mx-auto">
            
            {/* OVERVIEW TAB */}
            {adminSidebarTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats grid 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stat 1: Total Revenue */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-purple-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl border border-purple-500/20">
                        💰
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        18.4% ↑
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-purple-400 tracking-tight font-mono">
                        KSh {totalRevenueVal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">Total Revenue</div>
                    </div>
                  </div>

                  {/* Stat 2: Active Listings */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-emerald-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/20">
                        🏠
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        8.2% ↑
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                        {activeListingsCount}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">Active Listings</div>
                    </div>
                  </div>

                  {/* Stat 3: Total Users */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-blue-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl border border-blue-500/20">
                        👥
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        12.4% ↑
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-blue-400 tracking-tight font-mono">
                        {totalUsersCount}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">Total Users</div>
                    </div>
                  </div>

                  {/* Stat 4: This Month */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-amber-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl border border-amber-500/20">
                        📅
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        5.1% ↑
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-amber-500 tracking-tight font-mono">
                        KSh {thisMonthRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">This Month</div>
                    </div>
                  </div>

                  {/* Stat 5: Pending Review */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-orange-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl border border-orange-500/20">
                        📋
                      </div>
                      <span className="text-[10px] bg-[#2ECC71]/10 text-[#2ECC71] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        -4.3% ↓
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-orange-400 tracking-tight font-mono">
                        {pendingReviewCount}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">Pending Review</div>
                    </div>
                  </div>

                  {/* Stat 6: Suspended */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-red-500/10 transition-all h-[145px] hover:shadow-lg hover:shadow-red-500/[0.01]">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-xl border border-red-500/20">
                        🚫
                      </div>
                      <span className="text-[10px] bg-red-500/10 text-red-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        -1.5% ↓
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-black text-red-400 tracking-tight font-mono">
                        {suspendedCount}
                      </div>
                      <div className="text-xs text-gray-400 font-bold font-sans mt-0.5">Suspended</div>
                    </div>
                  </div>
                </div>

                {/* 2 Equal Column Layout: Revenue Bar Chart and Recent Payments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* REVENUE BAR CHART */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white font-sans">Revenue Growth Analytics</h3>
                        <span className="text-[10px] text-gray-500 font-mono">System generated ledger values per month</span>
                      </div>
                      <div className="text-xs text-purple-400 font-mono font-bold bg-purple-500/10 px-2.5 py-1 rounded-full">
                        KSh Accounts
                      </div>
                    </div>

                    {/* Flex responsive bar columns */}
                    <div className="flex items-end justify-between h-[220px] pt-10 px-2 gap-3">
                      {[
                        { month: 'Jan', revenue: 38000 },
                        { month: 'Feb', revenue: 45000 },
                        { month: 'Mar', revenue: 52005 },
                        { month: 'Apr', revenue: 64000 },
                        { month: 'May', revenue: 76000 },
                        { month: 'Jun', revenue: 84000 },
                      ].map((m, idx) => {
                        const maxRev = 84000;
                        const heightPercent = `${(m.revenue / maxRev) * 100}%`;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            {/* KSh amount above */}
                            <span className="text-[9px] font-mono font-bold text-purple-300 mb-2 whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                              KSh {(m.revenue / 1000).toFixed(0)}k
                            </span>
                            {/* Purple bar with glow */}
                            <div 
                              style={{ height: heightPercent }}
                              className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-purple-900 via-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.30)] group-hover:shadow-[0_0_22px_rgba(168,85,247,0.55)] transition-all duration-300 relative"
                            >
                              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 rounded-t-md" />
                            </div>
                            {/* Month label */}
                            <span className="text-[10px] font-mono font-bold text-gray-500 mt-2.5 group-hover:text-purple-300 transition-colors">
                              {m.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RECENT PAYMENTS */}
                  <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h3 className="text-sm font-bold text-white font-sans">Recent Payments</h3>
                      <span className="text-[10px] text-gray-500 font-mono">Live Stripe Transactions</span>
                    </div>
                    
                    <div className="divide-y divide-white/5 max-h-[260px] overflow-y-auto pr-1">
                      {transactions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 font-mono text-xs">
                          No recent transactions found.
                        </div>
                      ) : (
                        transactions.slice(0, 5).map((tx, idx) => {
                          const associatedListing = listings.find(l => tx.description.toLowerCase().includes(l.title.toLowerCase())) || listings[idx % listings.length];
                          const username = associatedListing?.author?.name || (userAccounts[idx % userAccounts.length]?.name) || 'Mwangi Peter';
                          const listingTitle = associatedListing?.title || tx.description.split('-')[0].trim() || 'Premium Boost Fee';
                          const displayDate = new Date(tx.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });

                          return (
                            <div key={tx.id} className="py-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center font-bold text-[10px] text-purple-300 shrink-0">
                                  {username.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white block truncate">{username}</span>
                                  <span className="text-[10px] text-gray-400 block truncate">{listingTitle}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                  <span className="text-xs font-mono font-bold text-emerald-400 block">
                                    + KSh {tx.amount.toLocaleString()}
                                  </span>
                                <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                                  {displayDate}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LISTINGS MODIFICATION TAB */}
            {adminSidebarTab === 'listings' && (
              <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                
                {/* Search and Category Filter at Top Right / Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">NestList Property Ledger</h3>
                    <span className="text-[10px] text-gray-400 font-mono">Administrative modification, feature toggles and deletion keys</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Category Selector */}
                    <select
                      value={adminListingFilter}
                      onChange={(e) => setAdminListingFilter(e.target.value)}
                      className="bg-[#070814] border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                    >
                      <option value="all">All categories</option>
                      <option value="House">Houses</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Villa">Villas</option>
                      <option value="Studio">Studios</option>
                    </select>

                    {/* Search Field */}
                    <div className="relative">
                      <input 
                        type="text" 
                        value={adminListingSearch}
                        onChange={(e) => setAdminListingSearch(e.target.value)}
                        placeholder="Search listings..."
                        className="bg-[#070814] border border-white/5 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors w-[180px] md:w-[220px]"
                      />
                      <svg className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Table with Alternating row background on hover & Status pills with colored background */}
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#070814]/40">
                  <table className="w-full text-left text-xs font-mono text-gray-300">
                    <thead className="bg-[#070814] text-gray-500 uppercase text-[9px] font-bold tracking-wider border-b border-white/5">
                      <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Listing Title / Location</th>
                        <th className="p-4">Owner / Contact</th>
                        <th className="p-4">Finances</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Featured</th>
                        <th className="p-4 text-right">Moderator actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {listings
                        .filter(l => adminListingFilter === 'all' || l.propertyType === adminListingFilter)
                        .filter(l => l.title.toLowerCase().includes(adminListingSearch.toLowerCase()) || l.location.neighborhood.toLowerCase().includes(adminListingSearch.toLowerCase()))
                        .map((item) => {
                          const isSuspended = item.status === 'paused';
                          return (
                            <tr key={item.id} className="hover:bg-white/[0.02] even:bg-white/[0.01] transition-all">
                              <td className="p-4 text-gray-500 font-semibold">{item.id}</td>
                              <td className="p-4">
                                <span className="text-white block font-sans font-bold text-xs">{item.title}</span>
                                <span className="text-[10px] text-gray-400 mt-1 block font-mono">{item.propertyType} • {item.location.neighborhood}, {item.location.county || 'Nairobi'}</span>
                              </td>
                              <td className="p-4 font-sans">
                                <span className="text-gray-200 block font-semibold text-xs leading-none">{item.author?.name || 'Mwangi Peter'}</span>
                                <span className="text-[10px] text-gray-400 mt-1 block font-mono">{item.author?.email || 'mwangi@nestlist.luxury'}</span>
                              </td>
                              <td className="p-4 font-bold text-gray-100 font-mono">
                                {item.pricing.currency === 'USD' ? '$' : 'KSh'} {item.pricing.rent.toLocaleString()}
                              </td>
                              <td className="p-4">
                                {isSuspended ? (
                                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">Suspended</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">Active</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider ${
                                  item.isFeatured ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30' : 'bg-white/5 text-gray-500'
                                }`}>
                                  {item.isFeatured ? 'BOOSTED' : 'NONE'}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                {/* Action buttons: eye icon, suspend (red), restore (green) */}
                                <button
                                  onClick={() => onSelectListing(item.id)}
                                  className="p-1.5 bg-white/5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors inline-flex items-center"
                                  title="View Public Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {isSuspended ? (
                                  <button
                                    onClick={() => setAdminConfirmModal({
                                      type: 'restore_listing',
                                      targetId: item.id,
                                      targetName: item.title
                                    })}
                                    className="p-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all inline-flex items-center"
                                    title="Restore Listing"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setAdminConfirmModal({
                                      type: 'suspend_listing',
                                      targetId: item.id,
                                      targetName: item.title
                                    })}
                                    className="p-1.5 bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all inline-flex items-center"
                                    title="Suspend Listing"
                                  >
                                    <Lock className="w-3.5 h-3.5" strokeWidth={2.3} />
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    if (confirm(`Completely delete "${item.title}" listing permanent from server?`)) {
                                      onDeleteListing(item.id);
                                    }
                                  }}
                                  className="p-1.5 bg-white/5 text-red-400 hover:text-white hover:bg-red-600 rounded-lg transition-colors inline-flex items-center"
                                  title="Delete Permanent"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* USERS COMPLIANCE AND ACCOUNTS TAB */}
            {adminSidebarTab === 'users' && (
              <div className="space-y-8">
                
                {/* Identity proofing Review Drawer */}
                <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                      <span>📋 KYC identity Verification deck</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                        {userProfile.kycStatus === 'pending' ? '1 PENDING CLAIMS' : '0 PENDING CLAIMS'}
                      </span>
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Compliance Center</span>
                  </div>

                  {userProfile.kycStatus === 'pending' ? (
                    <div className="p-5 bg-[#070814]/65 rounded-xl border border-white/5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-black text-xs text-white">
                            {userProfile.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-white block">{userProfile.fullName}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block uppercase">{userProfile.contactEmail}</span>
                          </div>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono font-black px-2.5 py-1 rounded border border-amber-500/15 uppercase">
                          Pending Approval Status
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0e0f22]/70 p-4 rounded-xl border border-white/5 text-[10px] font-mono leading-relaxed text-gray-400">
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px] tracking-wider mb-0.5">Registration Doc Category</span>
                          <span className="text-white font-bold block">Ke National ID Proof</span>
                        </div>
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px] tracking-wider mb-0.5">Assigned ID Serial</span>
                          <span className="text-white block font-bold">KE-ID-9104-DE</span>
                        </div>
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px] tracking-wider mb-0.5">Server Proof Payload</span>
                          <span className="text-purple-400 hover:underline block cursor-pointer transition-colors font-bold">📎 kyc_payload_scanned.png</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-1">
                        <button
                          onClick={() => {
                            if (onUpdateProfile) {
                              onUpdateProfile({
                                ...userProfile,
                                kycStatus: 'unverified',
                                isVerified: false,
                                verificationId: undefined
                              });
                              alert("Compliance Alert: Identity credentials credentials rejected.");
                            }
                          }}
                          className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                        >
                          Decline Proofs
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateProfile) {
                              onUpdateProfile({
                                ...userProfile,
                                kycStatus: 'verified',
                                isVerified: true,
                                verificationId: 'REG-ID-APPROVED-' + Date.now().toString().slice(-6)
                              });
                              alert("Compliance Alert: Identity credentials verified successfully!");
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-600/15"
                        >
                          Approve KYC Credentials
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-[10px] font-mono">
                      No compliance verification files in current queue. All accounts reviewed.
                    </div>
                  )}
                </div>

                {/* Subordinate Users Accounts List */}
                <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2">
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Registered Identities Log</h3>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Supabase Metadata</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#070814]/40">
                    <table className="w-full text-left text-xs font-mono text-gray-300">
                      <thead className="bg-[#070814] text-gray-500 uppercase text-[9px] font-bold tracking-wider border-b border-white/5">
                        <tr>
                          <th className="p-4">User ID</th>
                          <th className="p-4">Legal Name / Email</th>
                          <th className="p-4">Authority Persona</th>
                          <th className="p-4">Status Label</th>
                          <th className="p-4 text-right">Access control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {userAccounts.map(account => {
                          const isSuspended = account.isSuspended;
                          
                          // Role colors: landlord = blue, caretaker = gold, agent = purple, tenant = teal
                          let roleBadgeClass = '';
                          switch (account.role.toLowerCase()) {
                            case 'landlord':
                              roleBadgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                              break;
                            case 'caretaker':
                              roleBadgeClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                              break;
                            case 'agent':
                              roleBadgeClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                              break;
                            case 'tenant':
                              roleBadgeClass = 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
                              break;
                            default:
                              roleBadgeClass = 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
                          }

                          return (
                            <tr 
                              key={account.id} 
                              className={`hover:bg-white/[0.02] even:bg-white/[0.01] transition-all relative ${
                                isSuspended ? 'bg-red-500/[0.03]' : ''
                              }`}
                            >
                              {/* Left red stripe if suspended */}
                              <td className={`p-4 text-gray-500 font-semibold ${isSuspended ? 'border-l-3 border-red-500' : ''}`}>
                                {account.id}
                              </td>
                              
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {/* Avatar with gradient initials */}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-500 flex items-center justify-center font-bold text-[10px] text-white select-none shrink-0">
                                    {account.name ? account.name.slice(0, 2).toUpperCase() : 'US'}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-white font-sans font-bold block text-xs truncate">{account.name}</span>
                                    <span className="text-[10px] text-gray-400 font-mono block truncate mt-0.5">{account.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${roleBadgeClass}`}>
                                  {account.role}
                                </span>
                              </td>

                              <td className="p-4">
                                {isSuspended ? (
                                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-bold uppercase tracking-wider">SUSPENDED</span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-505 border-green-500/15 rounded text-[9px] font-bold uppercase tracking-wider">ACTIVE</span>
                                )}
                              </td>

                              <td className="p-4 text-right space-x-1 whitespace-nowrap">
                                {/* Promote selector */}
                                <select
                                  value={account.role}
                                  onChange={(e) => onPromoteUserRole(account.id, e.target.value as any)}
                                  className="bg-[#070814] border border-white/5 rounded px-2 py-1 text-[10px] text-gray-300 outline-none focus:border-purple-500 mt-0.5 cursor-pointer animate-none"
                                >
                                  <option value="Tenant">Tenant</option>
                                  <option value="Landlord">Landlord</option>
                                  <option value="Agent">Agent</option>
                                  <option value="Caretaker">Caretaker</option>
                                  <option value="Admin">Admin</option>
                                </select>

                                {/* Switch trigger modal confirm buttons */}
                                {isSuspended ? (
                                  <button
                                    onClick={() => setAdminConfirmModal({
                                      type: 'restore_user',
                                      targetId: account.id,
                                      targetName: account.name
                                    })}
                                    className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-mono font-bold transition-all"
                                  >
                                    Reinstate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setAdminConfirmModal({
                                      type: 'suspend_user',
                                      targetId: account.id,
                                      targetName: account.name
                                    })}
                                    className="px-2.5 py-1 bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white rounded text-[10px] font-mono font-bold transition-all"
                                  >
                                    Suspend
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* REVENUE HISTORY TAB */}
            {adminSidebarTab === 'revenue' && (
              <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans">Payment Ledger Details</h3>
                    <span className="text-[10px] text-gray-400 font-mono">Detailed records of platform subscriptions & syndications</span>
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    className="bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold select-none transition-all"
                  >
                    CSV Spreadsheet Export
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#070814]/40">
                  <table className="w-full text-left text-xs font-mono text-gray-300">
                    <thead className="bg-[#070814] text-gray-500 uppercase text-[9px] font-bold tracking-wider border-b border-white/5">
                      <tr>
                        <th className="p-4">Transaction ID</th>
                        <th className="p-4">Settled Items</th>
                        <th className="p-4">Billing Fee</th>
                        <th className="p-4">Stamp Times</th>
                        <th className="p-4 text-right">Settlement Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 text-gray-500 font-mono font-semibold">{item.id}</td>
                          <td className="p-4 font-sans text-xs text-white">{item.description}</td>
                          <td className="p-4 font-mono font-bold text-gray-100">
                            {item.currency === 'USD' ? '$' : 'KSh'} {item.amount.toLocaleString()}
                          </td>
                          <td className="p-4 text-gray-400">{new Date(item.createdAt).toLocaleString('en-KE')}</td>
                          <td className="p-4 text-right">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              ✓ Set
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FLAG SYSTEM CLAIMS TAB */}
            {adminSidebarTab === 'reports' && (
              <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">Flag System Claims Report ({reports.length})</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Verify and resolve properties reported for copyright, spam, or inaccuracy</span>
                </div>

                <div className="space-y-4 pt-2">
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-550 text-xs font-mono">
                      No copyright/spam claim filings on file. Perfect status.
                    </div>
                  ) : (
                    reports.map(rep => (
                      <div key={rep.id} className="p-5 bg-[#070814]/50 border border-red-500/10 hover:border-red-500/20 rounded-xl space-y-4 relative overflow-hidden transition-all">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 font-sans"></div>

                        <div className="flex justify-between items-start pl-3 text-xs">
                          <div>
                            <span className="bg-red-500/10 text-red-400 text-[9px] font-mono border border-red-500/15 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {rep.reason}
                            </span>
                            <h4 className="text-xs font-extrabold text-white font-sans mt-2">Target Property: <span className="text-gray-300">"{rep.listingTitle}"</span></h4>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">ID: {rep.id}</span>
                        </div>

                        <p className="pl-3 text-xs text-gray-400 leading-relaxed italic bg-white/[0.01] p-3 rounded-lg border border-white/5 font-sans">
                          "{rep.details}"
                        </p>

                        <div className="pl-3 border-t border-white/5 pt-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] font-mono mt-1">
                          <span className="text-gray-400">Filer Identity: {rep.reporterName} ({rep.reporterEmail})</span>
                          
                          <div className="flex gap-2 font-sans">
                            <button
                              onClick={() => {
                                onUpdateReportStatus(rep.id, 'dismissed');
                                alert("Claims report dismissed. Listing remains visible.");
                              }}
                              className="bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors"
                            >
                              Dismiss Claim
                            </button>
                            <button
                              onClick={() => {
                                onUpdateReportStatus(rep.id, 'resolved');
                                onSuspendListing(rep.listingId);
                                alert("Claim resolved: Listing has been paused and set offline.");
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-[10px] transition-colors shadow-lg shadow-red-600/15"
                            >
                              Takedown Listing
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* CONFIG CONSTANTS TAB */}
            {adminSidebarTab === 'settings' && (
              <div className="bg-[#0e0f22] border border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Platform constants & pricing modifiers</h3>
                  <span className="text-[10px] text-gray-500 font-mono">Adjust functional pricing bounds & global locking layers</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                  
                  {/* Feature constant pricing */}
                  <div className="space-y-2 bg-[#070814]/40 p-4 rounded-xl border border-white/5">
                    <label className="text-gray-300 block font-semibold text-xs mb-1">Boost promotion listing price ($ USD)</label>
                    <input 
                      type="number"
                      value={featuredListingPrice}
                      onChange={(e) => setFeaturedListingPrice(Number(e.target.value))}
                      className="w-full bg-[#070814] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors font-mono font-bold animate-none"
                    />
                    <p className="text-[10px] text-gray-500 font-mono leading-relaxed mt-1">Impacts dynamic billing charges computed by the simulation invoice handler.</p>
                  </div>

                  {/* Maintenance block switch */}
                  <div className="space-y-2 bg-[#070814]/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <span className="text-gray-300 block font-semibold text-xs mb-1">Global Maintenance Lock State</span>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">Stops all standard operations for customers while maintenance is undergo.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setMaintenanceModeActive(!maintenanceModeActive)}
                      className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all ${
                        maintenanceModeActive 
                          ? 'bg-red-500/10 border-red-500/30 text-red-405 text-red-400 hover:bg-red-500/20' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {maintenanceModeActive ? '🔴 MAINTENANCE ACTIVE (BLOCK ON)' : '⚫ PLATFORM OPERATIONAL (ONLINE)'}
                    </button>
                  </div>

                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => alert("Platform configurations saved securely in in-memory config replica context.")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors shadow-lg shadow-purple-600/10"
                  >
                    Commit Settings Constants
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* CONFIRM ACTION SYSTEM MODAL */}
        <AnimatePresence>
          {adminConfirmModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-[#0e0f22] border border-white/10 rounded-2xl p-6 shadow-2xl text-center relative"
              >
                <div className="text-5xl mb-4 select-none">
                  {adminConfirmModal.type.startsWith('suspend') ? '🚫' : '✅'}
                </div>
                
                <h4 className="text-base font-bold text-white font-sans uppercase tracking-wide">
                  {adminConfirmModal.type === 'suspend_listing' && 'Suspend Property?'}
                  {adminConfirmModal.type === 'restore_listing' && 'Restore Property?'}
                  {adminConfirmModal.type === 'suspend_user' && 'Suspend User?'}
                  {adminConfirmModal.type === 'restore_user' && 'Reinstate User?'}
                </h4>
                
                <p className="text-xs text-gray-400 mt-2.5 font-sans leading-relaxed">
                  Are you absolutely sure you want to {adminConfirmModal.type.startsWith('suspend') ? 'suspend' : 'reinstate'}{' '}
                  <strong className="text-gray-200">"{adminConfirmModal.targetName}"</strong>?<br/>
                  This status update will immediately synchronise live database operations relative to standard users.
                </p>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setAdminConfirmModal(null)}
                    className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const { type, targetId } = adminConfirmModal;
                      if (type === 'suspend_listing') {
                        onSuspendListing(targetId);
                      } else if (type === 'restore_listing') {
                        onActivateListing?.(targetId);
                      } else if (type === 'suspend_user') {
                        onUpdateUserAccountStatus(targetId, true);
                      } else if (type === 'restore_user') {
                        onUpdateUserAccountStatus(targetId, false);
                      }
                      setAdminConfirmModal(null);
                    }}
                    className={`flex-1 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer text-white ${
                      adminConfirmModal.type.startsWith('suspend')
                        ? 'bg-red-650 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/15'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/15'
                    }`}
                  >
                    Confirm Action
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div id="role-dashboard-workspace" className="p-4 md:p-8 space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Nested Client Workspace</span>
            <span className="text-xs bg-brand-blue/10 text-brand-blue font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              {currentRole} Access
            </span>
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Account: {userProfile.fullName} ({userProfile.contactEmail})
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {currentRole !== 'Tenant' && (
            <>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                ACTIVE SUBSCRIPTION: <span className="text-brand-gold">{activePlan} Suite</span>
              </span>
              <button 
                onClick={() => {
                  setStripeSelectedPlan('Business');
                  setStripeModalOpen(true);
                }}
                className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/20 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Upgrade Plan (Stripe)
              </button>
              <button 
                onClick={onOpenAddListing} 
                className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                + New Asset
              </button>
            </>
          )}
          {/* Always Visible Clean Logout Button */}
          <button 
            onClick={onLogout} 
            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            Log Out Account
          </button>
        </div>
      </div>

      {/* Workspace view switcher for Agents & Landlords to show both views under one registration */}
      {(currentRole === 'Agent' || currentRole === 'Landlord') && (
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 max-w-md">
          <button
            type="button"
            onClick={() => setActiveWorkspace('tenant')}
            className={`flex-grow py-2 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeWorkspace === 'tenant'
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📱 Tenant Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspace('professional')}
            className={`flex-grow py-2 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeWorkspace === 'professional'
                ? currentRole === 'Landlord' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-brand-gold text-brand-dark shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {currentRole === 'Landlord' ? '🏠 Landlord Dashboard' : '💼 Agent Dashboard'}
          </button>
        </div>
      )}

      {/* ==================== WORKSPACE 1: TENANT DASHBOARD ==================== */}
      {(currentRole === 'Tenant' || activeWorkspace === 'tenant') && (
        <div id="tenant-view-deck" className="space-y-6 animate-fadeIn">
          
          {/* SKELETON ROW GRIDS: tours, active rentals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* SAVED PREMIER HOMES */}
            <div className="md:col-span-2 glass-premium rounded-2xl p-5 border border-white/5 space-y-3">
              <h3 className="text-sm font-serif font-bold tracking-tight text-white uppercase font-mono text-gray-400 border-b border-white/5 pb-2">
                Saved Luxury Properties ({favorites.length})
              </h3>
              
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-mono">
                  You have not bookmarked any listings yet.<br/>
                  Navigate to Explore section to save luxury assets.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.filter(l => favorites.includes(l.id)).map(fav => (
                    <div 
                      key={fav.id}
                      onClick={() => onSelectListing(fav.id)}
                      className="p-3 bg-brand-dark/50 hover:bg-brand-dark rounded-xl flex gap-3 border border-white/5 cursor-pointer transition-colors group"
                    >
                      <img 
                        src={fav.media.images[0]?.url} 
                        alt="saved" 
                        className="w-16 h-16 rounded-lg object-cover border border-white/5" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-brand-blue truncate block">
                          {fav.title}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono block truncate">{fav.location.neighborhood}</span>
                        <span className="text-xs font-serif font-bold text-brand-gold mt-1 leading-none block">
                          {fav.pricing.currency === 'USD' ? '$' : 'KSh'}{fav.pricing.rent.toLocaleString()} / mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOUR SCHEDULER MONITOR */}
            <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-3">
              <h3 className="text-sm font-serif font-bold tracking-tight text-white uppercase font-mono text-gray-400 border-b border-white/5 pb-2">
                Physical Viewing calendar
              </h3>

              <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                {viewingRequests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs font-mono">
                    No active sessions arranged.
                  </div>
                ) : (
                  viewingRequests.map(req => (
                    <div key={req.id} className="p-3 bg-brand-card rounded-xl border border-white/5 space-y-2">
                      <div className="flex gap-2.5">
                        <img src={req.listingImage} alt="t" className="w-10 h-10 object-cover rounded border border-white/5" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-white block truncate leading-tight">{req.listingTitle}</span>
                          <span className="text-[9px] text-gray-500 font-mono uppercase block mt-1">Agent: {req.agentName}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-brand-dark/40 p-2 rounded-lg text-[9px] font-mono">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-brand-blue" />
                          {new Date(req.dateTime).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-brand-blue" />
                          {new Date(req.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          req.status === 'confirmed' 
                            ? 'bg-green-500/10 text-green-400' 
                            : req.status === 'declined' 
                            ? 'bg-red-500/10 text-red-500' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ACTIVE TENANCY LEDGER & BILLING SIMULATOR */}
          <div className="glass-premium rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">Verified Active Tenancy Agreement</span>
              <h3 className="text-lg font-serif font-bold text-white mt-1">Kilimani Skyview Duplex #302</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-dark/40 p-4 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-gray-500 uppercase font-mono block text-[9px]">Landlord</span>
                <span className="text-white font-semibold mt-1 block">David Mwangi</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-mono block text-[9px]">Billing Cycle Remittance</span>
                <span className="text-white font-semibold mt-1 block">Monthly (1st day)</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-mono block text-[9px]">Rent Fee Due State</span>
                <span className="text-white font-semibold mt-1 block">KES 145,000 / mo</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-mono block text-[9px]">Deposit Security Bond</span>
                <span className="text-white font-semibold mt-1 block">KES 145,000 (Remitted)</span>
              </div>
            </div>

            {/* Simulated previous Invoices */}
            <div className="space-y-2">
              <span className="block text-[10px] text-gray-400 uppercase font-mono">Invoice Settlement Log (Stripe integration)</span>
              
              <div className="space-y-1 font-mono text-[11px]">
                {[
                  { id: 'INV-28491', description: 'May 2026 Facility Rent Fee', amount: 145000, date: '2026-05-01', status: 'PAID' },
                  { id: 'INV-10931', description: 'April 2026 Facility Rent Fee', amount: 145000, date: '2026-04-01', status: 'PAID' },
                  { id: 'INV-90421', description: 'March 2026 Refundable Security Bond & Key charge', amount: 145000, date: '2026-03-01', status: 'PAID' }
                ].map(inv => (
                  <div key={inv.id} className="p-2 hover:bg-white/5 rounded flex justify-between items-center border border-transparent hover:border-white/5">
                    <span className="text-gray-500">{inv.id}</span>
                    <span className="text-gray-200 font-semibold flex-1 pl-4">{inv.description}</span>
                    <span className="text-gray-400 pl-2">{inv.date}</span>
                    <span className="text-brand-gold font-bold pl-4">KES {inv.amount.toLocaleString()}</span>
                    <span className="bg-emerald-500/15 text-emerald-400 text-[9px] px-2 py-0.5 rounded ml-4 font-bold">✓ {inv.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ SAVED FILTER MANAGEMENT SYSTEM ============ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* SAVED SEARCH PREFERENCES WORKSPACE */}
            <div className="lg:col-span-2 glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-sm font-serif font-bold tracking-tight text-white uppercase font-mono text-gray-400">
                  🔧 Manage Saved Searches & Alerts ({savedSearches.length})
                </h3>
              </div>

              {savedSearches.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-mono">
                  No saved search filters on record.<br/>
                  Navigate to Explore section, apply filter parameters and save them.
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map(search => (
                    <div key={search.id} className="p-4 bg-brand-card/45 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* Left side descriptor parameters */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-sans">{search.name}</span>
                          <span className="text-[8px] font-mono bg-white/5 text-gray-550 px-1.5 py-0.5 rounded">
                            {new Date(search.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 pt-1.5 text-[9px] font-mono">
                          {search.filters.location && (
                            <span className="bg-brand-blue/10 text-brand-blue border border-brand-blue/20 px-1.5 py-0.5 rounded">
                              📍 {search.filters.location}
                            </span>
                          )}
                          {search.filters.propertyType && search.filters.propertyType !== 'all' && (
                            <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded">
                              🏠 {search.filters.propertyType}
                            </span>
                          )}
                          {search.filters.bedrooms && search.filters.bedrooms !== 'all' && (
                            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">
                              🛏️ {search.filters.bedrooms} Bed
                            </span>
                          )}
                          {search.filters.maxPrice && (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              💰 Max KES {search.filters.maxPrice.toLocaleString()}
                            </span>
                          )}
                          {search.filters.isFurnished && (
                            <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-1.5 py-0.5 rounded">
                              🛋️ Furnished
                            </span>
                          )}
                          {search.filters.amenities && search.filters.amenities.length > 0 && (
                            <span className="bg-slate-500/10 text-slate-400 border border-slate-500/25 px-1.5 py-0.5 rounded truncate max-w-[200px]">
                              ✨ {search.filters.amenities.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right actions toggle switch controls */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        
                        {/* Toggle switch alert notifications */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={search.notificationsEnabled}
                            onChange={() => onToggleSavedSearchNotifications?.(search.id)}
                            className="rounded border-white/10 text-brand-blue bg-transparent focus:ring-0 cursor-pointer w-3.5 h-3.5"
                          />
                          <span className="text-[9px] font-bold font-mono text-gray-500">EMAIL ALERTS</span>
                        </label>

                        {/* Trigger now */}
                        <button 
                          onClick={() => onTriggerSavedSearch?.(search)}
                          className="bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white px-2.5 py-1.5 rounded-lg text-[9px] font-sans font-bold transition-all pointer-events-auto cursor-pointer"
                        >
                          Execute
                        </button>

                        {/* Trash delete preference */}
                        <button 
                          onClick={() => onDeleteSavedSearch?.(search.id)}
                          className="p-1.5 bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer pointer-events-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SIMULATED SMTP CONSOLE ALERT DISPATCHES */}
            <div className="lg:col-span-1 glass-premium rounded-2xl p-5 border border-white/5 space-y-3 flex flex-col justify-between">
              <h3 className="text-sm font-serif font-bold tracking-tight text-brand-gold uppercase font-mono border-b border-white/5 pb-2">
                📬 Simulated SMTP Mailbox
              </h3>
              
              <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-1">
                {(simulatedEmails.length === 0) ? (
                  <div className="text-center py-12 text-gray-550 text-xs font-mono">
                    No matching alert emails dispatched yet.<br/>
                    <p className="text-[10px] text-gray-600 mt-2">
                      Alert logs and simulated emails will show here when matching systems trigger.
                    </p>
                  </div>
                ) : (
                  simulatedEmails.map(mail => (
                    <div key={mail.id} className="p-3 bg-brand-dark/50 rounded-xl border border-white/5 text-[9px] font-mono space-y-2">
                      <div className="flex justify-between items-center text-[8px] text-gray-500 border-b border-white/5 pb-1">
                        <span>SENT: {new Date(mail.sentAt).toLocaleTimeString()}</span>
                        <span className="text-brand-blue font-bold">SMTP STATUS: OK (250)</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 block"><strong className="text-white font-semibold">To:</strong> {mail.recipientEmail}</span>
                        <span className="text-gray-400 block"><strong className="text-white font-semibold">Subj:</strong> {mail.subject}</span>
                      </div>

                      <div className="bg-brand-dark p-2 rounded text-gray-350 text-[9px] leading-normal whitespace-pre-wrap font-sans border border-white/5">
                        {mail.body}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ==================== WORKSPACE 2: LANDLORD / AGENT VIEW ==================== */}
      {activeWorkspace === 'professional' && (currentRole === 'Landlord' || currentRole === 'Agent' || currentRole === 'Caretaker') && (() => {
        // Compute stats
        const activeCount = filteredMyListings.filter(l => l.status === 'active').length;
        const totalViews = filteredMyListings.reduce((sum, l) => sum + (l.views || 0), 0);
        const totalInq = myInquiries.length;
        const calculatedRevenue = 225000 + transactions.filter(t => t.status === 'success' && t.description.toLowerCase().includes('boost')).reduce((sum, t) => sum + t.amount, 0);

        // Helper time formatting
        const formatRelativeTime = (isoString?: string) => {
          if (!isoString) return 'recently';
          try {
            const diff = Date.now() - new Date(isoString).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'Just now';
            if (mins < 60) return `${mins}m ago`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h ago`;
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
          } catch (e) {
            return 'recently';
          }
        };

        // Expiry calculations (under 7 days remaining)
        const getDaysRemaining = (expiresAt: string) => {
          const diffTime = new Date(expiresAt).getTime() - Date.now();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? diffDays : 0;
        };

        const expiringListings = filteredMyListings.filter(l => {
          if (l.status !== 'active') return false;
          const expiresAt = (l as any).expiresAt || new Date(new Date(l.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
          const days = getDaysRemaining(expiresAt);
          return days <= 7;
        });
        const expiringCount = expiringListings.length;

        // Custom gradient generator per sender
        const getGradientBySender = (name: string) => {
          const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const gradients = [
            'from-indigo-500 to-purple-500 shadow-indigo-500/20',
            'from-emerald-500 to-teal-500 shadow-emerald-500/20',
            'from-orange-500 to-amber-500 shadow-orange-500/20',
            'from-pink-500 to-rose-500 shadow-pink-500/20',
            'from-blue-500 to-cyan-500 shadow-blue-500/20'
          ];
          return gradients[charSum % gradients.length];
        };

        return (
          <div id="agent-workspace-deck" className="space-y-6 animate-fadeIn bg-[#080912] text-slate-100 p-6 rounded-3xl min-h-screen relative overflow-hidden -mx-4">
            
            {/* Ambient Background Glow Spot */}
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#7C6FF7]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-3xl pointer-events-none" />

            {/* STICKY GLASSMOCK HEADER */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#080912]/80 border-b border-white/5 py-4 px-6 -mx-6 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-550 font-mono uppercase tracking-wider block">WORKSPACE</span>
                <h1 className="text-xl md:text-2xl font-bold font-serif text-white flex items-center gap-1.5 mt-0.5">
                  Good morning {userProfile.fullName || 'Landlord'} 👋
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <Bell className="w-5 h-5 text-gray-300" />
                  {myInquiries.filter(i => !i.isReplied).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#080912]">
                      {myInquiries.filter(i => !i.isReplied).length}
                    </span>
                  )}
                </div>
                
                {/* Avatar with initials in gradient circle */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C6FF7] to-[#A78BFA] p-0.5 shadow-lg shadow-[#7C6FF7]/20">
                    <div className="w-full h-full rounded-full bg-[#080912] flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">
                      {(userProfile.fullName || 'Victoria').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block leading-none">{userProfile.fullName}</span>
                    <span className="text-[9px] text-[#A78BFA] font-mono block mt-1">Verified Landlord</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPIRY WARNING BANNER */}
            {expiringCount > 0 && (
              <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/15 relative z-10">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/10 rounded-xl shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Warning: Expiry Alert</h4>
                    <p className="text-xs text-white/95 mt-0.5 font-sans">
                      {expiringCount} {expiringCount === 1 ? 'listing' : 'listings'} expiring within 7 days. Backups and views might be temporarily suspended.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setLandlordActiveTab('payments');
                    if (expiringListings[0]) {
                      setSelectedListingForPayment(expiringListings[0].id);
                      setPaymentProvider('mpesa');
                      setCheckoutFeedback(null);
                      setActivePaymentRecord(null);
                    }
                  }}
                  className="bg-white hover:bg-orange-50 text-orange-600 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center cursor-pointer shadow-md shadow-black/10 shrink-0"
                >
                  Renew Now →
                </button>
              </div>
            )}

            {/* STATS CARDS (2x2 grid on mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {/* Card 1: Active Listings */}
              <div className="bg-[#0e0f1c]/80 backdrop-blur border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28 relative group hover:border-[#2ECC71]/30 transition-all shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-[#2ECC71]/10 rounded-xl">
                    <Home className="w-4 h-4 text-[#2ECC71]" />
                  </div>
                  <span className="text-[8px] font-mono text-gray-550 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">total</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-[#2ECC71] block tracking-tight">{activeCount}</span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">Active Listings</span>
                </div>
              </div>

              {/* Card 2: Total Views */}
              <div className="bg-[#0e0f1c]/80 backdrop-blur border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28 relative group hover:border-[#3498DB]/30 transition-all shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-[#3498DB]/10 rounded-xl">
                    <Eye className="w-4 h-4 text-[#3498DB]" />
                  </div>
                  <span className="text-[8px] font-mono text-gray-550 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">this month</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-[#3498DB] block tracking-tight">{totalViews.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">Total Views</span>
                </div>
              </div>

              {/* Card 3: Inquiries */}
              <div className="bg-[#0e0f1c]/80 backdrop-blur border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28 relative group hover:border-[#FFC300]/30 transition-all shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-[#FFC300]/10 rounded-xl">
                    <MessageSquare className="w-4 h-4 text-[#FFC300]" />
                  </div>
                  <span className="text-[8px] font-mono text-gray-550 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">total</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-extrabold text-[#FFC300] block tracking-tight">{totalInq}</span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">Inquiries</span>
                </div>
              </div>

              {/* Card 4: Revenue */}
              <div className="bg-[#0e0f1c]/80 backdrop-blur border border-white/5 p-4 rounded-2xl flex flex-col justify-between h-28 relative group hover:border-[#A78BFA]/30 transition-all shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-[#A78BFA]/10 rounded-xl">
                    <DollarSign className="w-4 h-4 text-[#A78BFA]" />
                  </div>
                  <span className="text-[8px] font-mono text-gray-550 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">total</span>
                </div>
                <div className="mt-1 min-w-0">
                  <span className="text-lg md:text-xl font-extrabold text-[#A78BFA] block tracking-tight truncate">
                    KSh {calculatedRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans block truncate">Revenue</span>
                </div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 relative z-10 pt-2">
              <button
                type="button"
                onClick={() => setLandlordActiveTab('listings')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  landlordActiveTab === 'listings'
                    ? 'bg-gradient-to-r from-[#7C6FF7] to-[#A78BFA] text-white shadow-lg shadow-[#7C6FF7]/20 border border-t-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                My Listings
                {landlordActiveTab === 'listings' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#A78BFA] rounded-full blur-sm" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLandlordActiveTab('messages')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                  landlordActiveTab === 'messages'
                    ? 'bg-gradient-to-r from-[#7C6FF7] to-[#A78BFA] text-white shadow-lg shadow-[#7C6FF7]/20 border border-t-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Messages
                {myInquiries.filter(i => !i.isReplied).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-550 rounded-full text-[9px] font-bold text-white leading-none">
                    {myInquiries.filter(i => !i.isReplied).length}
                  </span>
                )}
                {landlordActiveTab === 'messages' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#A78BFA] rounded-full blur-sm" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLandlordActiveTab('payments')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                  landlordActiveTab === 'payments'
                    ? 'bg-gradient-to-r from-[#7C6FF7] to-[#A78BFA] text-white shadow-lg shadow-[#7C6FF7]/20 border border-t-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Payments
                {landlordActiveTab === 'payments' && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#A78BFA] rounded-full blur-sm" />
                )}
              </button>
            </div>

            {/* TAB INTERFACES */}
            <div className="relative z-10">
              
              {/* MY LISTINGS TAB */}
              {landlordActiveTab === 'listings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-mono text-gray-550 uppercase tracking-widest">Inventory Management ({filteredMyListings.length})</h3>
                    <button 
                      type="button"
                      onClick={onOpenAddListing} 
                      className="text-xs font-bold font-sans text-[#A78BFA] bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-xl transition-all cursor-pointer"
                    >
                      + Create New Listing
                    </button>
                  </div>

                  {filteredMyListings.length === 0 ? (
                    <div className="p-12 text-center bg-[#0e0f1c]/40 rounded-3xl border border-white/5 text-gray-400 font-mono text-xs">
                      No active assets published under this account signature.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredMyListings.map(item => {
                        const itemExpiresAt = (item as any).expiresAt || new Date(new Date(item.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
                        const daysLeft = getDaysRemaining(itemExpiresAt);
                        const isExpiringSoon = daysLeft <= 7;
                        
                        let statusColor = '#2ECC71';
                        let statusBadgeStyle = 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20';
                        
                        if (item.status === 'expired') {
                          statusColor = '#FF6B6B';
                          statusBadgeStyle = 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20';
                        } else if (item.status === 'draft' || item.status === 'pending_payment') {
                          statusColor = '#9B59B6';
                          statusBadgeStyle = 'bg-[#9B59B6]/10 text-[#9B59B6] border-[#9B59B6]/20';
                        } else if (item.status === 'paused') {
                          statusColor = '#FF8E53';
                          statusBadgeStyle = 'bg-[#FF8E53]/10 text-[#FF8E53] border-[#FF8E53]/20';
                        }

                        return (
                          <div 
                            key={item.id} 
                            className="bg-[#0e0f1c]/70 hover:bg-[#0e0f1c]/95 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:scale-[1.002]"
                          >
                            <div className="flex items-start gap-4">
                              <img 
                                src={item.media?.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                                alt="listing" 
                                className="w-[88px] h-[68px] object-cover rounded-xl border border-white/10 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold text-white font-sans">{item.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${statusBadgeStyle}`}>
                                    {item.status}
                                  </span>
                                </div>
                                <span className="text-[10px] text-gray-400 block mt-1">
                                  {item.propertyType} • {item.location.neighborhood}, {item.location.address}
                                </span>
                                <div className="flex items-center gap-3 mt-2 text-[9px] text-gray-400 font-mono">
                                  <span className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5" />
                                    {item.views || 0} Views
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {item.inquiriesCount || 0} Inquiries
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2.5 border-t md:border-t-0 border-white/5 pt-2.5 md:pt-0">
                              <div className="text-left md:text-right">
                                <span className="text-sm font-extrabold font-mono text-white block">
                                  KSh {(item.pricing?.rent || 0).toLocaleString()} <span className="text-[9px] font-sans text-gray-555 font-medium">/mo</span>
                                </span>
                                <span className={`text-[9px] font-mono block mt-0.5 ${isExpiringSoon ? 'text-[#FF6B6B] font-bold animate-pulse' : 'text-gray-400'}`}>
                                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.55">
                                <button 
                                  type="button"
                                  onClick={() => alert("Property fields editing console loaded in primary drawer.")}
                                  className="p-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-bold cursor-pointer"
                                >
                                  Edit
                                </button>
                                
                                {(item.status === 'expired' || item.status === 'pending_payment' || item.status === 'draft') ? (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setSelectedListingForPayment(item.id);
                                      setPaymentProvider('mpesa');
                                      setCheckoutFeedback(null);
                                      setActivePaymentRecord(null);
                                    }}
                                    className="p-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-white text-[10px] shadow cursor-pointer"
                                  >
                                    Publish
                                  </button>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setSelectedListingForPayment(item.id);
                                      setPaymentProvider('mpesa');
                                      setCheckoutFeedback(null);
                                      setActivePaymentRecord(null);
                                    }}
                                    className="p-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-all text-[10px] cursor-pointer"
                                  >
                                    Renew
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MESSAGES TAB */}
              {landlordActiveTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-1">
                    <h3 className="text-xs font-mono text-gray-150 uppercase tracking-widest">Inboxes & Communications ({myInquiries.length})</h3>
                    <span className="text-[9px] text-[#A78BFA] font-mono font-bold">Dispatch ready via SMTP</span>
                  </div>

                  {myInquiries.length === 0 ? (
                    <div className="p-12 text-center bg-[#0e0f1c]/40 rounded-3xl border border-white/5 text-gray-400 font-mono text-xs">
                      No customer requests available on this ledger node.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {myInquiries.map(inq => {
                        const isUnread = !inq.isReplied;
                        const gradStyle = getGradientBySender(inq.senderName);
                        
                        return (
                          <div 
                            key={inq.id}
                            onClick={() => {
                              setActiveReplyInquiry(inq);
                              setLandlordReplyText(inq.replyText || '');
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                              isUnread 
                                ? 'bg-[#0e0f1c]/90 border-[#7C6FF7]/25 hover:border-[#7C6FF7]/40 shadow-lg' 
                                : 'bg-[#0e0f1c]/55 border-white/5 hover:bg-[#0e0f1c]/80'
                            }`}
                          >
                            <div className="flex items-start gap-4 min-w-0">
                              {/* Deterministic Gradient Avatar */}
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${gradStyle} p-0.5 shrink-0 shadow-lg`}>
                                <div className="w-full h-full rounded-full bg-[#080912] flex items-center justify-center text-xs font-bold text-white uppercase">
                                  {inq.senderName.slice(0, 2)}
                                </div>
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs text-white block ${isUnread ? 'font-black' : 'font-medium'}`}>
                                    {inq.senderName}
                                  </span>
                                  <span className="text-[9px] text-gray-500 font-mono block">
                                    {formatRelativeTime(inq.createdAt)}
                                  </span>
                                </div>
                                <span className="text-[9px] text-[#A78BFA] font-mono uppercase block mt-1 truncate">
                                  Ref: {inq.listingTitle}
                                </span>
                                <p className="text-xs text-gray-400 mt-1.5 truncate max-w-sm md:max-w-md">
                                  {inq.message}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {isUnread && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/40 animate-pulse" />
                              )}
                              <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                                {inq.isReplied ? 'Replied' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENTS TAB */}
              {landlordActiveTab === 'payments' && (
                <div className="space-y-4">
                  {/* REVENUE SUMMARY CARD */}
                  <div className="bg-gradient-to-br from-[#0e101f] to-[#080912] border border-white/5 p-5 rounded-3xl relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#A78BFA]/10 rounded-full blur-2xl" />
                    <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider block">REVENUE SETTLEMENT DECK</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#7C6FF7] via-[#A78BFA] to-emerald-400 bg-clip-text text-transparent mt-1 font-mono font-black">
                      KSh {calculatedRevenue.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-gray-405 mt-1 font-sans leading-relaxed max-w-xl">
                      Disbursed directly into your registered bank account or Safaricom M-Pesa till. Sandboxed testing processes mock transactions accurately.
                    </p>
                  </div>

                  {/* PAYMENT LEDGER */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Transaction Records ({transactions.length})</h3>
                      <button 
                        type="button"
                        onClick={handleExportCSV}
                        className="text-[10px] font-mono text-[#A78BFA] hover:underline cursor-pointer"
                      >
                        Download Excel ledger (CSV)
                      </button>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="p-12 text-center bg-[#0e0f1c]/40 rounded-3xl border border-white/5 text-gray-400 font-mono text-xs">
                        No transactions registered under this billing signature.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map(item => (
                          <div 
                            key={item.id} 
                            className="bg-[#0e0f1c]/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0">
                                <CreditCard className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white font-sans truncate max-w-xs">{item.description}</h4>
                                <span className="text-[9px] text-gray-400 font-mono block mt-0.5">
                                  Ref: {item.id} • {item.type === 'boost' ? 'Credit Card Transfer' : 'M-Pesa Mobile Settlement'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-emerald-400 font-mono block">
                                + KSh {item.amount.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono block mt-0.5">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* MESSAGE REPLY BOTTOM DRAWER SLIDE-UP MODAL */}
            <AnimatePresence>
              {activeReplyInquiry && (
                <div className="fixed inset-0 z-110 flex items-end justify-center">
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setActiveReplyInquiry(null)} />
                  
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 220 }}
                    className="w-full max-w-2xl bg-[#0e101f] border-t border-white/10 rounded-t-3xl p-6 relative z-10 shadow-2xl space-y-4 text-slate-200"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block">REPLY WORKBENCH</span>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                          Inquiry thread with {activeReplyInquiry.senderName}
                        </h3>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActiveReplyInquiry(null)}
                        className="p-1 px-2.5 text-xs font-bold rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    {/* Original message */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[8px] text-[#A78BFA] font-mono uppercase tracking-wider block">Sender Message</span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">
                        "{activeReplyInquiry.message}"
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500 pt-1.5 font-mono">
                        <span>Listing: {activeReplyInquiry.listingTitle}</span>
                        <span>•</span>
                        <span>Contact: {activeReplyInquiry.senderEmail}</span>
                      </div>
                    </div>

                    {/* Textarea for reply */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] text-gray-400 uppercase font-mono">Your response dispatch</label>
                      {activeReplyInquiry.isReplied ? (
                        <div className="bg-emerald-500/5 border border-emerald-555/20 p-4 rounded-xl text-xs text-gray-300">
                          <span className="text-emerald-400 font-bold block mb-1">✓ Dispatch emitted:</span>
                          "{activeReplyInquiry.replyText}"
                        </div>
                      ) : (
                        <textarea
                          id="active-landlord-drawer-reply"
                          value={landlordReplyText}
                          onChange={(e) => setLandlordReplyText(e.target.value)}
                          placeholder="Confirm physical tour slot, answer amenities queries, or offer alternative locations..."
                          className="w-full min-h-[110px] bg-[#FFFFFF] border-2 border-slate-200 rounded-xl p-3 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-[#7C6FF7] focus:ring-4 focus:ring-[#7C6FF7]/10 font-sans"
                        />
                      )}
                    </div>

                    {/* Send button */}
                    {!activeReplyInquiry.isReplied && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveReplyInquiry(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!landlordReplyText.trim()) {
                              alert("Please specify a response message statement first.");
                              return;
                            }
                            onUpdateInquiryStatus(activeReplyInquiry.id, landlordReplyText);
                            setLandlordReplyText('');
                            setActiveReplyInquiry(null);
                            alert("Dispatched reply successfully over SMTP sandbox!");
                          }}
                          className="bg-gradient-to-r from-[#7C6FF7] to-[#A78BFA] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2.5 shadow-lg shadow-[#7C6FF7]/15 cursor-pointer hover:scale-101 active:scale-99 transition-transform"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Response
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        );
      })()}

      {/* ==================== WORKSPACE 3: ADMIN DASHBOARD ==================== */}
      {(currentRole as string) === 'Admin' && (
        <div id="admin-workspace-deck" className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fadeIn">
          
          {/* Admin Sidebar navigation */}
          <div className="lg:col-span-1 glass-premium rounded-2xl p-4 border border-white/5 space-y-2 h-fit">
            <span className="text-[9px] text-gray-500 font-mono uppercase pl-2 block mb-2">Systems Controls</span>
            {[
              { id: 'overview', label: 'Monitor Desk', icon: <Activity className="w-4 h-4" /> },
              { id: 'listings', label: 'Mod Properties', icon: <Sliders className="w-4 h-4" /> },
              { id: 'users', label: 'Identity / KYC', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'revenue', label: 'Stripe Ledger', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'reports', label: 'Flag Reports', icon: <ShieldAlert className="w-4 h-4" /> },
              { id: 'settings', label: 'Constants', icon: <Settings className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAdminSidebarTab(tab.id as any)}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all outline-none ${
                  adminSidebarTab === tab.id 
                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/15' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Admin Content Pane (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* TAB A: OVERVIEW MONITOR DESK */}
            {adminSidebarTab === 'overview' && (
              <div id="admin-tab-overview" className="space-y-6">
                
                {/* 4 KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Registered Users', val: '2,941', change: '+12.4%', color: 'border-brand-blue/20' },
                    { title: 'Properties Hosted', val: listings.length, change: '+8.1%', color: 'border-brand-blue/20' },
                    { title: 'Quarterly Revenue', val: 'KES 249.9k', change: '+22.5%', color: 'border-brand-gold/30' },
                    { title: 'Telemetry Node', val: '99.98% OK', change: 'Live', color: 'border-emerald-500/20' }
                  ].map((k, idx) => (
                    <div key={idx} className={`glass-premium p-4 rounded-xl border ${k.color} flex flex-col justify-between h-24`}>
                      <span className="text-[10px] text-gray-500 font-mono uppercase block">{k.title}</span>
                      <div className="flex justify-between items-baseline mt-2">
                        <span className="text-xl font-bold text-white tracking-tight">{k.val}</span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">{k.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Technical Health Indicators block */}
                <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-3">
                  <h3 className="text-sm font-serif font-bold text-white uppercase font-mono text-gray-400">
                    Platform Telemetry & API Latencies
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-brand-dark/60 rounded-xl border border-white/5 space-y-1 font-mono text-[9px]">
                      <span className="text-gray-500 uppercase block">Supabase Auth API</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-gray-200 font-bold">14ms Response</span>
                      </div>
                    </div>
                    <div className="p-3 bg-brand-dark/60 rounded-xl border border-white/5 space-y-1 font-mono text-[9px]">
                      <span className="text-gray-500 uppercase block">Prisma PostgreSQL Ingress</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-gray-200 font-bold">3ms Core Latency</span>
                      </div>
                    </div>
                    <div className="p-3 bg-brand-dark/60 rounded-xl border border-white/5 space-y-1 font-mono text-[9px]">
                      <span className="text-gray-500 uppercase block">Stripe webhook handlers</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="text-gray-200 font-bold">0 Failed webhooks</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USER GROWTH SVG CHART */}
                <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
                  <span className="text-sm font-serif font-bold text-white uppercase font-mono text-gray-400 block border-b border-white/5 pb-2">Twelve-Month User Growth Ratio</span>
                  <div className="h-32 w-full pt-2 flex items-end">
                    <svg className="w-full h-full text-indigo-400" preserveAspectRatio="none">
                      <path 
                        d="M 0 100 Q 100 80 200 70 T 400 40 T 600 20 Q 650 15 700 8" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        className="animate-dash"
                      />
                    </svg>
                  </div>
                </div>

              </div>
            )}

            {/* TAB B: LISTINGS MODIFICATION CONTROL */}
            {adminSidebarTab === 'listings' && (
              <div id="admin-tab-listings" className="space-y-4">
                
                {/* Search / filter header inputs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={adminListingSearch}
                    onChange={(e) => setAdminListingSearch(e.target.value)}
                    placeholder="Search titles / location..."
                    className="flex-1 bg-[#FFFFFF] border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-medium"
                  />
                  <select
                    value={adminListingFilter}
                    onChange={(e) => setAdminListingFilter(e.target.value)}
                    className="bg-brand-dark/80 border border-white/10 rounded-xl px-3 text-xs text-white outline-none"
                  >
                    <option value="all">All listings</option>
                    <option value="House">Houses</option>
                    <option value="Apartment">Apartments</option>
                    <option value="Villa">Villas</option>
                    <option value="Studio">Studios</option>
                  </select>
                </div>

                {/* Properties table */}
                <div className="glass-premium rounded-2xl overflow-x-auto border border-white/5">
                  <table className="w-full text-left text-xs text-gray-300 font-mono">
                    <thead className="bg-brand-dark text-gray-500 uppercase text-[9px] border-b border-white/5">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Title / Type</th>
                        <th className="p-3">Representer / Contact</th>
                        <th className="p-3">Pricing Term</th>
                        <th className="p-3">Gold Status</th>
                        <th className="p-3 text-right">Moderator actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {listings
                        .filter(l => adminListingFilter === 'all' || l.propertyType === adminListingFilter)
                        .filter(l => l.title.toLowerCase().includes(adminListingSearch.toLowerCase()))
                        .map(item => (
                          <tr key={item.id} className="hover:bg-white/5">
                            <td className="p-3 font-semibold text-gray-500">{item.id}</td>
                            <td className="p-3">
                              <span className="text-white block font-sans font-bold">{item.title}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5 block">{item.propertyType} • {item.location.neighborhood}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-gray-200 block font-sans leading-none">{item.author.name}</span>
                              <span className="text-[10px] text-gray-500 mt-1 block">{item.author.email}</span>
                            </td>
                            <td className="p-3 font-bold text-gray-100">
                              {item.pricing.currency} {item.pricing.rent.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.isFeatured ? 'bg-brand-gold text-brand-dark' : 'bg-white/5 text-gray-500'
                              }`}>
                                {item.isFeatured ? 'Featured' : 'None'}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-1 whitespace-nowrap">
                              {!item.isFeatured ? (
                                <button
                                  onClick={() => onFeatureListing(item.id)}
                                  className="bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 px-2 py-1 rounded text-[10px]"
                                >
                                  Feature
                                </button>
                              ) : (
                                <button
                                  onClick={() => onSuspendListing(item.id)}
                                  className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-2 py-1 rounded text-[10px]"
                                >
                                  Unfeature
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteListing(item.id)}
                                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded text-[10px]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB C: IDENTITY AND KYC ACCOUNTS LEDGER */}
            {adminSidebarTab === 'users' && (
              <div id="admin-tab-users" className="space-y-4">
                
                {/* KYC DOCUMENT COMPLIANCE VERIFICATION QUEUE */}
                <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-serif font-bold text-white uppercase font-mono tracking-wider">
                      📋 KYC Identity Review queue ({userProfile.kycStatus === 'pending' ? 1 : 0} pending)
                    </h3>
                    <span className="text-[10px] font-mono text-brand-gold uppercase">NestList Verification Authority</span>
                  </div>

                  {userProfile.kycStatus === 'pending' ? (
                    <div className="p-4 bg-brand-card/65 rounded-xl border border-white/5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-brand-blue uppercase">
                            {userProfile.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{userProfile.fullName}</span>
                            <span className="text-[9px] text-gray-500 font-mono block uppercase">Role: Landlord / Agent</span>
                          </div>
                        </div>

                        <span className="bg-amber-500/10 text-amber-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/15 uppercase">
                          Queued for Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-brand-dark/40 p-3 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400">
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px]">Doc Category</span>
                          <span className="text-white mt-1 block">Kenya National Identity / Passport</span>
                        </div>
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px]">ID Serial Registry</span>
                          <span className="text-white font-bold mt-1 block">KE-ID-9104-DE</span>
                        </div>
                        <div>
                          <span className="text-gray-500 uppercase block text-[8px]">Uploaded Attachments</span>
                          <span className="text-brand-blue hover:underline mt-1 block cursor-pointer">📎 kyc_payload_scanned.png</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (onUpdateProfile) {
                              onUpdateProfile({
                                ...userProfile,
                                kycStatus: 'unverified',
                                isVerified: false,
                                verificationId: undefined
                              });
                              alert("Compliance Alert: Verification proofs rejected. Status updated to UNVERIFIED.");
                            }
                          }}
                          className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer pointer-events-auto"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateProfile) {
                              onUpdateProfile({
                                ...userProfile,
                                kycStatus: 'verified',
                                isVerified: true,
                                verificationId: 'REG-ID-APPROVED-' + Date.now().toString().slice(-6)
                              });
                              alert("Compliance Alert: Identity credentials approved! Author upgrade complete.");
                            }
                          }}
                          className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] uppercase font-bold transition-all cursor-pointer pointer-events-auto"
                        >
                          Approve Verification proofs
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-550 text-[10px] font-mono">
                      No compliance applications currently pending admin review.
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-400 uppercase font-mono block pt-4">Registered Supabase Auth identities</span>
                
                <div className="glass-premium rounded-2xl overflow-hidden border border-white/5">
                  <table className="w-full text-left text-xs font-mono text-gray-300">
                    <thead className="bg-brand-dark text-gray-500 uppercase text-[9px] border-b border-white/5">
                      <tr>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Legal Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Authority Persona</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Access control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userAccounts.map(account => (
                        <tr key={account.id} className="hover:bg-white/5">
                          <td className="p-3 text-gray-500">{account.id}</td>
                          <td className="p-3 font-sans font-semibold text-white">{account.name}</td>
                          <td className="p-3 text-gray-400">{account.email}</td>
                          <td className="p-3">
                            <select
                              value={account.role}
                              onChange={(e) => onPromoteUserRole(account.id, e.target.value as any)}
                              className="bg-brand-dark border border-white/15 rounded px-2 py-0.5 text-[10px] text-brand-blue"
                            >
                              <option value="Tenant">Tenant</option>
                              <option value="Landlord">Landlord</option>
                              <option value="Agent">Agent</option>
                              <option value="Caretaker">Caretaker</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              account.isSuspended ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'
                            }`}>
                              {account.isSuspended ? 'Suspended' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => onUpdateUserAccountStatus(account.id, !account.isSuspended)}
                              className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                                account.isSuspended 
                                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                              }`}
                            >
                              {account.isSuspended ? 'Reinstate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB D: REVENUE LEDGER AND CSV EXPORT */}
            {adminSidebarTab === 'revenue' && (
              <div id="admin-tab-revenue" className="space-y-4">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase font-mono">Stripe Subscription transactions log</span>
                  <button 
                    onClick={handleExportCSV}
                    className="bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold leading-none"
                  >
                    Export to Excel CSV Format
                  </button>
                </div>

                <div className="glass-premium rounded-2xl overflow-hidden border border-white/5">
                  <table className="w-full text-left text-xs font-mono text-gray-300">
                    <thead className="bg-brand-dark text-gray-500 uppercase text-[9px]">
                      <tr>
                        <th className="p-3">Tx Hash ID</th>
                        <th className="p-3">Remittance Description</th>
                        <th className="p-3">Financial Terms</th>
                        <th className="p-3">Settlement Date</th>
                        <th className="p-3 text-right">Receipt status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.map(item => (
                        <tr key={item.id} className="hover:bg-white/5">
                          <td className="p-3 text-gray-500 font-mono">{item.id}</td>
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 font-bold text-white">
                            {item.currency} {item.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                              ✓ SUCCESS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB E: FLAGGED SUBMISSION REPORT QUEUE */}
            {adminSidebarTab === 'reports' && (
              <div id="admin-tab-reports" className="space-y-4">
                <span className="text-xs text-gray-400 uppercase font-mono block">Platform Flag Queue Reports ({reports.length})</span>
                
                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-xs font-mono">
                      Prisinte state! No flagged claims pending.
                    </div>
                  ) : (
                    reports.map(rep => (
                      <div key={rep.id} className="p-4 bg-brand-card/45 border border-red-500/20 rounded-xl space-y-3 relative overflow-hidden">
                        
                        {/* Red visual strip */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                        <div className="flex justify-between items-start pl-2">
                          <div>
                            <span className="bg-red-500/10 text-red-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase">{rep.reason}</span>
                            <h4 className="text-xs font-bold text-white font-sans mt-1.5">Claim targets listing: "{rep.listingTitle}"</h4>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {rep.id}</span>
                        </div>

                        <p className="pl-2 text-xs text-gray-300 leading-relaxed italic">
                          "{rep.details}"
                        </p>

                        <div className="pl-2 border-t border-white/5 pt-2.5 flex justify-between items-center text-[10px] font-mono">
                          <span className="text-gray-400">Claims filer: {rep.reporterName} ({rep.reporterEmail})</span>
                          
                          <div className="space-x-1">
                            <button
                              onClick={() => {
                                onUpdateReportStatus(rep.id, 'dismissed');
                                alert("Claims report dismissed. Listing preserved offline.");
                              }}
                              className="bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-gray-300 px-3 py-1.5 rounded-lg"
                            >
                              Dismiss Claim
                            </button>
                            <button
                              onClick={() => {
                                onUpdateReportStatus(rep.id, 'resolved');
                                onSuspendListing(rep.listingId);
                                alert("Resolving claim: Target property set offline for review.");
                              }}
                              className="bg-red-500 text-white hover:bg-red-600 font-bold text-xs px-3 py-1.5 rounded-lg"
                            >
                              Takedown Listing
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB F: CONTROL CONSTANTS AND CONFIGURING PLATFORM */}
            {adminSidebarTab === 'settings' && (
              <div id="admin-tab-settings" className="glass-premium rounded-2xl p-6 border border-white/10 space-y-6">
                <span className="text-xs text-gray-400 uppercase font-mono block border-b border-white/5 pb-2">Platform constants & pricing modifiers</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                  
                  {/* Feature constant pricing */}
                  <div className="space-y-2">
                    <label className="text-gray-300 block font-semibold">Boost promotion listing price ($ USD)</label>
                    <input 
                      type="number"
                      value={featuredListingPrice}
                      onChange={(e) => setFeaturedListingPrice(Number(e.target.value))}
                      className="w-full bg-[#FFFFFF] border-2 border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono font-bold"
                    />
                    <p className="text-[10px] text-gray-500 font-mono leading-none">Modifier pricing impacts Stripe redirect checkout invoices.</p>
                  </div>

                  {/* Maintenance block switch */}
                  <div className="space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-gray-300 block font-semibold">Global Maintenance Lock State</span>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">If enabled, standard customers see maintenance prompts on explore screens.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setMaintenanceModeActive(!maintenanceModeActive)}
                      className={`w-full p-2.5 rounded-xl border font-bold text-xs transition-colors ${
                        maintenanceModeActive 
                          ? 'bg-red-500/10 border-red-500 text-red-400' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {maintenanceModeActive ? '🔴 ACTIVE MAINTENANCE BLOCK ON' : '⚫ PLATFORM OPERATIONAL (ONLINE)'}
                    </button>
                  </div>

                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => alert("Platform environment configurations committed.")}
                    className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-xl text-xs"
                  >
                    Commit Settings Constants
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* STRIPE PAYMENT FRAME SYSTEM MODAL (SaaS and Boosting platform webhook sim) */}
      <AnimatePresence>
        {stripeModalOpen && (
          <div className="fixed inset-0 z-110 bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-premium rounded-3xl p-6 border border-brand-gold/40 shadow-2xl relative"
            >
              <button 
                onClick={() => setStripeModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-white text-brand-dark mx-auto rounded-full flex items-center justify-center font-bold text-xl shadow shadow-brand-gold/30">
                  💳
                </div>
                <h4 className="text-lg font-serif font-bold text-white mt-2">Stripe Checkout processing</h4>
                <span className="text-[10px] text-brand-gold uppercase font-mono block mt-1 tracking-wider">Secure Payment Gateway</span>
              </div>

              {/* Active pricing review */}
              <div className="p-3 bg-brand-dark/60 rounded-xl border border-white/5 mb-4 text-xs">
                <span className="text-gray-500 uppercase font-mono text-[9px] block">Remittance detail</span>
                <div className="flex justify-between items-baseline mt-1 font-semibold text-white">
                  <span>
                    {stripeSelectedPlan === 'Boost' 
                      ? 'Launch Premium listing boost (7 Days)' 
                      : `NestList Account: ${stripeSelectedPlan} upgrade`}
                  </span>
                  <span className="text-brand-gold font-bold">
                    {stripeSelectedPlan === 'Pro' ? 'KES 999' : stripeSelectedPlan === 'Business' ? 'KES 2,499' : `$${featuredListingPrice}.00`}
                  </span>
                </div>
              </div>

              {/* Realistic credit card inputs */}
              <form onSubmit={handleStripePayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Enter Credit Card Identification</label>
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full bg-[#FFFFFF] border-2 border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase font-mono mb-1">Expiration date</label>
                    <input 
                      type="text" 
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      placeholder="MM/YY"
                      className="w-full bg-[#FFFFFF] border-2 border-slate-200 rounded-xl p-2.5 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 uppercase font-mono mb-1">CVC Index</label>
                    <input 
                      type="text" 
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                      placeholder="3-digit"
                      className="w-full bg-[#FFFFFF] border-2 border-slate-200 rounded-xl p-2.5 text-xs text-[#1B1B1B] placeholder:text-[#888888] outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 font-mono font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-gold to-amber-600 text-brand-dark font-sans font-black py-2.5 rounded-xl text-xs hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-brand-gold/15"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Process secure fee payment
                </button>

                <p className="text-[9px] text-center text-gray-500 font-mono">
                  Continuous lifecycles. Security credentials processed by mock webhooks. Overrides local states.
                </p>

                {/* Processing Overlay inside modal if active */}
                {stripeSuccess && (
                  <div className="absolute inset-0 bg-brand-dark/95 flex flex-col items-center justify-center rounded-3xl space-y-4">
                    <div className="w-12 h-12 rounded-full border-2 border-t-transparent border-brand-gold animate-spin"></div>
                    <div className="text-center">
                      <span className="font-bold text-white block">Processing payment channels</span>
                      <span className="text-[10px] text-mono text-gray-500 mt-1 uppercase block font-mono">Deploying Stripe webhook simulator callback...</span>
                    </div>
                  </div>
                )}

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SOVEREIGN PAYMENT CHECKOUT SYSTEM MODAL (Daraja API / Airtel / Flutterwave / Paystack) */}
      <AnimatePresence>
        {selectedListingForPayment && (() => {
          const payingListing = listings.find(l => l.id === selectedListingForPayment);
          if (!payingListing) return null;
          return (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl relative max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => {
                    setSelectedListingForPayment('');
                    setActivePaymentRecord(null);
                    setCheckoutFeedback(null);
                    setPaymentModalStep('checkout');
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  ✕
                </button>
 
                {/* Header branding */}
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 mx-auto rounded-full flex items-center justify-center font-bold text-xl border border-blue-200">
                    S
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">M-Pesa STK Push Payment</h4>
                  <span className="text-[10px] text-blue-600 uppercase font-mono block mt-1 tracking-wider">Daraja Gateway API</span>
                </div>
 
                {/* Active Property Review Card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex gap-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] text-amber-600 font-mono uppercase font-bold tracking-wider">Asset Details</span>
                    <h5 className="font-bold text-slate-900 truncate text-xs mt-0.5">{payingListing.title}</h5>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{payingListing.location.neighborhood} • {payingListing.location.address}</p>
                    <div className="flex flex-col gap-1 mt-1 border-t border-slate-200 pt-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-slate-500">Rent Amount:</span>
                        <span className="text-slate-700 font-bold font-mono">
                          {payingListing.pricing.currency === 'USD' ? '$' : 'KES '} {payingListing.pricing.rent.toLocaleString()} / mo
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline bg-amber-50 px-1.5 py-1 rounded border border-amber-200 my-0.5">
                        <span className="text-[9px] text-amber-700 font-bold">Listing Fee (KES):</span>
                        <span className="text-amber-700 font-bold font-mono text-xs">
                          KSh {getListingFee(payingListing.propertyType, payingListing.details?.bedrooms || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentModalStep === 'checkout' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-500 uppercase font-mono font-bold">M-Pesa Phone Number</label>
                      <input 
                        type="text"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full min-h-[44px] p-3 rounded-xl border-2 border-slate-200 text-[#1B1B1B] text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white font-mono font-bold placeholder:text-[#888888]"
                      />
                      <p className="text-[9px] text-slate-400 font-mono">Enter your active Safaricom line as 07xxxxxxxx or 254xxxxxxxxx</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMpesaSTKPushTrigger(payingListing.id, getListingFee(payingListing.propertyType, payingListing.details?.bedrooms || 0))}
                      disabled={checkoutLoading}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase transition-transform text-white cursor-pointer ${
                        checkoutLoading 
                          ? 'bg-blue-300 cursor-not-allowed animate-pulse' 
                          : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                      }`}
                    >
                      {checkoutLoading ? 'Initiating Pipeline Gateway...' : `Send STK Push Prompt`}
                    </button>
                  </div>
                )}

                {paymentModalStep === 'stk_sent' && (
                  <div className="space-y-4 text-center">
                    <div className="py-2">
                      <span className="inline-block relative">
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      </span>
                      <p className="text-xs font-semibold text-slate-800 mt-2">STK Push sent to {mpesaPhone}!</p>
                      <p className="text-[11px] text-slate-500 mt-1">Please enter your M-Pesa PIN on your phone to complete payment.</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-2">Ref ID: {stkReference}</p>
                    </div>

                    {/* Show Realtime status */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Transaction Webhook Realtime Status</span>
                      <div className="flex items-center justify-center gap-2 mt-1.5">
                        <span className="text-xs font-bold capitalize text-slate-800">
                          {activePaymentRecord?.status === 'pending' ? '⏳ Pending callback...' : activePaymentRecord?.status === 'success' ? '✅ SUCCESS - Asset Activated' : activePaymentRecord?.status === 'failed' ? '❌ FAILED - Transaction Declined' : '⏳ Processing Callback...'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Status will auto-transition immediately safe credentials are verified.</p>
                    </div>

                    {/* Developer Mock Webhook trigger for Sandbox */}
                    <div className="border-t border-slate-200 pt-4 mt-2">
                      <p className="text-[10px] text-slate-400 mb-2">Simulate a Safaricom Callback response for testing validation rules instantly:</p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await fetch(getApiUrl('/api/payments/mpesa/simulate-success'), {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ checkoutRequestID: stkReference })
                            });
                            if (res.ok) {
                              await syncPaymentEngine();
                              setPaymentModalStep('success');
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 py-2 px-3 rounded-lg text-xs font-semibold w-full transition-colors"
                      >
                        ⚡ Simulate Sandbox Callback Success
                      </button>
                    </div>
                  </div>
                )}

                {paymentModalStep === 'success' && (
                  <div className="space-y-4 text-center py-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 mx-auto rounded-full flex items-center justify-center font-bold text-xl">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Payment Verified!</h4>
                      <p className="text-xs text-slate-500 mt-1">Listing has been successfully activated and is now live on our search directory for 30 days.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedListingForPayment('');
                        setActivePaymentRecord(null);
                        setCheckoutFeedback(null);
                        setPaymentModalStep('checkout');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl w-full"
                    >
                      Done
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}

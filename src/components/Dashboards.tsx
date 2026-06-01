/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ExternalLink
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
  onRefreshListings
}: DashboardsProps) {
  
  // Dashboard internals tab selections
  const [adminSidebarTab, setAdminSidebarTab] = useState<'overview' | 'listings' | 'users' | 'revenue' | 'reports' | 'settings'>('overview');
  
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

  // Sync payments and active listings against in-memory backend
  const syncPaymentEngine = async () => {
    try {
      const res = await fetch('/api/payments');
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

  // Handle pay triggering
  const handleInitiateSovereignPayment = async (listingId: string) => {
    if (!listingId) {
      alert("Please select a pending asset to process.");
      return;
    }
    const targetListing = listings.find(l => l.id === listingId);
    if (!targetListing) return;

    setCheckoutLoading(true);
    setCheckoutFeedback({ text: "Reaching core billing cluster...", type: 'info' });

    try {
      let endpoint = '';
      let payload: any = {};

      if (paymentProvider === 'mpesa') {
        endpoint = '/api/payments/mpesa';
        payload = {
          listingId,
          phoneNumber: mpesaPhone,
          amount: targetListing.pricing.rent
        };
      } else if (paymentProvider === 'airtel') {
        endpoint = '/api/payments/airtel';
        payload = {
          listingId,
          phoneNumber: airtelPhone,
          amount: targetListing.pricing.rent
        };
      } else if (paymentProvider === 'flutterwave') {
        endpoint = '/api/payments/flutterwave';
        payload = {
          listingId,
          amount: targetListing.pricing.rent,
          currency: targetListing.pricing.currency || 'KES',
          email: 'partner@nestlist.luxury',
          name: 'Victoria Vance'
        };
      } else if (paymentProvider === 'paystack') {
        endpoint = '/api/payments/paystack';
        payload = {
          listingId,
          amount: targetListing.pricing.rent,
          currency: targetListing.pricing.currency || 'KES',
          email: 'partner@nestlist.luxury'
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Platform rejected request with code ${res.status}`);
      }

      const data = await res.json();
      setCheckoutLoading(false);

      if (data && data.success) {
        setActivePaymentRecord(data);
        
        let msg = '';
        if (paymentProvider === 'mpesa' || paymentProvider === 'airtel') {
          msg = `📲 ${paymentProvider.toUpperCase()} push notification dispatched to phone. Awaiting customer receipt verification...`;
        } else {
          msg = `🔗 Payment checkout created! Please open the simulated redirection link below to execute payment.`;
          // Open simulated visual wrapper overlay
          if (data.link || data.authorization_url) {
            window.open(data.link || data.authorization_url, '_blank');
          }
        }

        setCheckoutFeedback({
          text: `${msg} Record ID: ${data.checkoutRequestID || data.reference || data.txRef}`,
          type: 'info'
        });
      } else {
        throw new Error(data.error || "Gateway rejected validation");
      }
    } catch (err: any) {
      setCheckoutLoading(false);
      setCheckoutFeedback({
        text: `Error initializing payment: ${err.message}`,
        type: 'refused'
      });
    }
  };

  // Submit Simulated success callback
  const handleTriggerSimulatedWebhook = async (item: any, isSuccess: boolean) => {
    try {
      const refCode = item.checkoutRequestID || item.paystackRef || item.flutterwaveTxRef || item.reference || item.txRef;
      const res = await fetch('/api/sandbox/trigger-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: item.provider,
          txRef: refCode,
          success: isSuccess
        })
      });
      if (res.ok) {
        syncPaymentEngine();
      }
    } catch (err) {
      console.error("Failed executing simulation:", err);
    }
  };

  // Switch a normal listing to pending payment for quick demo testing
  const handleSimulateStatusSwitch = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Call backend endpoint to register it as pending
    fetch('/api/listings', {
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

  return (
    <div id="role-dashboard-workspace" className="p-4 md:p-8 space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl md:text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
            <span>Nested Client Workspace</span>
            <span className="text-xs bg-brand-blue/20 text-brand-blue font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              {currentRole} Access
            </span>
          </h2>
          <p className="text-xs text-mono text-gray-400 mt-1 uppercase font-mono tracking-wider">
            Account: {userProfile.fullName} ({userProfile.contactEmail})
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {currentRole !== 'Tenant' && currentRole !== 'Admin' && (
            <>
              <span className="p-2 rounded-xl bg-white/5 text-gray-300 font-bold border border-white/5">
                ACTIVE SUBSCRIPTION: <span className="text-brand-gold">{activePlan} Suite</span>
              </span>
              <button 
                onClick={() => {
                  setStripeSelectedPlan('Business');
                  setStripeModalOpen(true);
                }}
                className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue hover:bg-brand-blue/20 px-3 py-2 rounded-xl text-xs font-semibold"
              >
                Upgrade Plan (Stripe)
              </button>
              <button 
                onClick={onOpenAddListing} 
                className="bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
              >
                + New Asset
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================== WORKSPACE 1: TENANT DASHBOARD ==================== */}
      {currentRole === 'Tenant' && (
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
      {(currentRole === 'Landlord' || currentRole === 'Agent' || currentRole === 'Caretaker') && (
        <div id="agent-workspace-deck" className="space-y-6 animate-fadeIn">
          
          {/* KYC DOCUMENT ASSURITY FLOW BANNER CARDS */}
          <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-2.5 gap-2">
              <div>
                <h3 className="text-sm font-serif font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  🛡️ Sovereign Identity Assurance (KYC Compliance Tracker)
                </h3>
                <p className="text-[10px] text-gray-550 mt-0.5">Verified assets gain premium syndication algorithms and exclusive transaction protection.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono">YOUR STATUS:</span>
                <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded font-mono font-bold ${
                  userProfile.kycStatus === 'verified' 
                    ? 'bg-brand-gold/15 text-brand-gold border border-brand-gold/25 text-shadow-gold' 
                    : userProfile.kycStatus === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 md:animate-pulse'
                }`}>
                  {userProfile.kycStatus === 'verified' ? '👑 Verified' : userProfile.kycStatus === 'pending' ? '⏳ Application Review' : '❌ Unverified'}
                </span>
              </div>
            </div>

            {/* Render based on Status */}
            {userProfile.kycStatus === 'verified' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-brand-gold">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-brand-gold" />
                    <span className="text-xs font-bold text-white font-sans">Your Landlord / Agent Credentials are fully authenticated!</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Your profile and all current listings have been upgraded with our official **"Verified Professional"** badge. This status entitles you to direct wire payments sandbox, higher placement in tenant search algorithms, and automated viewing calendars setup.
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">Verified ID Reference: {userProfile.verificationId || "KE-ID-9104-DE"}</p>
                </div>
                <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-[12px] font-bold text-brand-gold font-serif">Verified Partner Guild</span>
                  <span className="text-[10px] text-gray-300">NestList Syndicate Member #048</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-gold mt-2 animate-pulse flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-dark"></div>
                  </div>
                </div>
              </div>
            ) : userProfile.kycStatus === 'pending' ? (
              <div className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></div>
                    <span>DOCUMENT VERIFICATION UNDERGOING SECURITY SCREENING</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans max-w-2xl mt-1">
                    Your uploaded National Identity/Passport and self-portrait verification payload are currently queued in our compliance ledger. Administrative officers verify submissions within 24 hours.
                  </p>
                </div>

                {/* Bypass panel */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto">
                  <span className="text-[8px] font-mono text-gray-500 block">PROTOTYPE BYPASS UTILITY</span>
                  <button
                    onClick={() => {
                      if (onUpdateProfile) {
                        onUpdateProfile({
                          ...userProfile,
                          kycStatus: 'verified',
                          isVerified: true,
                          verificationId: 'BYPASS-VERIFIED-' + Date.now().toString().slice(-6)
                        });
                        alert("Prototype Check: Profile status successfully upgraded to VERIFIED! Badge added live.");
                      }
                    }}
                    className="bg-brand-gold hover:bg-amber-600 text-brand-dark font-sans font-bold text-[10px] uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    ⚡ Instant Approve My KYC
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Information side */}
                <div className="lg:col-span-5 space-y-3 pr-4 border-r border-white/5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-brand-gold uppercase block font-bold">Why Verification matters?</span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      To prevent fraud and maintain the exclusive standard of our luxury listings platform, all Landlords, Agents, and Managers must fulfill standard KYC identity checks.
                    </p>
                    <ul className="text-[11px] text-gray-400 space-y-1.5 font-sans">
                      <li className="flex items-center gap-1.5">✓ Enhanced visibility Badge on listings</li>
                      <li className="flex items-center gap-1.5">✓ Direct tenant booking scheduling active</li>
                      <li className="flex items-center gap-1.5">✓ Access premium escrow billing ledger</li>
                    </ul>
                  </div>
                  <div className="bg-brand-dark/45 p-3 rounded-xl text-[10px] text-gray-500 font-mono flex items-center gap-2">
                    <span>🔒 End-to-end Encrypted client-only document vaults. Safe storage.</span>
                  </div>
                </div>

                {/* Verification Upload form */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-mono text-gray-300 block uppercase font-bold">Upload Compliance payload</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1 font-semibold">Document Classification</label>
                      <select 
                        id="kyc-doc-type"
                        className="w-full bg-brand-dark border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-blue"
                      >
                        <option value="national-id">Kenya National Identity Card (ID)</option>
                        <option value="passport">Diplomatic / Standard Passport Document</option>
                        <option value="incorporation">Co-operative Property License</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-mono mb-1 font-semibold">Document ID Number</label>
                      <input 
                        id="kyc-doc-number"
                        type="text"
                        placeholder="e.g. ID-89420489"
                        required
                        className="w-full bg-brand-dark border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-blue font-mono"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop Document Upload section */}
                  <div className="border border-dashed border-white/15 bg-brand-dark/40 hover:bg-brand-dark/80 rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-brand-blue flex flex-col items-center justify-center group relative">
                    <input 
                      id="kyc-file-upload-input"
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert(`Mock document "${file.name}" was loaded successfully into local buffer stack.`);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-6 h-6 text-brand-blue" />
                    </div>
                    <span className="text-xs font-bold text-white block">Drop identification proof here, or browse</span>
                    <span className="text-[10px] text-gray-500 font-mono block mt-1">JPEG, PNG or PDF files accepted (Max 15MB size)</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        const numInp = document.getElementById('kyc-doc-number') as HTMLInputElement | null;
                        if (!numInp || !numInp.value.trim()) {
                          alert("Please specify your document ID number before submitting.");
                          return;
                        }
                        if (onUpdateProfile) {
                          onUpdateProfile({
                            ...userProfile,
                            kycStatus: 'pending'
                          });
                          alert("Compliance Application payload uploaded! Review queue is now active.");
                        }
                      }}
                      className="bg-brand-blue hover:bg-blue-600 text-white font-sans font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer pointer-events-auto"
                    >
                      🚀 Submit Credentials Verification
                    </button>
                  </div>

                </div>
              </div>
            )}
          </div>
          
          {/* ANALYTICS VECTOR SVG PLOT HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="glass-premium rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">Total platform views</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">1,395</span>
                <span className="text-[10px] text-green-400 font-bold flex items-center font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +18.4%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Unique visitor impressions last 30 days</p>
            </div>

            <div className="glass-premium rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">Saves Count</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">303</span>
                <span className="text-[10px] text-green-400 font-bold flex items-center font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12.1%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Active customer favorites recorded</p>
            </div>

            <div className="glass-premium rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">Active Inquiries</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">42</span>
                <span className="text-[10px] text-brand-gold font-mono uppercase text-[9px]">Sovereign Broker</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Awaiting digital and SMTP response</p>
            </div>

            <div className="glass-premium rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28">
              <span className="text-[10px] text-gray-500 font-mono uppercase block">Simulated Earnings</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-white tracking-tight">KES 225k</span>
                <span className="text-[10px] text-green-400 font-bold flex items-center font-mono">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +4.2%
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Lease billing deposits processed</p>
            </div>

          </div>

          {/* SVG DATA ANIMATED PERFORMANCE CHART */}
          <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="text-sm font-serif font-bold text-white uppercase font-mono text-gray-400">
                  Listing performance analytics ledger
                </h3>
                <span className="text-[10px] text-gray-500 font-mono block">Aggregate views vs save count trajectory</span>
              </div>
              <span className="text-[10px] font-mono text-brand-blue uppercase">KPI: Live stats tracker</span>
            </div>

            <div className="h-44 w-full relative flex items-end">
              {/* Plot grid SVG lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 py-2">
                <div className="h-[1px] bg-white w-full"></div>
                <div className="h-[1px] bg-white w-full"></div>
                <div className="h-[1px] bg-white w-full"></div>
                <div className="h-[1px] bg-white w-full"></div>
              </div>

              {/* Core SVG drawn chart wrapper */}
              <svg className="w-full h-full text-brand-blue" preserveAspectRatio="none">
                {/* Views path */}
                <path 
                  d="M 0 140 Q 50 110 100 80 T 200 120 T 300 50 T 400 30 T 500 70 T 600 20 T 700 80" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.5"
                  className="stroke-brand-blue animate-dash"
                />
                <path 
                  d="M 0 140 Q 50 110 100 80 T 200 120 T 300 50 T 400 30 T 500 70 T 600 20 T 700 80 L 700 180 L 0 180 Z" 
                  fill="url(#views-gradient)" 
                  className="opacity-10"
                />
                
                {/* Saves Plot Line */}
                <path 
                  d="M 0 160 Q 50 150 100 120 T 200 140 T 300 110 T 400 90 T 500 100 T 600 70 T 700 120" 
                  fill="none" 
                  stroke="#F59E0B" 
                  strokeWidth="2"
                  className="animate-dash"
                />

                <defs>
                  <linearGradient id="views-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6"/>
                    <stop offset="100%" stopColor="#0F1623"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Month tags bottom ledger */}
              <div className="absolute bottom-1 inset-x-0 flex justify-between px-2 font-mono text-[9px] text-gray-500">
                <span>JAN</span>
                <span>FEB</span>
                <span>MAR</span>
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* INQUIRIES INTERACTIVE CHAT INBOX */}
            <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
              <h3 className="text-sm font-serif font-bold tracking-tight text-white uppercase font-mono text-gray-400 border-b border-white/5 pb-2">
                Dynamic Inquiries Inbox ({myInquiries.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[220px]">
                
                {/* List portion */}
                <div className="md:col-span-1 space-y-2 pr-1 max-h-60 overflow-y-auto">
                  {myInquiries.map(inq => (
                    <button
                      key={inq.id}
                      onClick={() => setSelectedInquiryId(inq.id)}
                      className={`w-full p-2.5 rounded-lg border text-left text-xs ${
                        selectedInquiryId === inq.id 
                          ? 'bg-brand-blue/15 border-brand-blue'
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <span className="font-bold text-white block truncate leading-none mb-1">{inq.senderName}</span>
                      <span className="text-[9px] text-gray-500 truncate block font-mono">{inq.listingTitle}</span>
                      <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded mt-2 inline-block font-mono ${
                        inq.isReplied ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {inq.isReplied ? 'Replied' : 'Pending'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Reader display & reply workbench */}
                <div className="md:col-span-2 bg-brand-dark/50 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                  {selectedInquiryId ? (() => {
                    const activeInq = myInquiries.find(i => i.id === selectedInquiryId);
                    if (!activeInq) return null;
                    return (
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] items-baseline">
                            <span className="font-bold text-brand-blue">{activeInq.senderName}</span>
                            <span className="text-gray-500 font-mono">{activeInq.senderEmail}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-1 font-mono">
                            <MapPin className="w-3 h-3" />
                            <span>{activeInq.listingTitle}</span>
                          </div>

                          <div className="bg-brand-card p-2.5 rounded border border-white/5 text-[11px] text-gray-300 leading-relaxed font-sans mt-2">
                            "{activeInq.message}"
                          </div>
                        </div>

                        {/* Answers history or reply inputs */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          {activeInq.isReplied ? (
                            <div className="space-y-1 text-[11px]">
                              <span className="text-[10px] text-emerald-400 font-bold block">✓ Representative response dispatched:</span>
                              <p className="text-gray-400 bg-emerald-500/5 p-2 rounded italic font-sans leading-none">
                                "{activeInq.replyText}"
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="block text-[9px] text-gray-400 uppercase font-mono">Formulate reply</span>
                              <div className="flex gap-1.5">
                                <input 
                                  type="text" 
                                  value={landlordReplyText}
                                  onChange={(e) => setLandlordReplyText(e.target.value)}
                                  placeholder="Type response detail..."
                                  className="flex-1 bg-brand-dark border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                                />
                                <button 
                                  onClick={() => handleSendReply(activeInq.id)}
                                  className="bg-brand-blue text-white px-3 rounded-lg text-xs font-bold"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="text-center py-12 text-gray-500 text-xs text-mono flex-1 flex items-center justify-center">
                      Select an inquiry message thread
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* MY OWN LISTINGS LIST */}
            <div className="glass-premium rounded-2xl p-5 border border-white/5 space-y-4">
              <h3 className="text-sm font-serif font-bold tracking-tight text-white uppercase font-mono text-gray-400 border-b border-white/5 pb-2">
                My uploaded real estate catalog ({filteredMyListings.length})
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredMyListings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs font-mono">
                    You have not published any properties yet.
                  </div>
                ) : (
                  filteredMyListings.map(item => (
                    <div key={item.id} className="p-3 bg-brand-card/30 border border-white/5 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img src={item.media.images[0]?.url} className="w-12 h-12 object-cover rounded border border-white/10" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">{item.title}</h4>
                          <span className="text-[9px] text-gray-500 font-mono uppercase block mt-1">{item.propertyType} • {item.location.neighborhood}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[9px] uppercase">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          item.status === 'active' 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {item.id.includes('new') ? 'Active (Live)' : item.status}
                        </span>

                        {/* Boost item check */}
                        {!item.isFeatured ? (
                          <button
                            onClick={() => {
                              setStripeSelectedPlan('Boost');
                              setStripeSelectedBoostListingId(item.id);
                              setStripeModalOpen(true);
                            }}
                            className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/20 px-2 py-1 rounded font-bold text-[9px]"
                          >
                            🚀 Boost
                          </button>
                        ) : (
                          <span className="bg-brand-gold text-brand-dark px-2 py-1 rounded font-bold text-[9px]">
                            ⭐ Boosted
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== WORKSPACE 3: ADMIN DASHBOARD ==================== */}
      {currentRole === 'Admin' && (
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
                    className="flex-1 bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
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
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
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
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-gold font-mono"
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
                      className="w-full bg-brand-dark border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-gold font-mono"
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
                      className="w-full bg-brand-dark border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-brand-gold font-mono"
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

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Receipt, MessageSquare, Check, X, ShieldAlert,
  Coins, Search, Filter, TrendingUp, Sparkles, LogOut, CheckCircle, Clock 
} from "lucide-react";
import { useAuth } from "../AuthContext";

interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "landlord" | "tenant" | "admin";
  created_at: string;
}

interface Property {
  id: string;
  landlord_id: string;
  title: string;
  location: string;
  county: string;
  price: number;
  bedrooms: number;
  type: string;
  status: "available" | "taken";
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

interface ListingPayment {
  id: string;
  property_id: string;
  landlord_id: string;
  amount: number;
  property_type: string;
  mpesa_code: string | null;
  status: "pending" | "confirmed" | "failed";
  created_at: string;
}

interface Inquiry {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  message: string;
  status: "pending" | "responded" | "closed";
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  // Live actions passed from orchestration layer
  fetchProperties: () => Promise<Property[]>;
  fetchPayments: () => Promise<ListingPayment[]>;
  fetchProfiles: () => Promise<Profile[]>;
  fetchInquiries: () => Promise<Inquiry[]>;
  onApproveProperty: (id: string) => Promise<boolean>;
  onRejectProperty: (id: string) => Promise<boolean>;
  onVerifyPayment: (id: string, propertyId: string) => Promise<boolean>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  fetchProperties,
  fetchPayments,
  fetchProfiles,
  fetchInquiries,
  onApproveProperty,
  onRejectProperty,
  onVerifyPayment
}) => {
  const { profile } = useAuth();
  
  // Dashboard lists state
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<ListingPayment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active view tabs: 'overview' | 'listings' | 'payments' | 'users' | 'inquiries'
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "payments" | "users" | "inquiries">("overview");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "landlord" | "tenant" | "admin">("all");

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [props, pays, profs, inqs] = await Promise.all([
        fetchProperties(),
        fetchPayments(),
        fetchProfiles(),
        fetchInquiries()
      ]);
      setProperties(props);
      setPayments(pays);
      setProfiles(profs);
      setInquiries(inqs);
    } catch (err) {
      console.error("Failed loading admin platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Actions wrapped with loading update
  const handleApproveProperty = async (id: string) => {
    if (window.confirm("Approve this property for live platform visibility?")) {
      const ok = await onApproveProperty(id);
      if (ok) {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, is_active: true } : p));
      }
    }
  };

  const handleRejectProperty = async (id: string) => {
    if (window.confirm("Deactivate this property listing?")) {
      const ok = await onRejectProperty(id);
      if (ok) {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, is_active: false } : p));
      }
    }
  };

  const handleVerifyMpesa = async (paymentId: string, propertyId: string) => {
    if (window.confirm("Confirm verification of M-Pesa listing payment?")) {
      const ok = await onVerifyPayment(paymentId, propertyId);
      if (ok) {
        // Toggle the payment to confirmed locally
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: "confirmed" } : p));
        // Autoactivate corresponding property
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, is_active: true } : p));
      }
    }
  };

  // Analytics helper calculations
  const totalInquiries = inquiries.length;
  const totalActiveProperties = properties.filter(p => p.is_active).length;
  const totalPendingProperties = properties.filter(p => !p.is_active).length;
  const landlordsCount = profiles.filter(p => p.role === "landlord").length;
  const tenantsCount = profiles.filter(p => p.role === "tenant").length;
  
  // Total platform revenue KSh calculation based on confirmed listing payments
  const totalRevenue = payments
    .filter(p => p.status === "confirmed")
    .reduce((sum, curr) => sum + Number(curr.amount || 0), 0);

  // Filter listings & profiles
  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.county.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p => {
    const queryMatch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.id?.includes(searchQuery);
    const roleMatch = roleFilter === "all" || p.role === roleFilter;
    return queryMatch && roleMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800">
      
      {/* Dynamic Left sidebar rail */}
      <div className="w-68 bg-green-dark text-white flex flex-col p-6 shrink-0 shadow-lg border-r border-[#1B3D1C]">
        <div className="mb-8 select-none">
          <div className="font-serif text-3xl font-extrabold tracking-tight text-white leading-none">
            nest<span className="text-gold">list</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-extrabold text-gold block mt-1">
            SaaS Admin Dashboard
          </span>
        </div>

        {/* User Info Capsule */}
        <div className="bg-[#173719] px-4 py-3 rounded-2xl mb-8 border border-[#1d431f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold border border-gold/30">
            AD
          </div>
          <div className="overflow-hidden">
            <span className="font-semibold text-xs block truncate text-white leading-tight">
              {profile?.full_name || "Nexus Supervisor"}
            </span>
            <span className="text-[10px] text-white/50 block font-medium truncate mt-0.5">
              Role: System Administrator
            </span>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="space-y-1.5 flex-1">
          <button
            onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
            className={`w-full text-start py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview" ? "bg-gold text-white shadow-md shadow-gold/20" : "text-white/80 hover:bg-[#1A3F1B]"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Platform Overview
          </button>

          <button
            onClick={() => { setActiveTab("listings"); setSearchQuery(""); }}
            className={`w-full text-start py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "listings" ? "bg-gold text-white shadow-md shadow-gold/20" : "text-white/80 hover:bg-[#1A3F1B]"
            }`}
          >
            <Building2 className="w-4 h-4" /> Listings Management
          </button>

          <button
            onClick={() => { setActiveTab("payments"); setSearchQuery(""); }}
            className={`w-full text-start py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "payments" ? "bg-gold text-white shadow-md shadow-gold/20" : "text-white/80 hover:bg-[#1A3F1B]"
            }`}
          >
            <Receipt className="w-4 h-4" /> Payment Ledger
          </button>

          <button
            onClick={() => { setActiveTab("users"); setSearchQuery(""); }}
            className={`w-full text-start py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "users" ? "bg-gold text-white shadow-md shadow-gold/20" : "text-white/80 hover:bg-[#1A3F1B]"
            }`}
          >
            <Users className="w-4 h-4" /> User Base Directory
          </button>

          <button
            onClick={() => { setActiveTab("inquiries"); setSearchQuery(""); }}
            className={`w-full text-start py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "inquiries" ? "bg-gold text-white shadow-md shadow-gold/20" : "text-white/80 hover:bg-[#1A3F1B]"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Inquiries Oversight
          </button>
        </nav>

        {/* Logout trigger at foot */}
        <button
          onClick={onLogout}
          className="w-full mt-auto py-3 px-4 rounded-xl text-white/70 hover:text-white hover:bg-slate-100/10 text-xs font-bold flex items-center gap-3 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gold" /> Log Out (Exit Central)
        </button>
      </div>

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Header toolbar banner */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-md bg-yellow-50 text-gold font-extrabold text-[10px] uppercase border border-gold/20">
              Live Cloud Node
            </span>
            <h1 className="text-sm font-extrabold text-slate-800 tracking-tight capitalize">
              NestList Admin Control Center • {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAllAdminData}
              className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              🔄 Reload Node Data
            </button>
            <span className="text-[10px] text-slate-400 font-mono font-medium">
              Timezone: Nairobi (EAT)
            </span>
          </div>
        </header>

        {/* Scrollable View Box */}
        <main className="flex-1 p-8 md:p-10 overflow-y-auto space-y-8">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-sm">
              <div className="w-8 h-8 rounded-full border-2 border-green-mid/10 border-t-green-mid animate-spin" />
              <p className="text-xs font-bold text-slate-400 mt-4">Consulting Cloud database ledger...</p>
            </div>
          ) : (
            <>
              {/* ==================== 1. TAB: PLATFORM OVERVIEW ==================== */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Analytic Bento Cells */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-34">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Gross Platform Revenue</span>
                          <Coins className="w-5 h-5 text-gold" />
                        </div>
                        <h4 className="font-mono text-xl font-black text-green-dark">KSh {totalRevenue.toLocaleString()}</h4>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 mt-auto">
                        <TrendingUp className="w-3 h-3 animate-pulse" /> +100% verified M-Pesa push
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-34">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Active Listing Properties</span>
                          <Building2 className="w-5 h-5 text-green-mid" />
                        </div>
                        <h4 className="font-mono text-xl font-black text-slate-800">{totalActiveProperties} Live Units</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block mt-auto">
                        {totalPendingProperties} properties awaiting payment verification
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-34">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Platform Registered Profiles</span>
                          <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <h4 className="font-mono text-xl font-black text-slate-800">{profiles.length} Users</h4>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold mt-auto block">
                        👤 {landlordsCount} Landlords • 🏠 {tenantsCount} Tenants
                      </span>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm relative overflow-hidden flex flex-col justify-between h-34">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Historical Tenant Inquiries</span>
                          <MessageSquare className="w-5 h-5 text-indigo-500" />
                        </div>
                        <h4 className="font-mono text-xl font-black text-slate-800">{totalInquiries} Messages</h4>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold mt-auto block">
                        Conversational matching between users active
                      </span>
                    </div>
                  </div>

                  {/* Pending M-Pesa Payments & Listing queue preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Urgently Awaiting Payments confirmation */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                      <h4 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gold" /> Pending M-Pesa Verifications
                      </h4>
                      <p className="text-xs text-slate-400">Match the M-Pesa Code sent by the Landlord to confirm their property activation.</p>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {payments.filter(p => p.status === "pending").length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-400 font-medium">
                            🎉 No pending payouts currently require verification. All clear!
                          </div>
                        ) : (
                          payments.filter(p => p.status === "pending").map(pay => {
                            const relatedProp = properties.find(p => p.id === pay.property_id);
                            return (
                              <div key={pay.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <span className="text-[12px] font-extrabold text-amber-800 block">
                                    CODE: {pay.mpesa_code || "N/A (Pending submission)"}
                                  </span>
                                  <p className="text-xs text-slate-600 leading-tight">
                                    For Listing: <strong className="text-slate-800">{relatedProp?.title || "Property Unit"}</strong>
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    Amount: KSh {Number(pay.amount).toLocaleString()} • Type: {pay.property_type}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleVerifyMpesa(pay.id, pay.property_id)}
                                  className="py-1.5 px-3 bg-[#1E4620] hover:bg-green-dark text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                                >
                                  Verify Listing
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Pending Approvals queue */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                      <h4 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-green-mid" /> Awaiting Property Approvals
                      </h4>
                      <p className="text-xs text-slate-400">Review newly uploaded rental properties before turning on live marketplace visibility.</p>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {properties.filter(p => !p.is_active).length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-400 font-medium">
                            ✨ No properties awaiting verification! All live on platform.
                          </div>
                        ) : (
                          properties.filter(p => !p.is_active).map(prop => (
                            <div key={prop.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-4">
                              <div className="space-y-0.5">
                                <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{prop.title}</h5>
                                <p className="text-[10.5px] text-slate-500">{prop.location}, {prop.county}</p>
                                <span className="text-[10px] text-green-mid font-extrabold font-mono block">
                                  Rent: KSh {Number(prop.price).toLocaleString()} • Space: {prop.bedrooms} Bedrooms
                                </span>
                              </div>
                              <button
                                onClick={() => handleApproveProperty(prop.id)}
                                className="py-1.5 px-3 bg-gold hover:bg-gold-dark text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                              >
                                Approve Unit
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ==================== 2. TAB: PROPERTIES / LISTINGS ==================== */}
              {activeTab === "listings" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search properties by title, county, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-mid"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-bold shrink-0">
                      Found {filteredProperties.length} property units
                    </span>
                  </div>

                  {/* Listings Grid */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50 select-none text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Sno</th>
                          <th className="px-6 py-4">Title & details</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Pricing</th>
                          <th className="px-6 py-4">Platform Visible</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredProperties.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium font-mono text-xs">
                              ⚠️ No properties matched your active search queries.
                            </td>
                          </tr>
                        ) : (
                          filteredProperties.map((prop, idx) => (
                            <tr key={prop.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="px-6 py-4 max-w-xs truncate">
                                <div className="font-extrabold text-slate-800 block truncate">{prop.title}</div>
                                <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wide">
                                  Layout: {prop.bedrooms} Bedrooms • {prop.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600">
                                {prop.location}, <strong className="text-slate-800">{prop.county}</strong>
                              </td>
                              <td className="px-6 py-4 font-bold text-green-mid font-mono">
                                KSh {Number(prop.price).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                {prop.is_active ? (
                                  <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                                    <CheckCircle className="w-3 h-3" /> Enabled (Live)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-100">
                                    <Clock className="w-3 h-3 text-amber-600" /> Awaiting approval
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {!prop.is_active ? (
                                    <button
                                      onClick={() => handleApproveProperty(prop.id)}
                                      className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold rounded-lg transition-all cursor-pointer border border-emerald-100"
                                    >
                                      Approve
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRejectProperty(prop.id)}
                                      className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold rounded-lg transition-all cursor-pointer border border-red-100"
                                    >
                                      Take Down
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ==================== 3. TAB: PAYMENTS ==================== */}
              {activeTab === "payments" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Ledger summary */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-slate-800">Verified Platforms Financial Receipts</h4>
                      <p className="text-xs text-slate-400 mt-1">Audit trail ledger for KES 1,000 Listing Fees paid via M-Pesa push.</p>
                    </div>

                    <div className="bg-green-dark p-4 rounded-2xl text-white flex flex-col justify-center font-mono py-3">
                      <span className="text-[9px] text-white/60 uppercase font-black tracking-wider block">Audited Revenue Flow</span>
                      <strong className="text-base text-gold mt-0.5">KSh {totalRevenue.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Register table */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50 select-none text-[10px] text-slate-400 uppercase tracking-widest font-extrabold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Receipt Ref</th>
                          <th className="px-6 py-4">M-Pesa Reference</th>
                          <th className="px-6 py-4">Registered Amount</th>
                          <th className="px-6 py-4">Unit specification</th>
                          <th className="px-6 py-4">Verification status</th>
                          <th className="px-6 py-4 text-center text-slate-400">Trigger Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                              ℹ️ No historical payments registered in system ledger.
                            </td>
                          </tr>
                        ) : (
                          payments.map((p, idx) => {
                            const relatedProp = properties.find(prop => prop.id === p.property_id);
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-mono text-[10.5px] text-slate-400 font-bold">
                                  #{p.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-6 py-4">
                                  <strong className="font-mono text-xs text-slate-800">
                                    {p.mpesa_code || "PENDING"}
                                  </strong>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-slate-700">
                                  KSh {Number(p.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 line-clamp-1 max-w-xs font-semibold text-slate-600">
                                  {relatedProp?.title || `SaaS Listing: ${p.property_type}`}
                                </td>
                                <td className="px-6 py-4">
                                  {p.status === "confirmed" ? (
                                    <span className="py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-100">
                                      CONFIRMED
                                    </span>
                                  ) : p.status === "failed" ? (
                                    <span className="py-1 px-2.5 rounded-full bg-red-50 text-red-700 text-[10px] font-extrabold uppercase border border-red-100">
                                      FAILED
                                    </span>
                                  ) : (
                                    <span className="py-1 px-2.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold uppercase border border-amber-100 animate-pulse">
                                      PENDING STK
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {p.status === "pending" && (
                                    <button
                                      onClick={() => handleVerifyMpesa(p.id, p.property_id)}
                                      className="py-1 px-2.5 bg-green-mid hover:bg-green-dark text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                                    >
                                      Verify Code
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ==================== 4. TAB: REGISTERED PROFILES ==================== */}
              {activeTab === "users" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Profiles Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/50 shadow-xs gap-4">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search users by name, phone or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-mid"
                      />
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {(["all", "landlord", "tenant", "admin"] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase transition-all border cursor-pointer select-none ${
                            roleFilter === role
                              ? "bg-green-dark text-white border-green-dark"
                              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-55"
                          }`}
                        >
                          {role}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Grid directory */}
                  <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-slate-50 select-none text-[10px] text-slate-400 uppercase tracking-widest font-extrabold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Account ID</th>
                          <th className="px-6 py-4">Full name (Government ID)</th>
                          <th className="px-6 py-4">Phone contact</th>
                          <th className="px-6 py-4">Custom role</th>
                          <th className="px-6 py-4">Joined date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredProfiles.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-mono text-xs">
                              ℹ️ No user directory profiles matched your request filter.
                            </td>
                          </tr>
                        ) : (
                          filteredProfiles.map((prof) => (
                            <tr key={prof.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-mono text-[10px] text-slate-400 text-left">
                                {prof.id}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-800">
                                {prof.full_name}
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-600 font-mono">
                                {prof.phone || "No contact"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`py-1 px-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                  prof.role === "admin" 
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : prof.role === "landlord"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : "bg-blue-50 text-blue-700 border-blue-100"
                                }`}>
                                  {prof.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-400">
                                {new Date(prof.created_at || Date.now()).toLocaleDateString("en-KE")}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ==================== 5. TAB: INQUIRIES OVERSIGHT ==================== */}
              {activeTab === "inquiries" && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm">
                    <h4 className="font-serif text-lg font-bold text-slate-800">Tenant-Landlord Communication oversight</h4>
                    <p className="text-xs text-slate-400 mt-1">SaaS administrator level audit of all inquiry requests filed across properties.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {inquiries.length === 0 ? (
                      <div className="col-span-2 py-12 text-center bg-white border border-slate-200/50 rounded-3xl text-slate-400 text-xs font-semibold">
                        📩 No tenant inquiries filed globally on the platform yet.
                      </div>
                    ) : (
                      inquiries.map(inq => {
                        const relProp = properties.find(p => p.id === inq.property_id);
                        const sender = profiles.find(p => p.id === inq.tenant_id);
                        const host = profiles.find(p => p.id === inq.landlord_id);
                        
                        return (
                          <div key={inq.id} className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-xs flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <span className="p-1 px-2 text-[9px] bg-slate-100 rounded-md font-mono font-bold text-slate-500">
                                  INQ: {inq.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className={`text-[10px] font-extrabold uppercase py-0.5 px-2 rounded-full ${
                                  inq.status === "pending" 
                                    ? "bg-yellow-50 text-yellow-600 border border-yellow-100" 
                                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                }`}>
                                  {inq.status}
                                </span>
                              </div>

                              <h5 className="font-bold text-sm text-slate-800 line-clamp-1">
                                {relProp?.title || "Property Unit"}
                              </h5>

                              <div className="text-xs text-slate-600 leading-relaxed font-sans italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                "{inq.message}"
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex justify-between text-[11px] text-slate-400">
                              <div>
                                <span className="block font-medium">Tenant: <strong className="text-slate-700">{sender?.full_name || "N/A"}</strong></span>
                                <span className="block mt-0.5">Phone: {sender?.phone || "N/A"}</span>
                              </div>

                              <div className="text-right">
                                <span className="block font-medium">Landlord: <strong className="text-slate-700">{host?.full_name || "N/A"}</strong></span>
                                <span className="block mt-0.5">Phone: {host?.phone || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}

            </>
          )}

        </main>
      </div>

    </div>
  );
};

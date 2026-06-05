import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  LayoutDashboard, 
  User, 
  Bell, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  LogOut,
  Sparkles,
  Building,
  UserCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { UserRole, Notification, Profile } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onOpenAddListing: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectPropertyId: (id: string | null) => void;
  userProfile: Profile;
  onUpdateProfile: (p: Profile) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (login: boolean) => void;
}

export default function Navbar({
  currentRole,
  onChangeRole,
  notifications,
  onMarkAllRead,
  onOpenAddListing,
  activeTab,
  setActiveTab,
  onSelectPropertyId,
  userProfile,
  onUpdateProfile,
  isLoggedIn,
  setIsLoggedIn
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Profile Form Edit state
  const [editName, setEditName] = useState(userProfile.fullName);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const [editPhone, setEditPhone] = useState(userProfile.contactPhone);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl);
  const [saveStatus, setSaveStatus] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      fullName: editName,
      bio: editBio,
      contactPhone: editPhone,
      avatarUrl: editAvatar,
      username: editName.toLowerCase().replace(/\s+/g, '')
    });
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleLogoutClick = () => {
    const confirmation = window.confirm("Are you sure you want to log out of NestList?");
    if (confirmation) {
      localStorage.removeItem('nestlist_token');
      localStorage.removeItem('nestlist_user_phone');
      setIsLoggedIn(false);
      onSelectPropertyId(null);
      setActiveTab('home');
    }
  };

  const navigateTab = (targetTab: string) => {
    onSelectPropertyId(null);
    setActiveTab(targetTab);
  };

  return (
    <>
      {/* 1. TOP BRAND HEADER BAR (Elegant Glassmorphism layout) */}
      <header className="sticky top-0 z-40 w-full bg-[#08080F]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 shadow-xl relative overflow-hidden">
        {/* Animated timeline bar underneath */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-[#A78BFA] via-emerald-400 via-amber-400 to-violet-600 animate-shimmer-line pointer-events-none" />

        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          
          {/* Logo Brand */}
          <div 
            onClick={() => navigateTab('home')}
            className="flex items-center gap-2 md:gap-3.5 cursor-pointer group active:scale-95 transition-all text-left"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-950/50 group-hover:scale-105 transition-transform duration-300">
              <Home className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-2xl md:text-3xl font-syne font-black bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent tracking-tight">NestList</span>
                <span className="hidden xs:inline-block bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  DIRECT
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold font-dmsans block -mt-0.5 leading-none uppercase tracking-wider text-indigo-300/80">Ke Safekeeping Network</span>
            </div>
          </div>

          {/* Quick Stats / Right Side Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Post a Listing Button (Shown on SM screens and above, hidden on mobile since mobile has the center float nav button) */}
            <button
              onClick={onOpenAddListing}
              className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-syne font-extrabold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/20 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Post a Listing
            </button>

            {/* Sign Up Free button in header (Shown on MD screens and above) */}
            <button
              onClick={() => {
                alert("Welcome! You are currently exploring under our Elite Tour Profile. Signing up with Kenya Safekeeping is free and verified instantly with M-Pesa KYC.");
              }}
              className="hidden md:inline-flex px-4.5 py-1.5 rounded-full text-xs font-syne font-extrabold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-violet-600/25 cursor-pointer"
            >
              Sign Up Free
            </button>
            
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex justify-center items-center text-slate-400 hover:text-white transition-colors cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#08080F] flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 bg-[#121324] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 flex justify-between items-center text-white">
                      <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">Activity Alerts</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => {
                            onMarkAllRead();
                            setShowNotifications(false);
                          }}
                          className="text-[10px] text-emerald-400 hover:underline font-bold uppercase font-mono"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No active updates received
                        </div>
                      ) : (
                        notifications.map(not => (
                          <div key={not.id} className={`p-3.5 text-left transition-colors hover:bg-white/5 ${!not.isRead ? 'bg-violet-500/10' : ''}`}>
                            <div className="flex gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-405 shrink-0 mt-1.5 animate-pulse" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-white block leading-tight">{not.title}</span>
                                <span className="text-[11px] text-slate-355 block leading-normal">{not.description}</span>
                                <span className="text-[9px] text-slate-405 block font-mono">Just now</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Quick Tapper */}
            <button
              onClick={() => navigateTab('profile')}
              className="flex items-center gap-2 p-1 pl-1 pr-1 md:pr-3 rounded-full hover:bg-white/5 border border-white/10 transition-all cursor-pointer text-slate-305"
            >
              <img 
                src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                alt={userProfile.fullName} 
                className="w-7 h-7 rounded-full object-cover border border-[#08080F]"
                referrerPolicy="no-referrer"
              />
              <span className="hidden md:inline text-xs font-bold text-slate-300">
                {userProfile.fullName.split(' ')[0]}
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* 2. PERSISTENT FLOATING BOTTOM NAVIGATION BAR (Mobile-First / Glassmorphism visual theme) */}
      <nav 
        id="nestlist-bottom-nav" 
        className="fixed bottom-0 inset-x-0 z-40 bg-[#08080F]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_30px_rgba(0,0,0,0.7)] px-2 py-2.5 flex justify-around items-center sm:max-w-md sm:mx-auto sm:bottom-4 sm:rounded-3xl sm:border sm:border-white/10"
      >
        {/* TAB 1: HOME */}
        <motion.button
          whileTap={{ scale: 0.85, y: -2 }}
          onClick={() => navigateTab('home')}
          className="flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-colors duration-300 ${
              activeTab === 'home' ? 'text-violet-400 stroke-[2.5px]' : 'text-slate-500 hover:text-slate-300'
            }`} />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            )}
          </div>
          <span className={`text-[9px] font-syne font-black mt-1 tracking-tight transition-colors duration-300 ${
            activeTab === 'home' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-350'
          }`}>
            Home
          </span>
        </motion.button>

        {/* TAB 2: SEARCH */}
        <motion.button
          whileTap={{ scale: 0.85, y: -2 }}
          onClick={() => navigateTab('search')}
          className="flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
        >
          <div className="relative">
            <Search className={`w-5 h-5 transition-colors duration-300 ${
              activeTab === 'search' ? 'text-violet-400 stroke-[2.5px]' : 'text-slate-500 hover:text-slate-300'
            }`} />
            {activeTab === 'search' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            )}
          </div>
          <span className={`text-[9px] font-syne font-black mt-1 tracking-tight transition-colors duration-300 ${
            activeTab === 'search' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-350'
          }`}>
            Search
          </span>
        </motion.button>

        {/* TAB 3: LARGER GRADIENT CENTER POST BUTTON (Upgrade 7) */}
        <div className="flex-1 flex justify-center -mt-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88, rotate: 6 }}
            onClick={onOpenAddListing}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-violet-905/45 border-4 border-[#08080F] z-50 cursor-pointer active:scale-90 transition-transform"
            title="Post a Listing"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </motion.button>
        </div>

        {/* TAB 4: MESSAGES & NOTIFICATIONS (with direct Badge Count) (Upgrade 7) */}
        <motion.button
          whileTap={{ scale: 0.85, y: -2 }}
          onClick={() => navigateTab('dashboard')}
          className="flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
        >
          <div className="relative">
            <Mail className={`w-5 h-5 transition-colors duration-300 ${
              activeTab === 'dashboard' ? 'text-violet-400 stroke-[2.5px]' : 'text-slate-500 hover:text-slate-300'
            }`} />
            
            {/* Red count badge for messages/notifications */}
            {unreadCount > 0 ? (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[8px] font-black rounded-full px-1 min-w-[13px] text-center border border-[#08080C] animate-pulse">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white w-1.5 h-1.5 rounded-full border border-[#08080C]" />
            )}
            
            {activeTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            )}
          </div>
          <span className={`text-[9px] font-syne font-black mt-1 tracking-tight transition-colors duration-300 ${
            activeTab === 'dashboard' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-350'
          }`}>
            Messages
          </span>
        </motion.button>

        {/* TAB 5: PROFILE */}
        <motion.button
          whileTap={{ scale: 0.85, y: -2 }}
          onClick={() => navigateTab('profile')}
          className="flex-1 py-1 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-colors duration-300 ${
              activeTab === 'profile' ? 'text-violet-400 stroke-[2.5px]' : 'text-slate-500 hover:text-slate-300'
            }`} />
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            )}
          </div>
          <span className={`text-[9px] font-syne font-black mt-1 tracking-tight transition-colors duration-300 ${
            activeTab === 'profile' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-350'
          }`}>
            Profile
          </span>
        </motion.button>
      </nav>

      {/* 3. DEDICATED PROFILE VIEW PAGE RENDERED WHEN activeTab === 'profile' */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto px-4 py-8 space-y-6 pb-24">
          
          {/* Main User Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img 
                src={editAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'} 
                alt={editName} 
                className="w-24 h-24 rounded-full object-cover border-4 border-[#1B3A6B]/15"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-[#4CAF50] text-white p-1 rounded-full border-2 border-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{userProfile.fullName}</h2>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="bg-[#1B3A6B]/10 text-[#1B3A6B] text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Verified {currentRole}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase">•</span>
                <span className="text-xs font-semibold text-[#4CAF50] uppercase">M-Pesa Connected</span>
              </div>
              <p className="text-xs text-slate-450 mt-1">{userProfile.contactEmail}</p>
            </div>
            
            <p className="text-sm text-slate-500 italic max-w-sm mt-2 leading-relaxed">&ldquo;{userProfile.bio}&rdquo;</p>
          </div>

          {/* Verification Directive Badge */}
          <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#4CAF50] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-[#1B3A6B] uppercase tracking-wide block">Kenya Safekeeping Directives Compliance</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your account is bound to local verification standards. High-security escrow directs land deposits only to agent portfolios vetted under national guidelines.
              </p>
            </div>
          </div>

          {/* TAPPABLE ROLE SELECTOR (Big, clean cards inside profile tab) */}
          <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <span className="block text-xs font-bold text-[#1B3A6B] uppercase font-mono tracking-wider">Switch Active System Space</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Choose your dashboard view dynamically</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { r: 'Tenant' as UserRole, title: 'Tenant Space', desc: 'Browse apartments, book tours, trigger payments', icon: UserCheck, color: 'text-[#1B3A6B]' },
                { r: 'Agent' as UserRole, title: 'Registered Agent Space', desc: 'Create listings, check client inquiries', icon: Sparkles, color: 'text-[#4CAF50]' },
                { r: 'Landlord' as UserRole, title: 'Direct Landlord Space', desc: 'Manage rents, track direct deposits', icon: Building, color: 'text-[#1B3A6B]' }
              ].map(item => (
                <button
                  key={item.r}
                  onClick={() => onChangeRole(item.r)}
                  className={`p-3.5 rounded-2xl border text-left flex items-start justify-between cursor-pointer transition-all ${
                    currentRole === item.r
                      ? 'border-[#1B3A6B] bg-blue-50/40 ring-1 ring-[#1B3A6B]'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex gap-3">
                    <item.icon className={`w-5 h-5 mt-0.5 ${item.color}`} />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-[10px] text-slate-450 mt-0.5 block">{item.desc}</span>
                    </div>
                  </div>
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                    currentRole === item.r ? 'bg-[#1B3A6B] border-transparent' : 'border-slate-300'
                  }`}>
                    {currentRole === item.r && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

           {/* Quick profile edit form */}
          <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <span className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Edit Contact Information</span>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase font-mono">Full Name</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-slate-200 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 rounded-xl px-3.5 py-2.5 outline-none font-bold text-[#1B1B1B] placeholder:text-[#888888]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase font-mono">Bio & Experience</label>
                <textarea 
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full h-20 bg-[#FFFFFF] border-2 border-slate-200 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 rounded-xl px-3.5 py-2 outline-none font-medium text-[#1B1B1B] placeholder:text-[#888888]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase font-mono">M-Pesa Registered Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full pl-9 bg-[#FFFFFF] border-2 border-slate-200 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 rounded-xl px-3.5 py-2.5 outline-none font-bold text-[#1B1B1B] placeholder:text-[#888888]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase font-mono">Avatar URL Link</label>
                <input 
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-slate-200 focus:border-[#1B3A6B] focus:ring-4 focus:ring-[#1B3A6B]/10 rounded-xl px-3.5 py-2.5 outline-none font-medium text-[#1B1B1B] placeholder:text-[#888888]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1B3A6B] hover:bg-blue-900 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              Update Profile Details
            </button>
            {saveStatus && (
              <p className="text-center text-xs font-bold text-[#4CAF50]">✓ Profile updated successfully!</p>
            )}
          </form>

          {/* Quick FAQ / Safety guide */}
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
            <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">Help & Security</span>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p><strong>M-Pesa STK push wait:</strong> Always await the SIM PIN prompt on your phone before closing the app.</p>
              </div>
              <div className="flex gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p><strong>Deposits protection:</strong> All listing fees and tenant booking sums are held in local verified escrow accounts under Kenyan directives.</p>
              </div>
            </div>
          </div>

          {/* Logout trigger button */}
          <button
            onClick={handleLogoutClick}
            className="w-full py-4 bg-rose-50 border border-rose-200/60 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout from Session
          </button>

        </div>
      )}
    </>
  );
}

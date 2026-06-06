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
  Plus,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
            className="flex items-center gap-2 md:gap-3.5 cursor-pointer group active:scale-95 transition-all text-left mr-4"
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

          {/* Desktop Navigation Menu Links (Requirement 8) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 mx-auto">
            {[
              { id: 'home', label: 'Browse', icon: Home },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'dashboard', label: 'Workspace', icon: LayoutDashboard },
              { id: 'profile', label: 'Profile', icon: User }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTab(item.id)}
                  className={`flex items-center gap-1.5 text-[11px] lg:text-xs font-syne font-black uppercase tracking-wider transition-all duration-300 relative cursor-pointer ${
                    isActive ? 'text-violet-400 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="desktopNavActiveIndicator"
                      className="absolute -bottom-[21px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 to-indigo-505"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats / Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Post a Listing Button (Shown on desktop, hidden on mobile since center button has it) */}
            <button
              onClick={onOpenAddListing}
              className="hidden lg:inline-flex px-4 py-1.5 rounded-full text-[11px] font-syne font-extrabold text-slate-205 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/20 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              Post a Listing
            </button>

            {/* Sign Up Free button in header */}
            <button
              onClick={() => {
                alert("Welcome! You are currently exploring under our Elite Tour Profile. Signing up with Kenya Safekeeping is free and verified instantly with M-Pesa KYC.");
              }}
              className="hidden lg:inline-flex px-4.5 py-1.5 rounded-full text-[11px] font-syne font-extrabold text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-violet-600/25 cursor-pointer"
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
              {userProfile.avatarUrl ? (
                <img 
                  src={userProfile.avatarUrl} 
                  alt={userProfile.fullName} 
                  className="w-7 h-7 rounded-full object-cover border border-[#08080F]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white border border-[#08080F]">
                  {userProfile.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NL'}
                </div>
              )}
              <span className="hidden md:inline text-xs font-bold text-slate-300">
                {userProfile.fullName.split(' ')[0]}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button (Requirement 8) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full hover:bg-white/5 flex justify-center items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* 1.1 MOBILE FLOATING DROPDOWN DRAWER PANEL (Requirement 8) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden w-full bg-[#121324]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden relative z-40"
          >
            <div className="p-4 sm:p-5 flex flex-col gap-3 text-left">
              {[
                { id: 'home', label: 'Browse', icon: Home, desc: 'Premium verified properties' },
                { id: 'search', label: 'Interactive Search', icon: Search, desc: 'Advanced search & location matrix' },
                { id: 'dashboard', label: 'My Workspace', icon: LayoutDashboard, desc: 'Landlord & Tenant Desk' },
                { id: 'profile', label: 'My Profile', icon: User, desc: 'Edit identity credentials' }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigateTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-start gap-3.5 p-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-violet-955/40 border border-violet-500/20' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-[11px] font-syne font-black uppercase tracking-wider block ${
                        isActive ? 'text-violet-450' : 'text-slate-205'
                      }`}>
                        {item.label}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-semibold">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="h-[1px] bg-white/5 my-1" />

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    onOpenAddListing();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl text-center text-[11px] font-syne font-black text-slate-205 bg-white/5 hover:bg-white/10 border border-white/15 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-violet-405" />
                  Post a Listing Classified
                </button>
                <button
                  onClick={() => {
                    alert("Welcome! You are currently exploring under our Elite Tour Profile. Signing up with Kenya Safekeeping is free and verified instantly with M-Pesa KYC.");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl text-center text-[11px] font-syne font-black text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider shadow-lg shadow-violet-605/20"
                >
                  Sign Up Free Account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

    </>
  );
}

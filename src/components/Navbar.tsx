/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Bell, 
  User, 
  Compass, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  CheckCircle, 
  MapPin, 
  Phone,
  Mail,
  ExternalLink,
  Crown
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
  onUpdateProfile
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  
  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default logged in for interactive demo

  // Profile Form Edit state
  const [editName, setEditName] = useState(userProfile.fullName);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const [editPhone, setEditPhone] = useState(userProfile.contactPhone);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl);

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
    setShowProfileDrawer(false);
  };

  const triggerSearchDirect = () => {
    onSelectPropertyId(null);
    setActiveTab('listings');
  };

  return (
    <>
      <nav id="nestlist-main-nav" className="sticky top-0 z-50 w-full glass-premium border-b border-[#1e293b] py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div 
            id="nestlist-logo-btn"
            className="flex items-center gap-2 cursor-pointer group"
            onClick={triggerSearchDirect}
          >
            <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white font-serif font-black text-lg shadow-lg shadow-brand-blue/25 group-hover:scale-105 transition-transform duration-300">
              N
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight font-sans text-white group-hover:text-brand-blue transition-colors">
                Nest<span className="text-brand-gold font-serif">List</span>
              </span>
              <p className="text-[8px] text-gray-400 tracking-wider font-mono uppercase">Premium Real Estate</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <button 
              id="nav-btn-explore"
              onClick={triggerSearchDirect}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all border ${
                activeTab === 'listings' 
                  ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30 shadow-md shadow-brand-blue/5' 
                  : 'text-slate-300 border-transparent hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Listings
            </button>

            {/* Dashboard Selector */}
            <button 
              id="nav-btn-dashboard"
              onClick={() => {
                onSelectPropertyId(null);
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all border ${
                activeTab === 'dashboard' 
                  ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/30 shadow-md shadow-brand-blue/5' 
                  : 'text-slate-300 border-transparent hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Space ({currentRole})
            </button>
          </div>

          {/* Utility Interactions */}
          <div className="flex items-center gap-3">
            
            {/* Live Role Selector Tool - Essential for full dashboard showcase */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-mono text-gray-400 pl-2 pr-1 hidden lg:inline-block">ROLE:</span>
              <select 
                id="live-role-selector"
                value={currentRole}
                onChange={(e) => onChangeRole(e.target.value as UserRole)}
                className="bg-brand-dark/80 text-brand-blue text-xs font-semibold py-1 px-3 border border-brand-blue/20 rounded-lg outline-none cursor-pointer focus:border-brand-blue"
              >
                <option value="Tenant">Tenant View</option>
                <option value="Landlord">Landlord View</option>
                <option value="Agent">Agent View</option>
                <option value="Caretaker">Caretaker View</option>
                <option value="Admin">Platform Admin</option>
              </select>
            </div>

            {/* Quick Listing Action (Visible for Landlord/Agent/Caretaker/Admin) */}
            {currentRole !== 'Tenant' && (
              <motion.button 
                id="nav-quick-list-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAddListing}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-xs hover:shadow-lg hover:shadow-brand-blue/20 transition-all border border-brand-blue/30"
              >
                <PlusCircle className="w-4 h-4" />
                List Property
              </motion.button>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                id="nav-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-gray-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    id="notifications-dropdown"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 glass-premium rounded-2xl border border-white/10 p-4 shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                      <span className="font-semibold text-xs text-white">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={onMarkAllRead}
                          className="text-[10px] font-mono text-brand-blue hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs text-mono">
                          No new alerts
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-2.5 rounded-xl border transition-colors ${
                              n.isRead ? 'bg-transparent border-white/5' : 'bg-brand-blue/5 border-brand-blue/20'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-[11px] font-bold text-white block">{n.title}</span>
                              <span className="text-[9px] text-gray-500 font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 mt-1">{n.description}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Trigger / Auth Portal */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button 
                  id="nav-user-avatar-btn"
                  onClick={() => setShowProfileDrawer(true)}
                  className="w-10 h-10 rounded-xl overflow-hidden border border-brand-blue/30 p-0.5 hover:scale-105 transition-transform duration-200"
                >
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.fullName} 
                    className="w-full h-full object-cover rounded-[10px]"
                    referrerPolicy="no-referrer"
                  />
                </button>
              </div>
            ) : (
              <button 
                id="nav-login-btn"
                onClick={() => setShowAuthModal(true)}
                className="text-xs bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all"
              >
                Sign In
              </button>
            )}

          </div>
        </div>
      </nav>

      {/* Supabase Mock Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-100 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-premium rounded-3xl p-6 border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-blue rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-serif font-black mb-2 shadow-lg shadow-brand-blue/30">
                  N
                </div>
                <h3 className="text-xl font-bold font-serif text-white">
                  {isSignUp ? 'Create luxury portfolio' : 'Sign in to NestList'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Supabase Gated Authentication</p>
              </div>

              {/* Supabase Social OAuth Simulator */}
              <button 
                onClick={() => {
                  setIsLoggedIn(true);
                  setShowAuthModal(false);
                }}
                className="w-full bg-white text-brand-dark font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all mb-4"
              >
                <img src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=85&w=40" className="w-5 h-5 rounded-full object-contain" alt="Google logo" referrerPolicy="no-referrer" />
                Continue with Google Secure OAuth
              </button>

              <div className="flex items-center gap-2 my-4">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-[10px] text-gray-500 font-mono">OR EMAIL MAGIC LINK</span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                setIsLoggedIn(true);
                setShowAuthModal(false);
              }} className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@agency.com"
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Security Key (Password)</label>
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all mt-4"
                >
                  {isSignUp ? 'Generate Member Key' : 'Request Passwordless Access'}
                </button>
              </form>

              <div className="text-center mt-4">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-brand-blue hover:underline"
                >
                  {isSignUp ? 'Already registered? Access key' : 'New to premium estate? Setup account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supabase profile settings / setup flow slide-out */}
      <AnimatePresence>
        {showProfileDrawer && (
          <div className="fixed inset-0 z-100 bg-brand-dark/60 backdrop-blur-xs flex justify-end">
            {/* Backdrop click closer */}
            <div className="flex-1" onClick={() => setShowProfileDrawer(false)}></div>
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-brand-card border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-white">NestList Signature Profile</h3>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Role: {currentRole}</p>
                  </div>
                  <button 
                    onClick={() => setShowProfileDrawer(false)}
                    className="text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-xl text-xs"
                  >
                    Close
                  </button>
                </div>

                {/* Profile KYC verified card banner */}
                <div className="glass-gold rounded-2xl p-4 border border-brand-gold/30 mb-6 flex items-center gap-3">
                  <Crown className="w-6 h-6 text-brand-gold animate-bounce" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">KYC Landlord Verification status</span>
                      <span className="bg-brand-gold/20 text-brand-gold text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                        {userProfile.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-300 mt-1">Unified ledger verification allows premium listing placement and priority booking handling.</p>
                  </div>
                </div>

                {/* Edit details form */}
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Upload Portrait URL</label>
                    <div className="flex gap-2">
                      <img 
                        src={editAvatar} 
                        alt="Avatar preview" 
                        className="w-10 h-10 object-cover rounded-xl border border-white/10" 
                        referrerPolicy="no-referrer"
                      />
                      <input 
                        type="text" 
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        className="flex-1 bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Bio / Profile Narrative</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Direct Phone Number</label>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full bg-brand-blue hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-xs transition-all"
                    >
                      Authenticate Profile Update
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-white/5 pt-4 mt-8">
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setShowProfileDrawer(false);
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Terminate Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

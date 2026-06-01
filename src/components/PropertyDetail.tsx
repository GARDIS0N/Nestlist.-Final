/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Heart, 
  Share2, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { Listing, Review, ViewingRequest, Inquiry } from '../types';

interface PropertyDetailProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
  allListings: Listing[];
  onSelectSimilar: (id: string) => void;
  onAddViewing: (v: ViewingRequest) => void;
  onAddInquiry: (i: Inquiry) => void;
}

export default function PropertyDetail({
  listing,
  isFavorite,
  onToggleFavorite,
  onBack,
  allListings,
  onSelectSimilar,
  onAddViewing,
  onAddInquiry
}: PropertyDetailProps) {
  const { id, title, description, propertyType, location, details, pricing, media, author, isFeatured, createdAt } = listing;
  
  // Lightbox view state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Scheduler sidebar state
  const [scheduleDate, setScheduleDate] = useState('2026-06-05');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [schedulerNotes, setSchedulerNotes] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Inquiry form states
  const [inquiryMsg, setInquiryMsg] = useState(`Hello, I am interested in "${title}". Please let me know when we can arrange an on-site visit.`);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Reviews states (local persistent list)
  const [localReviews, setLocalReviews] = useState<Review[]>([
    {
      id: 'rev-p1',
      listingId: id,
      authorName: 'Erick Cheruiyot',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      comment: 'An absolutely flawless masterpiece of a property. The security and the backup gen-set make this exceptionally secure for continuous remote tech workflow.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Flag/Report status state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Duplicate Listing');
  const [flagDetails, setFlagDetails] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);

  // Formatted pricing string
  const formattedPrice = () => {
    const symbol = pricing.currency === 'USD' ? '$' : 'KES ';
    return `${symbol}${pricing.rent.toLocaleString()}`;
  };

  const formattedDeposit = () => {
    const symbol = pricing.currency === 'USD' ? '$' : 'KES ';
    return `${symbol}${pricing.deposit.toLocaleString()}`;
  };

  // Extract similar listings
  const similarProperties = allListings
    .filter(item => item.id !== id && (item.propertyType === propertyType || item.location.neighborhood === location.neighborhood))
    .slice(0, 3);

  // Handle tour booking submission
  const handleBookTour = (e: React.FormEvent) => {
    e.preventDefault();
    const freshRequest: ViewingRequest = {
      id: `view-req-${Date.now()}`,
      listingId: id,
      listingTitle: title,
      listingImage: media.images[0]?.url || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=150',
      agentName: author.name,
      dateTime: `${scheduleDate}T${scheduleTime}:00.000Z`,
      status: 'pending',
      notes: schedulerNotes || undefined,
      createdAt: new Date().toISOString()
    };
    onAddViewing(freshRequest);
    setScheduleSuccess(true);
    setTimeout(() => setScheduleSuccess(false), 4000);
  };

  // Handle direct inquiry submission
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const freshInquiry: Inquiry = {
      id: `inq-${Date.now()}`,
      listingId: id,
      listingTitle: title,
      listingImage: media.images[0]?.url || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=150',
      senderName: 'Your Authenticated Name (Client)',
      senderEmail: 'you@client-nestlist.com',
      senderPhone: '+254 700 999 111',
      message: inquiryMsg,
      isReplied: false,
      createdAt: new Date().toISOString()
    };
    onAddInquiry(freshInquiry);
    setInquirySuccess(true);
    setTimeout(() => {
      setInquirySuccess(false);
      setInquiryMsg('');
    }, 4000);
  };

  // Review submission
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const reviewObj: Review = {
      id: `rev-sub-${Date.now()}`,
      listingId: id,
      authorName: 'Sarah Wambui (Tenant)',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      rating: newReviewRating,
      comment: newReviewComment,
      createdAt: new Date().toISOString()
    };
    setLocalReviews([reviewObj, ...localReviews]);
    setNewReviewComment('');
  };

  // Report Listing submit
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFlagSuccess(true);
    setTimeout(() => {
      setFlagSuccess(false);
      setFlagModalOpen(false);
      setFlagDetails('');
    }, 3000);
  };

  const availableAmenitiesList = [
    { id: 'wifi', label: 'WiFi Access', icon: '📶' },
    { id: 'parking', label: 'Allocated Parking', icon: '🚗' },
    { id: 'gym', label: 'Wellness Gym', icon: '🏋️' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
    { id: 'security', label: '24/7 Guards & CCTV', icon: '🛡️' },
    { id: 'water', label: 'Steady Borehole Water', icon: '🚰' },
    { id: 'electricity_backup', label: 'Full Backup Generator', icon: '⚡' }
  ];

  const triggerLightboxOpen = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div id="property-detail-page-wrapper" className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Back breadcrumb and Actions bar */}
      <div className="flex items-center justify-between">
        <button 
          id="detail-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-brand-blue" />
          BACK TO PORTFOLIO
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            onClick={(e) => onToggleFavorite(id, e)}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs ${
              isFavorite 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
            {isFavorite ? 'Saved to Space' : 'Save Asset'}
          </button>

          {/* Report */}
          <button
            onClick={() => setFlagModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 text-xs flex items-center gap-1 border border-white/5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>

      {/* Main Title Banner and Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {isFeatured && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-brand-gold to-yellow-600 text-brand-dark text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-brand-dark fill-brand-dark animate-spin" />
              Featured Partner
            </span>
          )}
          <span className="bg-brand-blue/20 text-brand-blue text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase">
            {propertyType} Classified
          </span>
          <span className="bg-white/5 text-gray-300 text-[8px] font-mono px-2 py-0.5 rounded uppercase">
            REPRESENTED BY: {listing.roleType}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
          {title}
        </h1>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
          <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
          <span>{location.address}</span>
          <span className="text-gray-500">•</span>
          <span className="text-brand-gold font-mono uppercase bg-brand-gold/10 px-2 py-0.5 rounded text-[10px] font-bold">
            {location.neighborhood}
          </span>
        </div>
      </div>

      {/* Responsive Row-grid for Main content & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Media gallery & specifications */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* GRID OF PREVIEW PHOTOS (LIGHTBOX BINDER) */}
          <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-3xl border border-white/5">
            <div 
              onClick={() => triggerLightboxOpen(0)}
              className="col-span-3 h-80 relative cursor-zoom-in overflow-hidden group border-b border-white/5"
            >
              <img 
                src={media.images[0]?.url} 
                alt="Main cover" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors"></div>
              <span className="absolute bottom-4 right-4 bg-brand-dark/80 backdrop-blur-md text-xs font-mono text-gray-300 py-1.5 px-3 rounded-xl border border-white/5 flex items-center gap-1">
                🔍 Click to zoom
              </span>
            </div>

            {media.images.slice(1, 4).map((img, idx) => (
              <div 
                key={img.id}
                onClick={() => triggerLightboxOpen(idx + 1)}
                className="h-28 overflow-hidden cursor-zoom-in relative group"
              >
                <img 
                  src={img.url} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  alt="Gallery thumb" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-brand-dark/40 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-300 font-mono">
                  View #{idx + 2}
                </div>
              </div>
            ))}
          </div>

          {/* ROOM SPECS AND AREA TOGGLES */}
          <div className="p-5 glass-premium rounded-2xl flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-gray-300 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                🛌
              </span>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Bedrooms layout</span>
                <span className="text-white font-bold">{details.bedrooms} Rooms Spec</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                🛁
              </span>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Bathrooms layouts</span>
                <span className="text-white font-bold">{details.bathrooms} Baths</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                📐
              </span>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-mono">Floor Area Net</span>
                <span className="text-white font-bold">{details.size} {details.sizeUnit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                🛋️
              </span>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Interior Decor</span>
                <span className="text-white font-bold">{details.isFurnished ? 'Fully Furnished' : 'Unfurnished'}</span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION TEXT */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-white tracking-tight border-b border-white/5 pb-2">Description narrative</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans text-justify">
              {description}
            </p>
          </div>

          {/* AMENITIES CHECK GRID */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-white tracking-tight border-b border-white/5 pb-2">Asset Amenities Inclusions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {details.amenities.map(amenId => {
                const spec = availableAmenitiesList.find(a => a.id === amenId) || { label: amenId.toUpperCase(), icon: '🏡' };
                return (
                  <div 
                    key={amenId} 
                    className="p-3 bg-brand-card/40 border border-white/5 rounded-xl flex items-center gap-2 text-xs"
                  >
                    <span className="text-base leading-none">{spec.icon}</span>
                    <span className="text-gray-300 font-semibold">{spec.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VECTOR MAP EMBED COMPONENT */}
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-bold text-white tracking-tight border-b border-white/5 pb-2">Location mapping & neighborhood</h3>
            
            <div className="relative h-56 bg-slate-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between p-4">
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '100%, 20px 20px, 20px 20px'
              }}></div>

              <div className="z-10 flex justify-between items-start">
                <span className="text-[10px] bg-brand-dark/80 px-2.5 py-1.5 rounded-lg border border-white/5 font-mono text-gray-300">
                  GIS Marker: {location.coordinates.lat}, {location.coordinates.lng}
                </span>
                
                <span className="text-[10px] bg-brand-blue text-white px-2 py-1 rounded">
                  {location.neighborhood} Environs
                </span>
              </div>

              {/* Simple Vector pin drop animation on mock map */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="relative">
                  <div className="absolute -inset-4 bg-brand-blue/30 rounded-full animate-ping"></div>
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </div>
                </div>
              </div>

              <div className="z-10 bg-brand-dark/95 backdrop-blur-md p-3 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div>
                  <span className="text-gray-500 uppercase font-mono block">Zone Rating</span>
                  <span className="text-brand-gold font-bold">⭐⭐⭐⭐⭐ 5.0</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-mono block">Transit distance</span>
                  <span className="text-gray-300 font-bold">12 Mins to CBD</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase font-mono block">Borehole flow</span>
                  <span className="text-green-400 font-bold">Continuous 24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* HOUSE REVIEW SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-white tracking-tight border-b border-white/5 pb-2">Active Tenant Critiques ({localReviews.length})</h3>
            
            {/* Review form */}
            <form onSubmit={handleAddReview} className="glass-premium p-4 rounded-xl border border-white/5 space-y-3">
              <span className="block text-[10px] text-gray-400 uppercase font-mono">Submit your verified inspection feedback</span>
              
              <div className="flex gap-4 items-center">
                <span className="text-xs text-gray-300">Your score:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="text-sm transition-transform hover:scale-115"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-brand-gold font-bold">({newReviewRating}.0 / 5.0)</span>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Review comment: details security, water pressure, layout veracity..."
                  className="flex-1 bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                />
                <button 
                  type="submit"
                  className="bg-brand-blue text-white hover:bg-blue-600 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-transform active:scale-95"
                >
                  Post Review
                </button>
              </div>
            </form>

            {/* List reviews */}
            <div className="space-y-3">
              {localReviews.map(rev => (
                <div key={rev.id} className="p-4 bg-brand-card/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={rev.authorAvatar} alt="user" className="w-6 h-6 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <span className="text-xs font-bold text-white">{rev.authorName}</span>
                    </div>
                    <div className="flex gap-1 text-[10px] items-center">
                      <span className="text-brand-gold">⭐</span>
                      <span className="text-gray-300 font-mono font-bold">{rev.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 italic">"{rev.comment}"</p>
                  <p className="text-[9px] text-gray-500 font-mono text-right">{new Date(rev.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Price/Deposit, Booking Form Scheduler */}
        <div className="space-y-6">
          
          {/* STICKY RATING LEDGER HIGHLIGHT BAR */}
          <div className="glass-premium p-6 rounded-3xl border border-brand-gold/30 ring-1 ring-brand-gold/10 shadow-lg shadow-brand-gold/5 space-y-4">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider block">Authorized Lease terms</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-serif font-black text-white">{formattedPrice()}</span>
                <span className="text-xs text-gray-400 font-mono uppercase">/ {pricing.frequency}</span>
              </div>
              <span className="text-[11px] text-gray-300 font-mono block mt-1.5">Refundable Bond: {formattedDeposit()}</span>
            </div>

            {/* REPRESENTATIVE CARD */}
            <div className="p-3 bg-brand-dark/60 rounded-2xl border border-white/5 flex items-center gap-3">
              <img 
                src={author.avatar} 
                alt={author.name} 
                className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">{author.name}</span>
                <span className="text-[9px] text-gray-500 font-mono uppercase block">{author.role} • Premium Partner</span>
              </div>
              {author.isVerified && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                  KYC Verified
                </span>
              )}
            </div>

            {/* Direct Instant Contact form */}
            <form onSubmit={handleInquirySubmit} className="space-y-2 border-t border-white/5 pt-4">
              <span className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Instant Inquiry Messenger</span>
              
              <textarea 
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
                rows={3}
                required
                className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-2 md:p-3 text-[11px] text-white outline-none focus:border-brand-blue resize-none"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Submit Direct message
              </button>

              <AnimatePresence>
                {inquirySuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-lg text-center font-mono mt-1"
                  >
                    🚀 Inquiry sent securely with Resend verification.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* PHYSICAL VIEWING SCHEDULER WIDGET */}
            <form onSubmit={handleBookTour} className="space-y-3.5 border-t border-white/5 pt-4">
              <span className="block text-[10px] text-gray-400 uppercase font-mono">Coordinate Site Tour</span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] text-gray-500 uppercase font-mono mb-1">Target Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                    className="w-full bg-brand-dark border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-gray-500 uppercase font-mono mb-1">Term Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    required
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 uppercase font-mono mb-1">Scheduler instructions (Optional)</label>
                <input 
                  type="text" 
                  value={schedulerNotes}
                  onChange={(e) => setSchedulerNotes(e.target.value)}
                  placeholder="Need wheelchair access/parking spot..."
                  className="w-full bg-brand-dark border border-white/10 rounded-xl p-2 text-xs text-white outline-none focus:border-brand-blue"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-gold to-amber-600 text-brand-dark font-sans font-black py-2.5 rounded-xl text-xs hover:shadow-lg hover:shadow-brand-gold/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Physical Tour
              </button>

              <AnimatePresence>
                {scheduleSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl text-center space-y-1"
                  >
                    <p className="font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Session Pending Confirmation
                    </p>
                    <p className="text-[9px] text-gray-400 leading-none">We notified the authorized custodian agent.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

          </div>

          {/* SIMILAR PROPERTIES CAROUSEL PREVIEWS */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono text-gray-400 border-b border-white/5 pb-2">Matching recommendations</h4>
            <div className="space-y-3">
              {similarProperties.length === 0 ? (
                <div className="text-center py-4 text-gray-600 text-xs font-mono">
                  No overlapping records found
                </div>
              ) : (
                similarProperties.map(prop => (
                  <div
                    key={prop.id}
                    onClick={() => onSelectSimilar(prop.id)}
                    className="p-2.5 bg-brand-card/40 border border-white/5 hover:border-white/10 rounded-2xl flex gap-3 cursor-pointer group transition-all"
                  >
                    <img 
                      src={prop.media.images[0]?.url} 
                      alt={prop.title} 
                      className="w-14 h-14 rounded-lg object-cover border border-white/5 group-hover:scale-102 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 pr-1 py-0.5 flex flex-col justify-between">
                      <h5 className="text-[11px] font-bold text-gray-200 group-hover:text-brand-blue truncate transition-colors leading-tight">
                        {prop.title}
                      </h5>
                      <span className="text-[9px] font-mono text-gray-500 block truncate">{prop.location.neighborhood}</span>
                      <span className="text-[10px] font-serif font-black text-brand-gold mt-1 leading-none block">
                        {prop.pricing.currency === 'USD' ? '$' : 'KSh '}{prop.pricing.rent.toLocaleString()} / mo
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX BACKDROP PANEL */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-[110] bg-brand-dark/95 backdrop-blur-md flex flex-col justify-between p-4">
            
            {/* Header overlay */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">Zoom Gallery Asset #{lightboxIndex + 1} of {media.images.length}</span>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="text-xs text-gray-100 hover:text-white bg-white/5 px-4 py-2 border border-white/5 rounded-xl hover:bg-white/10"
              >
                Exit Zoom ✕
              </button>
            </div>

            {/* Slider container */}
            <div className="flex-1 flex items-center justify-between gap-4 max-w-4xl mx-auto w-full relative">
              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + media.images.length) % media.images.length)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white"
              >
                ◀
              </button>

              <div className="flex-1 h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl relative">
                <img 
                  src={media.images[lightboxIndex]?.url} 
                  className="max-h-full max-w-full object-contain rounded-xl" 
                  alt="Zoom detail" 
                  referrerPolicy="no-referrer"
                />
              </div>

              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % media.images.length)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white"
              >
                ▶
              </button>
            </div>

            {/* Thumb indexes */}
            <div className="flex justify-center gap-2 overflow-x-auto whitespace-nowrap max-w-lg mx-auto py-2">
              {media.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-14 h-10 rounded-md overflow-hidden border ${
                    idx === lightboxIndex ? 'border-brand-blue ring-1 ring-brand-blue/20' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="Thumb" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* FLAG/REPORT SYSTEM MODAL */}
      <AnimatePresence>
        {flagModalOpen && (
          <div className="fixed inset-0 z-100 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-premium rounded-3xl p-6 border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setFlagModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">
                  ⚠
                </div>
                <h4 className="text-lg font-bold font-serif text-white">Flag Property Listing</h4>
                <p className="text-xs text-gray-400 mt-1 uppercase font-mono">Platform Integrity Moderation Check</p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Violation Reason</label>
                  <select 
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue"
                  >
                    <option value="Duplicate Listing">Duplicate Listing (Spam)</option>
                    <option value="Inaccurate Price">Inaccurate Pricing or Hidden Broker fees</option>
                    <option value="Scam/Fraud Activity">Suspected Scam details / Fraudulent landlord</option>
                    <option value="Stale Inventory">Already rented / Unavailable inventory</option>
                    <option value="Incomplete details">Misrepresented visuals or details</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Incident Report specifics</label>
                  <textarea 
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    rows={3}
                    required
                    placeholder="Provide web page links, conflicting phone numbers, or details verifying this claim..."
                    className="w-full bg-brand-dark/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-brand-blue resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setFlagModalOpen(false)}
                    className="flex-1 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl border border-white/5 py-2 text-xs"
                  >
                    Cancel claim
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-xl py-2 text-xs font-bold"
                  >
                    Submit Case
                  </button>
                </div>

                <AnimatePresence>
                  {flagSuccess && (
                     <motion.p 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="text-center font-mono text-[10px] text-green-400 pt-1"
                     >
                       ✓ Case submitted. Admin moderator will review in 24 hours.
                     </motion.p>
                  )}
                </AnimatePresence>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

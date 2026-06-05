import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X,
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  ShieldCheck,
  Check,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Shield,
  Dribbble,
  Play,
  RotateCcw,
  Loader2,
  Copy,
  Building,
  Home
} from 'lucide-react';
import { Listing, ViewingRequest, Inquiry } from '../types';

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
  const { id, title, description, propertyType, location, details, pricing, media, author, isFeatured } = listing;

  // Image Carousel state (Upgrade 6)
  const [imageIndex, setImageIndex] = useState(0);

  // Inquiry Form state
  const [senderName, setSenderName] = useState('Erick Cheruiyot');
  const [senderPhone, setSenderPhone] = useState(localStorage.getItem('nestlist_user_phone') || '0712345678');
  const [senderEmail, setSenderEmail] = useState('mkenya@nestlist.ke');
  const [inquiryMsg, setInquiryMsg] = useState(`Habari! I am highly interested in securing this ${propertyType} listed at ${location.neighborhood}. Let me know how we can book a physical walkthrough.`);
  
  // Custom form loading spinner & check animations (Upgrade 6)
  const [isInquiring, setIsInquiring] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  
  // Custom clipboard share states
  const [copiedLink, setCopiedLink] = useState(false);

  const formattedPrice = () => {
    const symbol = pricing.currency === 'USD' ? '$' : 'KES ';
    return `${symbol}${pricing.rent.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images && media.images.length > 0) {
      setImageIndex((imageIndex + 1) % media.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images && media.images.length > 0) {
      setImageIndex((imageIndex - 1 + media.images.length) % media.images.length);
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(`https://nestlist.ke/listings/${id}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone || !senderEmail || !inquiryMsg) {
      alert("Please fill in all details for your inquiry.");
      return;
    }

    if (inquiryMsg.length > 300) {
      alert("Please shorten your message under 300 characters.");
      return;
    }

    setIsInquiring(true);

    // Simulate sending network request (duration 1500ms)
    setTimeout(() => {
      const freshInquiry: Inquiry = {
        id: `inq-${Date.now()}`,
        listingId: id,
        listingTitle: title,
        listingImage: media.images ? (media.images[0]?.url || '') : '',
        senderName,
        senderEmail,
        senderPhone,
        message: inquiryMsg,
        isReplied: false,
        createdAt: new Date().toISOString()
      };

      onAddInquiry(freshInquiry);
      setIsInquiring(false);
      setInquirySuccess(true);

      setTimeout(() => {
        setInquirySuccess(false);
        onBack(); // Close details dynamically after success animation
      }, 2000);
    }, 1500);
  };

  const handleCallLandlord = () => {
    const landlordNumber = author.phone || '+254 712 345 678';
    alert(`Dialing Landlord/Agent ${author.name} at ${landlordNumber}.\n\n🛡️ Kenya Safekeeping Escrow Protected Direct Call.`);
  };

  // Maps amenity keywords to elegant Lucide icon components (Upgrade 6)
  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('web')) return <Wifi className="w-4 h-4 text-indigo-400" />;
    if (lower.includes('parking') || lower.includes('garage') || lower.includes('car')) return <Car className="w-4 h-4 text-indigo-400" />;
    if (lower.includes('security') || lower.includes('cctv') || lower.includes('guard')) return <Shield className="w-4 h-4 text-indigo-400" />;
    if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) return <Dribbble className="w-4 h-4 text-indigo-400" />;
    if (lower.includes('pool') || lower.includes('swimming') || lower.includes('water')) return <Play className="w-4 h-4 text-indigo-400 rotate-90" />;
    return <Check className="w-4 h-4 text-emerald-400" />;
  };

  // Find 3 similar properties excluding the current one
  const similarProperties = allListings
    .filter(item => item.propertyType === propertyType && item.id !== id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-0 md:p-4">
      {/* Backdrop Dismissor */}
      <div 
        onClick={onBack} 
        className="absolute inset-0 cursor-zoom-out"
        title="Close View"
      />

      {/* Slide-up Native Mobile Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="bg-[#08080C] border-t border-white/10 w-full max-w-2xl rounded-t-[32px] overflow-hidden max-h-[94vh] overflow-y-auto pb-12 relative z-15 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] flex flex-col font-sans text-left"
      >
        {/* Top visual drag handle bar */}
        <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto my-3.5 shrink-0" />

        {/* Close and Share Overlay Controllers */}
        <div className="absolute top-4 right-4 z-25 flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="bg-black/60 hover:bg-black/85 border border-white/10 text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Copy Listing Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
          </button>
          
          <button 
            onClick={onBack}
            className="bg-black/60 hover:bg-black/85 border border-white/10 text-white rounded-full p-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo Gallery with swipe triggers + left/right Arrows + Dot indicators (Upgrade 6) */}
        <div className="relative h-[260px] md:h-[300px] w-full bg-[#0E0F1C] shrink-0 overflow-hidden">
          {media.images && media.images.length > 0 ? (
            <div className="w-full h-full relative group">
              <img 
                src={media.images[imageIndex]?.url} 
                alt={`${title} - Image ${imageIndex + 1}`} 
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Carousel arrows */}
              {media.images.length > 1 && (
                <div className="absolute inset-x-3.5 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                  <button
                    onClick={handlePrevImage}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/15 pointer-events-auto active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/15 pointer-events-auto active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Dot Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                {media.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${imageIndex === idx ? 'bg-violet-400 w-4' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-xs">
              No photo available
            </div>
          )}

          {/* Top backdrop mask */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

          {/* Bottom mask */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08080C] via-[#08080C]/70 to-transparent pointer-events-none" />

          {/* Carousel contents */}
          <div className="absolute bottom-3 inset-x-4 text-left space-y-1 z-10">
            <div className="flex flex-wrap items-center gap-2">
              {isFeatured && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[9px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider font-syne">
                  <Sparkles className="w-3 h-3 fill-black text-black" />
                  PREMIUM PARTNER
                </span>
              )}
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2.5 py-0.5 rounded uppercase font-syne tracking-wider">
                {propertyType}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black font-syne text-white tracking-tight leading-snug">
              {title}
            </h1>

            <div className="flex items-center gap-1 text-slate-300 text-xs">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold">{location.address}</span>
            </div>
          </div>
        </div>

        {/* Content body layout */}
        <div className="p-6 text-left space-y-6">
          
          {/* Main Price & Property Metrics row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-mono font-black tracking-widest">MONTHLY RENT TERMS</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-syne font-black bg-gradient-to-r from-violet-450 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                  {formattedPrice()}
                </span>
                <span className="text-xs text-slate-400 uppercase font-black">/ month</span>
              </div>
              <p className="text-xs text-slate-400 font-semibold block mt-1">
                Security Guarantee Deposit: {pricing.currency === 'USD' ? '$' : 'KES'} {pricing.deposit.toLocaleString()}
              </p>
            </div>

            {/* Quick specs boxes */}
            <div className="flex gap-2 text-[11px] font-bold font-dmsans text-slate-300">
              <div className="bg-[#121324] border border-white/5 px-3 py-2 rounded-2xl text-center min-w-[70px]">
                <span className="block text-[8px] text-slate-500 uppercase font-mono tracking-wider">BEDS</span>
                <span>{details.bedrooms} Rooms</span>
              </div>
              <div className="bg-[#121324] border border-white/5 px-3 py-2 rounded-2xl text-center min-w-[70px]">
                <span className="block text-[8px] text-slate-500 uppercase font-mono tracking-wider">BATHS</span>
                <span>{details.bathrooms} Bath</span>
              </div>
              <div className="bg-[#121324] border border-white/5 px-3 py-2 rounded-2xl text-center min-w-[70px]">
                <span className="block text-[8px] text-slate-500 uppercase font-mono tracking-wider">SIZE</span>
                <span>{details.size} m²</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-syne font-black text-indigo-400 uppercase tracking-widest font-mono">Category Description</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              {description || "Authentic luxury metropolitan real estate portfolio hand-inspected under Safekeeping procedures in Nairobi."}
            </p>
          </div>

          {/* Custom Vetted Amenities Grid (Upgrade 6) */}
          {details.amenities && details.amenities.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-syne font-black text-indigo-400 uppercase tracking-widest font-mono">Amenity Infrastructure Vetting</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {details.amenities.map(am => (
                  <div key={am} className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#121324] border border-white/5">
                    <div className="p-1.5 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {getAmenityIcon(am)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 capitalize truncate font-dmsans">{am}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps Styled Preview Widget (Upgrade 6) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-syne font-black text-indigo-400 uppercase tracking-widest font-mono">Real-world Geospatial Locator</h2>
              <span className="text-[9px] text-[#4CAF50] font-mono font-bold tracking-wide flex items-center gap-0.5 uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Satellites Synced
              </span>
            </div>
            
            <div className="relative h-[160px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
              {/* Dark Map Mockup with beautiful filters */}
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=650&h=200"
                alt="Static Vetted Coordinates"
                className="w-full h-full object-cover brightness-[0.35] contrast-[1.25] saturate-[0.8]"
              />
              {/* Pulsing beacon marker overlay directly centers */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="relative">
                  <span className="absolute -top-3.5 -left-3.5 w-10.5 h-10.5 bg-indigo-500/20 border-2 border-indigo-450 rounded-full animate-ping" />
                  <div className="w-3.5 h-3.5 bg-indigo-400 border border-white rounded-full shadow-lg relative z-10" />
                </div>
                <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-bold font-mono text-indigo-300 mt-2.5 shadow-xl uppercase">
                  Vetted Sector: {location.neighborhood || 'Nairobi'}
                </div>
              </div>
            </div>
          </div>

          {/* Vetted Representative Card */}
          <div className="bg-[#121324] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={author.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'} 
                alt={author.name} 
                className="w-11 h-11 rounded-full object-cover border border-[#08080C] shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">{author.name}</span>
                  {author.isVerified && (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> VETTED
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-slate-450 uppercase font-mono tracking-wider block mt-0.5">Kenya Licensed Escrow {author.role || 'Agent'}</span>
              </div>
            </div>

            {/* Quick Call Landlord button */}
            <button
              onClick={handleCallLandlord}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-black font-syne font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-3.5 h-3.5 text-black fill-black" />
              Call Partner
            </button>
          </div>

          {/* Similar Properties dynamic section (Upgrade 6) */}
          {similarProperties.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-syne font-black text-indigo-400 uppercase tracking-widest font-mono">Similar Properties You May Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarProperties.map(similar => (
                  <div 
                    key={similar.id}
                    onClick={() => onSelectSimilar(similar.id)}
                    className="group/sim bg-[#121324] hover:bg-[#19192f] border border-white/5 rounded-2xl p-3 text-left cursor-pointer transition-all duration-300"
                  >
                    <div className="relative h-[90px] rounded-xl overflow-hidden mb-2">
                      <img 
                        src={similar.media.images?.[0]?.url} 
                        alt={similar.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/sim:scale-105" 
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 text-[8px] font-black rounded text-indigo-300 font-mono">
                        {similar.pricing.currency === 'USD' ? '$' : 'KSh'}{similar.pricing.rent.toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-extrabold text-white font-syne leading-tight truncate group-hover/sim:text-indigo-400 transition-colors">
                      {similar.title}
                    </h4>
                    <span className="text-[9px] text-slate-500 truncate block font-dmsans font-semibold mt-0.5">{similar.location.neighborhood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inquiry form */}
          <form onSubmit={handleInquirySubmit} className="space-y-3.5 pt-5 border-t border-white/5">
            <h2 className="text-xs font-syne font-black text-indigo-400 uppercase tracking-widest font-mono">Submit Vetted Tenant Inquiry</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">Your Full Name</label>
                <input 
                  type="text" 
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="John Mwangi"
                  required
                  className="w-full bg-[#121324] border border-white/5 hover:border-white/10 focus:border-violet-500 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans transition-all"
                />
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">M-Pesa Mobile Number</label>
                <input 
                  type="tel" 
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="0712345678"
                  required
                  className="w-full bg-[#121324] border border-white/5 hover:border-white/10 focus:border-violet-500 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans transition-all"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="client@nestlist.ke"
                  required
                  className="w-full bg-[#121324] border border-white/5 hover:border-white/10 focus:border-violet-500 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans transition-all"
                />
              </div>
            </div>

            {/* Custom message field with Character Counter (Upgrade 6) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider">
                <span className="text-slate-500">Personalized Message parameters:</span>
                <span className={inquiryMsg.length > 270 ? 'text-rose-400' : 'text-slate-500'}>
                  {inquiryMsg.length} / 300 Characters
                </span>
              </div>
              <textarea 
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value.slice(0, 300))}
                rows={3}
                required
                placeholder="Submit custom terms or viewing times directly to landlord..."
                className="w-full bg-[#121324] border border-white/5 hover:border-white/10 focus:border-violet-500 rounded-xl p-3 text-xs text-white outline-none font-bold font-dmsans transition-all resize-none leading-relaxed"
              />
            </div>

            {/* "Send Inquiry" button with loading spinner & disabled states (Upgrade 6) */}
            <button
              type="submit"
              disabled={isInquiring || inquirySuccess}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white font-syne font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer shadow-lg shadow-violet-900/35"
            >
              {isInquiring ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>TRANSMITTING DETAILS...</span>
                </>
              ) : inquirySuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 animate-heart-pulse" />
                  <span>DISPATCHED!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-white fill-white/10" />
                  <span>Send Vetted Inquiry Securely</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {inquirySuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-2xl p-3 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2"
                >
                  <Check className="w-4.5 h-4.5 text-emerald-400 bg-emerald-450/20 p-0.5 rounded-full" />
                  <span>Excellent! Inquiry submitted securely. Returning to browsing flow...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

        </div>
      </motion.div>
    </div>
  );
}

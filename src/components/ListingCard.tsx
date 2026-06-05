import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Link2,
  Check,
  ShieldCheck,
  Eye,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (id: string) => void;
  viewFormat: 'grid' | 'list';
}

export default function ListingCard({
  listing,
  isFavorite,
  onToggleFavorite,
  onSelect,
  viewFormat
}: ListingCardProps) {
  const { id, title, propertyType, location, details, pricing, media, author, isFeatured, createdAt, views } = listing;
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom states for rich micro-interactions (Upgrade 4)
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pulseHeart, setPulseHeart] = useState(false);

  // Compute stats badges
  const daysAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const isNew = daysAgo <= 7;
  const isHot = views >= 50;
  const isExpiring = daysAgo > 25 && daysAgo <= 30; // simulated expiring logic

  const formattedPrice = () => {
    let symbol = pricing.currency === 'USD' ? 'USD ' : 'KES ';
    if (pricing.currency === 'KES') {
      return `KES ${pricing.rent.toLocaleString()}`;
    }
    return `${symbol}${pricing.rent.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images && media.images.length > 0) {
      setCurrentImageIdx((currentImageIdx + 1) % media.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images && media.images.length > 0) {
      setCurrentImageIdx((currentImageIdx - 1 + media.images.length) % media.images.length);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedLink(true);
    navigator.clipboard.writeText(`https://nestlist.ke/listings/${id}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareSocial = (e: React.MouseEvent, type: 'whatsapp' | 'twitter') => {
    e.stopPropagation();
    const text = encodeURIComponent(`Rent this home in Kenya: "${title}" - ${formattedPrice()} on NestList!`);
    const url = `https://nestlist.ke/listings/${id}`;
    
    setShowShareTooltip(false);
    
    const shareUrl = type === 'whatsapp' 
      ? `https://api.whatsapp.com/send?text=${text}%20${url}`
      : `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      
    navigator.clipboard.writeText(`${text} ${url}`);
    alert(`Copied Link for WhatsApp sharing:\n"${title}" (${formattedPrice()})`);
  };

  const triggerFavoriteWithPulse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPulseHeart(true);
    onToggleFavorite(id, e);
    setTimeout(() => setPulseHeart(false), 600);
  };

  const cardAmenities = details.amenities || [];
  const visibleAmenities = cardAmenities.slice(0, 3);
  const remainingCount = cardAmenities.length - 3;

  // Render Listing view format: LIST
  if (viewFormat === 'list') {
    return (
      <motion.div
        id={`listing-card-${id}`}
        layout
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => onSelect(id)}
        className={`group bg-[#0E0F1C]/85 backdrop-blur-lg rounded-3xl relative flex flex-col md:flex-row gap-5 p-4 transition-all duration-300 border cursor-pointer hover:shadow-2xl hover:shadow-violet-950/40 ${
          isFeatured 
            ? 'border-amber-400/30 shadow-[0_0_20px_rgba(245,200,66,0.12)] bg-[#141528]/95 glow-gold-premium' 
            : 'border-white/5 hover:border-white/10'
        }`}
      >
        {/* Photo on left - 180px wide with skeleton loaders */}
        <div className="relative w-full md:w-[220px] h-[160px] rounded-2xl overflow-hidden shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-skeleton z-10" />
          )}
          {media.images && media.images.length > 0 ? (
            <img
              src={media.images[currentImageIdx]?.url}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-[#121324] flex items-center justify-center text-slate-500 text-xs font-mono">
              No image
            </div>
          )}

          {/* Gradient Overlay on Photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080F] via-transparent to-black/35"></div>

          {/* Badges on top-left of image (dynamic counts + labels Upgrade 4) */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
            {isFeatured && (
              <span className="flex items-center gap-1 bg-[#F5C842] text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md font-dmsans animate-gold-shimmer">
                ★ PREMIUM
              </span>
            )}
            {isNew && (
              <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> NEW
              </span>
            )}
            {isHot && (
              <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" /> HOT
              </span>
            )}
            {isExpiring && (
              <span className="bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> EXPIRING
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
            <span className="text-sm font-black text-white text-shadow-subtle font-syne">
              {formattedPrice()}
            </span>
          </div>

          {/* Detail sliding highlight */}
          <div className="absolute inset-0 bg-[#0E0F1C]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-syne font-black px-3.5 py-2 rounded-xl shadow-lg">
              VIEW DETAILS
            </span>
          </div>
        </div>

        {/* Content detail right */}
        <div className="flex-grow flex flex-col justify-between text-left py-1">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              {/* Geolocation */}
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest font-dmsans text-indigo-300/80">
                  {location.neighborhood || 'Nairobi'} • {location.county || 'Metro'}
                </span>
              </div>

              {/* Action row (heart, share) */}
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button
                    onClick={() => setShowShareTooltip(!showShareTooltip)}
                    className="p-1.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Share property"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {showShareTooltip && (
                    <div className="absolute right-0 bottom-full mb-2 w-44 bg-[#121324] border border-white/10 rounded-2xl p-1 shadow-2xl z-50 flex flex-col">
                      <button 
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[10px] text-slate-300 font-bold"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
                        {copiedLink ? 'Copied' : 'Copy link'}
                      </button>
                      <button 
                        onClick={(e) => handleShareSocial(e, 'whatsapp')}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[10px] text-emerald-400 font-extrabold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* HEART BUTTON AT TOP-RIGHT OF CARD/MEDIA IN GROUP */}
                <button
                  onClick={triggerFavoriteWithPulse}
                  className={`p-1.5 rounded-xl transition-all active:scale-75 ${
                    isFavorite 
                      ? 'text-rose-500 bg-rose-500/10' 
                      : 'text-slate-550 hover:text-rose-450 hover:bg-rose-500/5'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-505' : ''} ${pulseHeart ? 'animate-heart-pulse text-rose-500' : ''}`} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-extrabold font-syne text-white leading-snug group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <span className="text-xs text-slate-400 block mt-1 font-dmsans font-semibold">{location.address}</span>
          </div>

          <div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
              {/* Specs bar (beds, baths, size) */}
              <div className="flex items-center gap-3 text-xs text-slate-200 font-bold font-dmsans">
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-indigo-400" />
                  {details.bedrooms} {details.bedrooms === 1 ? 'Bed' : 'Beds'}
                </span>
                <span className="text-white/10">•</span>
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-indigo-400" />
                  {details.bathrooms} {details.bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
                <span className="text-white/10">•</span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                  {details.size} m²
                </span>
              </div>

              {/* Amenity list indicators */}
              {cardAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {visibleAmenities.map((amen, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded-full text-slate-400 font-bold font-dmsans">
                      {amen}
                    </span>
                  ))}
                  {remainingCount > 0 && (
                    <span className="bg-violet-500/15 border border-violet-500/20 text-[9px] px-2 py-0.5 rounded-full text-violet-400 font-black font-dmsans">
                      +{remainingCount}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Landlord information footer block (Upgrade 4) */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <img 
                src={author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                alt={author.name} 
                className="w-6 h-6 rounded-full object-cover border border-[#08080F]"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black uppercase text-slate-300 font-dmsans tracking-wide">{author.name}</span>
                <span className="text-[10px] text-slate-500 font-semibold font-mono">({author.role})</span>
                {author.isVerified && (
                  <span className="flex items-center gap-0.5 text-emerald-400 text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full uppercase ml-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> VERIFIED
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // DEFAULT GRID VIEW FORMAT
  return (
    <motion.div
      id={`listing-card-${id}`}
      layout
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => onSelect(id)}
      className={`group bg-[#0E0F1C]/85 backdrop-blur-lg rounded-3xl overflow-hidden relative flex flex-col justify-between transition-all duration-300 border cursor-pointer hover:shadow-2xl hover:shadow-purple-950/30 ${
        isFeatured 
          ? 'border-amber-400/30 shadow-[0_0_20px_rgba(245,200,66,0.12)] bg-[#141528]/95 glow-gold-premium' 
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      {/* Photo takes top visual structure */}
      <div className="relative w-full h-[200px] overflow-hidden shrink-0 bg-[#0E0F1C]">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-skeleton z-10" />
        )}
        {media.images && media.images.length > 0 ? (
          <img
            src={media.images[currentImageIdx]?.url}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#121324] flex items-center justify-center text-slate-500 text-xs font-mono">
            No image available
          </div>
        )}

        {/* Gradient Overlay on Photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080F] via-transparent to-black/35"></div>

        {/* Swipe arrows inside thumbnail */}
        {media.images && media.images.length > 1 && (
          <div className="absolute inset-x-2.5 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handlePrevImage}
              className="w-6 h-6 rounded-full bg-[#08080F]/80 backdrop-blur-md hover:bg-[#08080F] text-white flex items-center justify-center border border-white/10 shadow-sm active:scale-[0.8] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextImage}
              className="w-6 h-6 rounded-full bg-[#08080F]/80 backdrop-blur-md hover:bg-[#08080F] text-white flex items-center justify-center border border-white/10 shadow-sm active:scale-[0.8] transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Badges top-left of image */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1 pointer-events-none">
          {isFeatured && (
            <span className="flex items-center gap-1 bg-[#F5C842] text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shadow-md font-dmsans animate-gold-shimmer">
              ★ PREMIUM
            </span>
          )}
          {isNew && (
            <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-2.5 h-2.5" /> NEW
            </span>
          )}
          {isHot && (
            <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
              <Flame className="w-2.5 h-2.5" /> HOT
            </span>
          )}
          {isExpiring && (
            <span className="bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Clock className="w-2.5 h-2.5" /> EXPIRING
            </span>
          )}
        </div>

        {/* Favorite button top-right of photo overlay */}
        <div className="absolute top-2.5 right-2.5 z-25 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={triggerFavoriteWithPulse}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[#08080F]/65 hover:bg-[#08080F] backdrop-blur-md cursor-pointer border border-white/10 ${
              isFavorite 
                ? 'text-rose-500 ring-2 ring-rose-500/20' 
                : 'text-slate-350 hover:text-rose-405'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''} ${pulseHeart ? 'animate-heart-pulse text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Price overlay at bottom, highly stylized bold */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between pointer-events-none z-10">
          <span className="text-base font-black text-white text-shadow-subtle font-syne">
            {formattedPrice()}
          </span>
          <span className="text-[10px] text-slate-300 font-black font-dmsans uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
            / mth
          </span>
        </div>

        {/* Detail hover sliding backdrop overlay */}
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[#0E0F1C]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
          <span className="bg-gradient-to-r from-violet-605 via-fuchsia-600 to-indigo-605 text-white text-[10px] font-syne font-black px-5 py-2.5 rounded-xl shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 tracking-wider">
            VIEW DETAILS
          </span>
        </div>
      </div>

      {/* Content bottom section */}
      <div className="p-4 flex-grow flex flex-col justify-between text-left">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            {/* Geolocation */}
            <div className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest font-dmsans text-indigo-300/80 truncate max-w-[190px]">
                {location.neighborhood || 'Nairobi'} • {location.county || 'Metro'}
              </span>
            </div>

            {/* Social Share Trigger */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowShareTooltip(!showShareTooltip)}
                className="p-1 rounded-lg hover:bg-[#121324] text-slate-500 hover:text-white transition-colors"
                title="Share property"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              {showShareTooltip && (
                <div className="absolute right-0 bottom-full mb-1.5 w-44 bg-[#121324] border border-white/10 rounded-2xl p-1 shadow-2xl z-50 flex flex-col">
                  <button 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 text-[10px] text-slate-300 font-bold"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5 text-slate-505" />}
                    {copiedLink ? 'Copied' : 'Copy link'}
                  </button>
                  <button 
                    onClick={(e) => handleShareSocial(e, 'whatsapp')}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 text-[10px] text-emerald-400 font-extrabold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-base font-extrabold font-syne text-white leading-snug truncate group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <span className="text-[11px] text-slate-400 block truncate font-dmsans mt-0.5 font-semibold">{location.address}</span>
        </div>

        {/* Stats segment description */}
        <div className="mt-3.5 pt-3.5 border-t border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold font-dmsans">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-indigo-400" />
              {details.bedrooms} {details.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-indigo-400" />
              {details.bathrooms} {details.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
            <span className="text-white/10">•</span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              {details.size} m²
            </span>
          </div>

          {/* Render limited display details */}
          {cardAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleAmenities.map((amen, idx) => (
                <span key={idx} className="bg-white/5 border border-white/10 text-[9px] px-1.5 py-0.5 rounded-full text-slate-400 font-bold font-dmsans">
                  {amen}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="bg-violet-500/10 border border-violet-500/20 text-[9px] px-1.5 py-0.5 rounded-full text-violet-400 font-black font-dmsans">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}

          {/* Landlord information footer block (Upgrade 4) */}
          <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
            <img 
              src={author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'} 
              alt={author.name} 
              className="w-5.5 h-5.5 rounded-full object-cover border border-[#08080F]"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div className="flex items-center gap-0.5 min-w-0">
                <span className="text-[10px] font-black uppercase text-slate-300 font-dmsans tracking-wide truncate">{author.name}</span>
                {author.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />}
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase shrink-0">{author.role}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

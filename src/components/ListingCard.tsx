/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Star, 
  Share2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Link2,
  Check
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
  const { id, title, propertyType, location, details, pricing, media, author, isFeatured, createdAt } = listing;
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if listed within 7 days
  const isNew = () => {
    const createdDate = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  };

  const formattedPrice = () => {
    const symbol = pricing.currency === 'USD' ? '$' : 'KES ';
    return `${symbol}${pricing.rent.toLocaleString()}`;
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images.length > 0) {
      setCurrentImageIdx((currentImageIdx + 1) % media.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media.images.length > 0) {
      setCurrentImageIdx((currentImageIdx - 1 + media.images.length) % media.images.length);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedLink(true);
    navigator.clipboard.writeText(`https://nestlist.luxury/listings/${id}`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareSocial = (e: React.MouseEvent, type: 'whatsapp' | 'twitter') => {
    e.stopPropagation();
    const text = encodeURIComponent(`Take a look at this stunning luxury real estate finding: "${title}" - ${formattedPrice()} on NestList!`);
    const url = `https://nestlist.luxury/listings/${id}`;
    let shareUrl = '';
    if (type === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else {
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    }
    // We cannot open blank windows in our restricted sandboxed iframe environment, 
    // so we show a beautiful temporary toast-like confirmation in the tooltip
    setShowShareTooltip(false);
    alert(`Mock sharing to ${type === 'whatsapp' ? 'WhatsApp' : 'Twitter'}:\n"${title}"`);
  };

  return (
    <motion.div
      id={`listing-card-${id}`}
      layout
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={() => onSelect(id)}
      className={`glass-premium-interactive h-full group/card cursor-pointer overflow-hidden rounded-3xl relative flex ${
        viewFormat === 'list' ? 'flex-col md:flex-row gap-4 p-4' : 'flex-col'
      } ${
        isFeatured 
          ? 'border-brand-gold/45 ring-1 ring-brand-gold/25 shadow-xl shadow-brand-gold/10 bg-gradient-to-br from-[#1b263b] to-brand-dark/40' 
          : 'border-[#1e293b] hover:border-brand-blue/30'
      }`}
    >
      {/* Dynamic badging container (absolute over top of image) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 pointer-events-none">
        {isFeatured && (
          <span className="flex items-center gap-1 bg-gradient-to-r from-brand-gold to-yellow-600 text-brand-dark text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            <Star className="w-3 h-3 fill-brand-dark text-brand-dark" />
            Premium
          </span>
        )}
        {isNew() && (
          <span className="bg-brand-blue text-white text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            New
          </span>
        )}
        <span className="bg-brand-dark/85 backdrop-blur-md text-gray-200 text-[9px] font-medium font-mono px-2.5 py-1 rounded-full border border-white/5">
          {propertyType}
        </span>
      </div>

      {/* Image Gallery wrapper */}
      <div className={`relative ${viewFormat === 'list' ? 'w-full md:w-72 h-48 md:h-full rounded-2xl' : 'w-full h-56'} overflow-hidden rounded-t-2xl md:rounded-t-3xl`}>
        {media.images && media.images.length > 0 ? (
          <img
            src={media.images[currentImageIdx]?.url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-500 text-xs font-mono">
            No Media Loaded
          </div>
        )}

        {/* Carousel Prev/Next Buttons (Visible on hover) */}
        {media.images && media.images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
            <button
              onClick={handlePrevImage}
              className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-white flex items-center justify-center border border-white/5 shadow-md hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-white flex items-center justify-center border border-white/5 shadow-md hover:scale-110 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Indicators dot bar */}
        {media.images && media.images.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1">
            {media.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIdx ? 'bg-brand-blue w-3' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Context info split */}
      <div className={`p-5 flex-1 flex flex-col justify-between ${viewFormat === 'list' && 'md:p-2'}`}>
        
        <div>
          {/* First line: Location & Actions */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1 text-brand-gold">
              <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span className="text-[11px] font-mono tracking-wider font-extrabold uppercase text-brand-gold truncate max-w-[200px] md:max-w-xs">
                {location.neighborhood} • {location.county || 'Nairobi'}
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              
              {/* Share Trigger */}
              <div className="relative">
                <button
                  id={`share-btn-${id}`}
                  onClick={() => setShowShareTooltip(!showShareTooltip)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Share Asset"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                
                {showShareTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 glass-premium border border-white/10 rounded-xl p-2 shadow-2xl z-40 flex flex-col gap-1">
                    <button 
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[11px] text-gray-200"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Link2 className="w-3.5 h-3.5 text-brand-blue" />}
                      {copiedLink ? 'Copied' : 'Copy Listing Link'}
                    </button>
                    <button 
                      onClick={(e) => handleShareSocial(e, 'whatsapp')}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[11px] text-gray-200"
                    >
                      <Send className="w-3.5 h-3.5 text-green-500" />
                      Send to WhatsApp
                    </button>
                    <button 
                      onClick={(e) => handleShareSocial(e, 'twitter')}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-[11px] text-gray-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-brand-blue" />
                      Share to Twitter
                    </button>
                  </div>
                )}
              </div>

              {/* Heart Switcher */}
              <button
                id={`favorite-btn-${id}`}
                onClick={(e) => onToggleFavorite(id, e)}
                className={`p-1.5 rounded-lg transition-all ${
                  isFavorite 
                    ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/30' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className="text-base font-serif font-semibold text-white tracking-tight leading-tight group-hover/card:text-brand-blue transition-colors duration-200 line-clamp-1 mb-1">
            {title}
          </h4>
          <span className="text-[10px] text-gray-400 font-mono block mb-2">{location.address}</span>

          {/* neighborhood pill */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {location.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[9px] font-mono tracking-wider bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-semibold px-2 py-0.5 rounded-full uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Third segment: price and details combo */}
        <div>
          {/* Beds / Baths / Area Specs */}
          <div className="flex items-center justify-between border-t border-b border-white/5 py-2.5 mb-3.5 text-gray-300 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              {details.bedrooms} {details.bedrooms > 1 ? 'Beds' : 'Bed'}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              {details.bathrooms} {details.bathrooms > 1 ? 'Baths' : 'Bath'}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              {details.size} {details.sizeUnit}
            </span>
          </div>

          {/* Author avatar & Price block */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <img 
                src={author.avatar} 
                alt={author.name} 
                className="w-7 h-7 rounded-full object-cover border border-white/10" 
                referrerPolicy="no-referrer"
              />
              <div className="leading-none">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-gray-200 font-medium block truncate max-w-[80px]">{author.name}</span>
                  {author.isVerified && (
                    <span className="inline-flex items-center justify-center bg-brand-gold/15 text-brand-gold text-[7px] font-black rounded-full w-3.5 h-3.5 border border-brand-gold/25" title="KYC Verified Representative">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-[8px] text-gray-500 font-mono uppercase">{author.role}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-lg font-serif font-bold text-white leading-none">
                {formattedPrice()}
              </p>
              <p className="text-[10px] text-gray-400 font-mono uppercase mt-0.5">
                {pricing.frequency === 'monthly' ? '/ Month' : `/${pricing.frequency}`}
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

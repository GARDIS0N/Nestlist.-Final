import React from "react";
import { 
  X, MapPin, Check, Eye, Calendar, Shield, Droplets, Car, FileText, 
  School, Home, DollarSign, MessageSquare 
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  county: string;
  price: number;
  bedrooms: number;
  type: string;
  status: "available" | "taken";
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  
  // Property features fields
  amenities?: string[];
  water_availability?: string;
  security_info?: string;
  parking?: string;
  furnished_status?: "furnished" | "unfurnished";
  rules?: string;
  nearby_places?: string;
  image_urls?: string[];
}

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onInquire: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onInquire,
  favorites,
  onToggleFavorite
}) => {
  const isFavorite = favorites.includes(property.id);

  // Fallback defaults for premium feeling features
  const price = property.price || 15000;
  const bedrooms = property.bedrooms !== undefined ? property.bedrooms : 2;
  const amenitiesList = property.amenities || ["High-speed WiFi", "Hot shower", "Solar backup", "Balcony"];
  const water = property.water_availability || "Borehole & Council (Available 24/7)";
  const security = property.security_info || "24/7 Security Guard, CCTV, and Electric Fence";
  const parkingStatus = property.parking || "On-site secure private parking slot";
  const furnished = property.furnished_status || "unfurnished";
  const rules = property.rules || "No loud music. Rent paid by 5th of each month.";
  const nearby = property.nearby_places || "Near KCA University, Metropolitan Hospital, and Garden City Mall.";
  
  // Custom type label mapper
  const typeMap: Record<string, string> = {
    single_room: "Single Room",
    bedsitter: "Bedsitter",
    studio: "Studio Apartment",
    "1br": "1 Bedroom",
    "2br": "2 Bedroom",
    "3br": "3 Bedroom",
    "4br": "4 Bedroom",
    "5br_plus": "5+ Bedroom"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-cream rounded-3xl w-full max-w-2xl shadow-2xl relative animate-scaleUp text-start flex flex-col max-h-[92vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header visual block */}
        <div className="relative h-64 bg-green-dark text-white p-6 flex flex-col justify-end select-none overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
          
          {/* Cover asset replacement */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-60" />

          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1.5 rounded-full bg-black/40 hover:bg-black/60 z-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Type Badge */}
          <div className="absolute top-4 left-4 bg-gold text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full z-20">
            {typeMap[property.type] || property.type}
          </div>

          <div className="relative z-20">
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-1 text-white leading-tight">
              {property.title}
            </h2>
            <p className="text-white/80 text-xs flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gold" /> {property.location}, {property.county} County
            </p>
          </div>
        </div>

        {/* Modal body contents */}
        <div className="p-6 md:p-8 space-y-6 flex-1 text-charcoal">
          
          {/* Key Facts strip */}
          <div className="grid grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200/55 shadow-sm text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Monthly Rent</span>
              <span className="text-base font-extrabold text-green-mid font-mono">KSh {price.toLocaleString()}</span>
            </div>
            <div className="border-x border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Space Layout</span>
              <span className="text-sm font-extrabold text-slate-700 block mt-0.5">
                {bedrooms > 0 ? `${bedrooms} Bedrooms` : "Studio room"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Furnishing Status</span>
              <span className="text-xs font-bold text-slate-700 capitalize block mt-1">{furnished}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans">
              <FileText className="w-3.5 h-3.5 text-gold" /> Description & Features
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              {property.description || "Beautiful clean residential unit conveniently positioned in a prime location. Well-maintained building, responsive maintenance, perfect security system, easily reachable public transportation links."}
            </p>
          </div>

          {/* Bento Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: General building utilities */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/55 shadow-sm space-y-3.5">
              <h5 className="text-[11px] font-extrabold text-green-dark uppercase tracking-wider pb-1.5 border-b border-slate-100">
                🏡 Living Standards
              </h5>
              
              <div className="flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Water Access</span>
                  <span className="text-xs font-semibold text-slate-700 leading-snug">{water}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Security Status</span>
                  <span className="text-xs font-semibold text-slate-700 leading-snug">{security}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Car className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Parking Slot</span>
                  <span className="text-xs font-semibold text-slate-700 leading-snug">{parkingStatus}</span>
                </div>
              </div>
            </div>

            {/* Right: Rules & Surrounding Infrastructure */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/55 shadow-sm space-y-3.5">
              <h5 className="text-[11px] font-extrabold text-green-dark uppercase tracking-wider pb-1.5 border-b border-slate-100">
                📌 Neighborhood & Policies
              </h5>

              <div className="flex items-start gap-2.5">
                <School className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Nearby Landmarks</span>
                  <span className="text-xs font-medium text-slate-700 leading-snug">{nearby}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tenancy Regulations</span>
                  <span className="text-xs font-medium text-slate-700 leading-snug">{rules}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Checklist of amenities */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3.5">
              ✨ Installed Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="w-3 h-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Action trigger row */}
          <div className="pt-4 border-t border-slate-200 flex gap-4">
            <button 
              onClick={() => onToggleFavorite(property.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs border transition-all cursor-pointer text-center select-none ${
                isFavorite 
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100/70"
                  : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
              }`}
            >
              {isFavorite ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
            </button>

            <button
              onClick={onInquire}
              className="flex-[2] bg-green-mid hover:bg-green-dark text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 animate-bounce" /> Send Inquiry Message
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Home,
  Compass,
  CheckCircle,
  MapPin,
  ListPlus,
  DollarSign,
  Image,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UploadCloud,
  ChevronUp,
  HelpCircle
} from 'lucide-react';
import { Listing, PropertyType, ListingImage, Currency, PaymentFrequency, UserRole } from '../types';
import { KENYA_COUNTIES_CLEAN } from '../data/kenyaCounties';

interface ListPropertyFlowProps {
  onClose: () => void;
  onPublish: (newListing: Listing) => void;
  currentRole: UserRole;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'
];

const NAIROBI_NEIGHBORHOOD_PRESETS = [
  { name: 'Runda Enclave', address: 'Pan Africa Insurance Ln, Runda, Nairobi', lat: -1.215, lng: 36.804 },
  { name: 'Kilimani Central', address: 'Lenana Road, Kilimani, Nairobi', lat: -1.291, lng: 36.788 },
  { name: 'Westlands Heights', address: 'Mvuli Road, Westlands, Nairobi', lat: -1.258, lng: 36.801 },
  { name: 'Karen Woods', address: 'Marula Lane, Karen, Nairobi', lat: -1.325, lng: 36.722 },
  { name: 'Lavington Green', address: 'James Gichuru Road, Lavington, Nairobi', lat: -1.278, lng: 36.771 },
  { name: 'Ngong Road Core', address: 'Ngong Road near Woodley, Nairobi', lat: -1.302, lng: 36.773 }
];

export default function ListPropertyFlow({
  onClose,
  onPublish,
  currentRole
}: ListPropertyFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // STEP 1 STAGE - ROLE SELECTOR
  const [roleType, setRoleType] = useState<'Landlord' | 'Agent' | 'Caretaker'>(
    currentRole === 'Landlord' ? 'Landlord' : currentRole === 'Caretaker' ? 'Caretaker' : 'Agent'
  );

  // STEP 2 STAGE - PROPERTY TYPE
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');

  // STEP 3 STAGE - LOCATION
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof NAIROBI_NEIGHBORHOOD_PRESETS>([]);
  const [chosenAddress, setChosenAddress] = useState('Chania Avenue, Kilimani, Nairobi');
  const [chosenNeighborhood, setChosenNeighborhood] = useState('Kilimani');
  const [chosenCounty, setChosenCounty] = useState('Nairobi');
  const [markerCoordinates, setMarkerCoordinates] = useState({ lat: -1.2941, lng: 36.7893 });
  const [neighborhoodTags, setNeighborhoodTags] = useState<string[]>(['Safe Oasis', 'Lively Hub']);
  const [newTagInput, setNewTagInput] = useState('');

  // STEP 4 STAGE - DETAILS
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [size, setSize] = useState(140);
  const [sizeUnit, setSizeUnit] = useState<'sqft' | 'sqm'>('sqm');
  const [isFurnished, setIsFurnished] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['wifi', 'parking', 'security']);

  // STEP 5 STAGE - PRICING
  const [rent, setRent] = useState(85000);
  const [deposit, setDeposit] = useState(85000);
  const [currency, setCurrency] = useState<Currency>('KES');
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');

  // STEP 6 STAGE - MEDIA
  const [images, setImages] = useState<ListingImage[]>([
    { id: 'img-new-1', listingId: 'draft', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800', isCover: true, order: 0 },
    { id: 'img-new-2', listingId: 'draft', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 }
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');

  // STEP 7 STAGE - COMPLETED REVIEW (Automatic layout based on fields above)

  // 30 Second Autosave Simulator
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
      }, 1000);
    }, 30000); // 30 seconds

    return () => clearInterval(autosaveInterval);
  }, []);

  // Suggestions search logic
  const handleLocationSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = NAIROBI_NEIGHBORHOOD_PRESETS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.address.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelectSuggestion = (preset: typeof NAIROBI_NEIGHBORHOOD_PRESETS[0]) => {
    setChosenAddress(preset.address);
    setChosenNeighborhood(preset.name);
    setMarkerCoordinates({ lat: preset.lat, lng: preset.lng });
    setSearchQuery('');
    setSuggestions([]);
  };

  // Click on local map grid simulation
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert relative click into fake coordinates
    const approxLat = -1.25 - (y / rect.height) * 0.1;
    const approxLng = 36.75 + (x / rect.width) * 0.1;

    setMarkerCoordinates({ lat: Number(approxLat.toFixed(4)), lng: Number(approxLng.toFixed(4)) });
    setChosenAddress(`Dropped pin at coordinates (${approxLat.toFixed(4)}, ${approxLng.toFixed(4)})`);
    setChosenNeighborhood('Custom Area Pin');
  };

  // Amenities checklist helper
  const availableAmenitiesList = [
    { id: 'wifi', label: 'WiFi Access', icon: '📶' },
    { id: 'parking', label: 'Allocated Parking', icon: '🚗' },
    { id: 'gym', label: 'Wellness Gym', icon: '🏋️' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
    { id: 'security', label: '24/7 Guards & CCTV', icon: '🛡️' },
    { id: 'water', label: 'Steady Borehole Water', icon: '🚰' },
    { id: 'electricity_backup', label: 'Full Backup Generator', icon: '⚡' }
  ];

  const handleToggleAmenity = (id: string) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !neighborhoodTags.includes(newTagInput.trim())) {
      setNeighborhoodTags([...neighborhoodTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  // Media helper additions
  const handleAddPresetPhoto = () => {
    const nextUnusedPreset = PRESET_IMAGES.find(url => !images.some(img => img.url === url)) || PRESET_IMAGES[0];
    const newImage: ListingImage = {
      id: `img-new-${Date.now()}`,
      listingId: 'draft',
      url: nextUnusedPreset,
      isCover: false,
      order: images.length
    };
    setImages([...images, newImage]);
  };

  const handleReorderImage = (index: number, direction: 'prev' | 'next') => {
    if (direction === 'prev' && index === 0) return;
    if (direction === 'next' && index === images.length - 1) return;

    const newList = [...images];
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    
    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;

    // Correct ordering indices
    const updated = newList.map((img, idx) => ({ ...img, order: idx }));
    setImages(updated);
  };

  const handleSetCover = (id: string) => {
    const updated = images.map(img => ({
      ...img,
      isCover: img.id === id
    }));
    setImages(updated);
  };

  const handleRemoveImage = (id: string) => {
    if (images.length <= 1) {
      alert("A premium listing requires at least 1 image.");
      return;
    }
    const filtered = images.filter(img => img.id !== id);
    // If the removed image was cover, set the first remaining as cover
    const isCoverRemoved = images.find(img => img.id === id)?.isCover;
    if (isCoverRemoved && filtered.length > 0) {
      filtered[0].isCover = true;
    }
    setImages(filtered);
  };

  const handlePublishListing = () => {
    const freshListing: Listing = {
      id: `list-new-${Date.now()}`,
      title: `${chosenNeighborhood} Luxury ${propertyType}`,
      description: `A pristine and beautiful property in ${chosenNeighborhood}, detailed with modern luxury finishing. It enjoys ${bedrooms} bedroom(s), ${bathrooms} bathrooms, and state of the art custom installations.`,
      propertyType,
      roleType,
      location: {
        address: chosenAddress,
        coordinates: markerCoordinates,
        neighborhood: chosenNeighborhood,
        tags: neighborhoodTags,
        county: chosenCounty
      },
      details: {
        bedrooms,
        bathrooms,
        size,
        sizeUnit,
        isFurnished,
        amenities: selectedAmenities
      },
      pricing: {
        rent,
        deposit,
        currency,
        frequency
      },
      media: {
        images,
        videoUrl: videoUrl || undefined,
        virtualTourUrl: virtualTourUrl || undefined
      },
      author: {
        id: 'agent-self',
        name: 'Victoria Vance (You)',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
        role: currentRole,
        phone: '+254 700 000 000',
        email: 'you@nestlist.luxury',
        isVerified: true
      },
      isFeatured: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      views: 1,
      inquiriesCount: 0,
      savesCount: 0
    };

    onPublish(freshListing);
    onClose();
  };

  const stepsList = [
    { id: 1, name: 'Agent Role' },
    { id: 2, name: 'Type & Class' },
    { id: 3, name: 'Location Pin' },
    { id: 4, name: 'Details' },
    { id: 5, name: 'Pricing' },
    { id: 6, name: 'Media' },
    { id: 7, name: 'Review' }
  ];

  return (
    <div id="listing-generator-modal" className="fixed inset-0 z-100 bg-brand-dark/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="w-full max-w-4xl h-[92vh] glass-premium rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Header containing title and progress ticker */}
        <div className="p-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-brand-gold flex items-center justify-center font-mono font-bold text-sm">
              🔑
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-white">Create Premium Listing</h3>
              <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">Step {currentStep} of 7: {stepsList[currentStep - 1].name}</p>
            </div>
          </div>

          {/* Autosaver & Closer widgets */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span className="text-[9px] font-mono text-gray-400">{saveStatus === 'saving' ? 'Autosaving draft...' : 'Draft saved'}</span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Ticker Bar: clickable and reflective */}
        <div className="px-5 py-3.5 bg-brand-dark/40 border-b border-white/5 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center justify-between min-w-[650px] max-w-3xl mx-auto">
            {stepsList.map(step => (
              <button
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep || saveStatus === 'saved') {
                    setCurrentStep(step.id);
                  }
                }}
                className="flex items-center gap-2 group outline-none"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                  step.id === currentStep 
                    ? 'bg-brand-blue text-white ring-4 ring-brand-blue/30 scale-115' 
                    : step.id < currentStep 
                    ? 'bg-blue-600/30 text-brand-blue border border-brand-blue/40' 
                    : 'bg-white/5 text-gray-500 border border-transparent'
                }`}>
                  {step.id}
                </div>
                <span className={`text-[11px] font-medium transition-colors ${
                  step.id === currentStep 
                    ? 'text-white font-bold' 
                    : step.id < currentStep 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {step.id < 7 && <div className={`h-[1px] w-8 ${step.id < currentStep ? 'bg-brand-blue/40' : 'bg-white/5'}`}></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic content window scroll view */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* STEP 1: PORTFOLIO ACCESS ROLE */}
          {currentStep === 1 && (
            <div id="wizard-step-1" className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-brand-gold mx-auto mb-2 animate-pulse" />
                <h4 className="text-xl font-serif text-white font-bold">Select Your Represented Listing Persona</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">How would you like your profile and authority card to be rendered on the public listing details feed?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'Agent', title: 'Estate Agent', desc: 'Acting of behalf of luxury rental brokerages, managing priority inquiries.', icon: '🛡️' },
                  { id: 'Landlord', title: 'Asset Owner', desc: 'Direct owner of the deed, receiving direct tenant responses & deposits.', icon: '🔑' },
                  { id: 'Caretaker', title: 'Site Custodian', desc: 'On-site administrator handling direct scheduled facility viewings.', icon: '🏢' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setRoleType(item.id as any)}
                    className={`p-5 rounded-2xl glass-premium border text-left flex flex-col justify-between h-48 hover:-translate-y-1 transition-all group ${
                      roleType === item.id 
                        ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue/20' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h5 className="font-bold text-sm text-white group-hover:text-brand-blue transition-colors">{item.title}</h5>
                      <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: ESTATE TYPE OR ARCHITECTURE TYPE */}
          {currentStep === 2 && (
            <div id="wizard-step-2" className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <Building2 className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <h4 className="text-xl font-serif text-white font-bold">Define the Architectural Style</h4>
                <p className="text-xs text-gray-400 mt-1">This classifies the pricing logic and filter category matching.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'House', label: 'Landed House', icon: '🏡' },
                  { id: 'Apartment', label: 'Modern Apartment', icon: '🏢' },
                  { id: 'Studio', label: 'Sleek Studio', icon: '🛋️' },
                  { id: 'Bedsitter', label: 'Micro Bedsitter', icon: '📦' },
                  { id: 'Villa', label: 'Bespoke Villa', icon: '🏛️' },
                  { id: 'Commercial', label: 'Retail Space', icon: '🏭' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPropertyType(item.id as PropertyType)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                      propertyType === item.id 
                        ? 'border-brand-blue bg-brand-blue/10 text-white' 
                        : 'border-white/5 hover:bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: MOCK GOOGLE MAP INTEGRATION WITH DROPPABLE PIN */}
          {currentStep === 3 && (
            <div id="wizard-step-3" className="max-w-2xl mx-auto space-y-5">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h4 className="text-xl font-serif text-white font-bold">Pinpoint Location Coordinates</h4>
                <p className="text-xs text-gray-400 mt-1">Use autocompletion or click directly on our Nairobi GIS Grid to configure pins.</p>
              </div>

              {/* Autocomplete Input Search */}
              <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder="Search popular estates (e.g., Karen, Runda, Kilimani)..."
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-blue"
                />
                
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 glass-premium rounded-xl border border-white/10 p-2 shadow-2xl z-30 space-y-1">
                    {suggestions.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(p)}
                        className="w-full text-left px-3 py-2 hover:bg-white/5 text-xs text-gray-300 rounded-lg flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                        <div>
                          <span className="font-bold text-white block">{p.name}</span>
                          <span className="text-[10px] text-gray-500">{p.address}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Simulated Interactive Vector Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Interactive Coordinates Grid (Click to Drop Pin)</span>
                  <span className="text-[10px] font-mono text-brand-blue">Active Pin: {markerCoordinates.lat}, {markerCoordinates.lng}</span>
                </div>
                
                <div 
                  onClick={handleMapCanvasClick}
                  className="relative h-60 bg-gradient-to-br from-slate-900 to-brand-dark rounded-xl border border-white/10 overflow-hidden cursor-crosshair flex items-center justify-center group"
                >
                  {/* Grid Lines for technical coordinate look */}
                  <div className="absolute inset-0 opacity-15" style={{
                    backgroundImage: 'radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '100%, 20px 20px, 20px 20px'
                  }}></div>

                  {/* Mock Neighborhood reference labels on map */}
                  <span className="absolute top-10 left-12 text-[9px] text-gray-600 font-mono uppercase">Runda</span>
                  <span className="absolute bottom-12 right-20 text-[9px] text-gray-600 font-mono uppercase">Karen</span>
                  <span className="absolute top-1/2 left-1/3 text-[9px] text-gray-600 font-mono uppercase">Westlands</span>
                  <span className="absolute top-2/3 right-1/3 text-[9px] text-gray-600 font-mono uppercase">Kilimani</span>

                  {/* Interactive Dynamic Marker Node */}
                  <div 
                    className="absolute w-8 h-8 flex items-center justify-center transition-all duration-300 pointer-events-none"
                    style={{
                      // Map approx Nairobi coordinates (lat: -1.2 to -1.35, lng: 36.65 to 36.85) to percentage
                      left: `${((markerCoordinates.lng - 36.65) / 0.2) * 100}%`,
                      top: `${((Math.abs(markerCoordinates.lat) - 1.2) / 0.15) * 100}%`
                    }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-brand-blue/30 rounded-full animate-ping"></div>
                      <MapPin className="w-6 h-6 text-red-500 fill-red-500 drop-shadow-xl" />
                    </div>
                  </div>

                  <p className="absolute bottom-2 text-center text-[9px] font-mono text-gray-500 group-hover:text-gray-300">
                    Click anywhere inside grid to droppin coordinate coordinates
                  </p>
                </div>
              </div>

              {/* Selected attributes info */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 text-xs">
                {/* 47 COUNTIES OF KENYA TARGET SELECTION */}
                <div>
                  <label className="text-brand-gold block font-mono text-[9px] uppercase mb-1.5 font-bold">Kenyan County (Serves all 47 Counties)</label>
                  <select
                    value={chosenCounty}
                    onChange={(e) => setChosenCounty(e.target.value)}
                    className="w-full bg-brand-dark border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand-gold"
                  >
                    {KENYA_COUNTIES_CLEAN.map((county, index) => (
                      <option key={index} className="bg-slate-950 text-white" value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-1">
                  <div>
                    <span className="text-gray-400 block font-mono text-[9px] uppercase mb-1">Estate/Neighborhood Node</span>
                    <input 
                      type="text"
                      value={chosenNeighborhood}
                      onChange={(e) => setChosenNeighborhood(e.target.value)}
                      placeholder="e.g., Nyali, Milimani, Runda"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <span className="text-gray-400 block font-mono text-[9px] uppercase mb-1">Registered Physical Address</span>
                    <input 
                      type="text"
                      value={chosenAddress}
                      onChange={(e) => setChosenAddress(e.target.value)}
                      placeholder="e.g., Links Road, Nyali, Mombasa"
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
                
                {/* Custom tags setup */}
                <div className="pt-2">
                  <span className="text-gray-400 block font-mono text-[9px] uppercase mb-1.5">Registered Estate Badges ({neighborhoodTags.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {neighborhoodTags.map((tag, idx) => (
                      <span key={idx} className="bg-brand-blue/10 border border-brand-blue/20 text-[10px] text-brand-blue font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => setNeighborhoodTags(neighborhoodTags.filter(t => t !== tag))}
                          className="hover:text-red-400 ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <div className="flex gap-1 items-center">
                      <input 
                        type="text" 
                        placeholder="Add tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="bg-brand-dark border border-white/10 rounded-full px-2 py-0.5 text-[9px] text-white w-20 outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddTag} 
                        className="text-[10px] text-brand-blue uppercase font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: SPECS & PROPERTY ATTRIBUTES */}
          {currentStep === 4 && (
            <div id="wizard-step-4" className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <ListPlus className="w-8 h-8 text-brand-blue mx-auto mb-2" />
                <h4 className="text-xl font-serif text-white font-bold">Specify Property Configurations</h4>
                <p className="text-xs text-gray-400 mt-1">Specify room numbers, dimension metrics, and active service amenities.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Rooms Spec */}
                <div className="glass-premium p-4 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1.5">Bedrooms</label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map(b => (
                        <button
                          key={b}
                          onClick={() => setBedrooms(b)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold ${
                            bedrooms === b ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1.5">Bathrooms</label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map(b => (
                        <button
                          key={b}
                          onClick={() => setBathrooms(b)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold ${
                            bathrooms === b ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dimension metric specification */}
                <div className="glass-premium p-4 rounded-xl border border-white/5 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-mono">Floor Area</label>
                      <div className="flex bg-brand-dark p-0.5 rounded-lg border border-white/5">
                        <button
                          onClick={() => setSizeUnit('sqft')}
                          className={`px-2 py-0.5 text-[8px] font-mono rounded ${sizeUnit === 'sqft' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                        >
                          SQFT
                        </button>
                        <button
                          onClick={() => setSizeUnit('sqm')}
                          className={`px-2 py-0.5 text-[8px] font-mono rounded ${sizeUnit === 'sqm' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                        >
                          SQM
                        </button>
                      </div>
                    </div>
                    <input 
                      type="number"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue font-mono"
                    />
                  </div>

                  {/* Furnished state */}
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1.5">Furnished Integration</label>
                    <button
                      onClick={() => setIsFurnished(!isFurnished)}
                      className={`w-full p-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                        isFurnished 
                          ? 'border-brand-blue bg-brand-blue/5 text-brand-blue' 
                          : 'border-white/5 bg-white/5 text-gray-400'
                      }`}
                    >
                      <span>{isFurnished ? 'Fully Furnished Designer Suites' : 'Unfurnished Open Canvas'}</span>
                      {isFurnished ? <ToggleRight className="w-5 h-5 text-brand-blue" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Amenities master check list */}
              <div className="glass-premium p-4 rounded-xl border border-white/5">
                <span className="block text-[10px] text-gray-400 uppercase font-mono mb-3">Facility Amenities & Inclusions Checklist</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableAmenitiesList.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleToggleAmenity(item.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        selectedAmenities.includes(item.id)
                          ? 'border-brand-blue/40 bg-brand-blue/5 text-white'
                          : 'border-white/5 hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: PRICING LEDGER AND TAX METRICS */}
          {currentStep === 5 && (
            <div id="wizard-step-5" className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 text-brand-gold mx-auto mb-2" />
                <h4 className="text-xl font-serif text-white font-bold">Establish Lease Financials</h4>
                <p className="text-xs text-gray-400 mt-1">Configure baseline rent, security deposit guarantees, and payment frequencies.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Curreny Picker */}
                <div className="glass-premium p-4 rounded-xl border border-white/5 space-y-4 col-span-2">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1.5">Currency Locale</label>
                    <div className="flex gap-2">
                      {[
                        { code: 'KES', label: 'Kenyan Shilling (KES) - Domestically Compliant' },
                        { code: 'USD', label: 'United States Dollar (USD) - Diplomatic Zone' }
                      ].map(curr => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code as any);
                            // Set intuitive defaults when currency switches to preserve visual sense
                            if (curr.code === 'USD') {
                              setRent(2500);
                              setDeposit(5000);
                            } else {
                              setRent(120000);
                              setDeposit(120000);
                            }
                          }}
                          className={`flex-1 p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${
                            currency === curr.code 
                              ? 'border-brand-gold bg-brand-gold/5 text-brand-gold' 
                              : 'border-white/5 hover:bg-white/5 text-gray-400'
                          }`}
                        >
                          <span>{curr.label}</span>
                          <span className="font-bold">{curr.code === 'USD' ? '$' : 'KSh'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amount settings */}
                <div className="glass-premium p-4 rounded-xl border border-white/5 space-y-3">
                  <label className="block text-[10px] text-gray-400 uppercase font-mono">Lease rent amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">{currency === 'USD' ? '$' : 'KSh'}</span>
                    <input 
                      type="number" 
                      value={rent}
                      onChange={(e) => setRent(Number(e.target.value))}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono block">Typical average: {currency === 'USD' ? '$1,500 - $6,000' : 'KES 70,000 - 300,000'}</span>
                </div>

                <div className="glass-premium p-4 rounded-xl border border-white/5 space-y-3">
                  <label className="block text-[10px] text-gray-400 uppercase font-mono">Refundable Deposit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">{currency === 'USD' ? '$' : 'KSh'}</span>
                    <input 
                      type="number" 
                      value={deposit}
                      onChange={(e) => setDeposit(Number(e.target.value))}
                      className="w-full bg-brand-dark/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-brand-blue font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono block">Standard equivalent: 1-2 months deposit</span>
                </div>

                {/* Billing frequency */}
                <div className="glass-premium p-4 rounded-xl border border-white/5 col-span-2 space-y-3">
                  <span className="block text-[10px] text-gray-400 uppercase font-mono">Billing Remittance Cycle</span>
                  <div className="flex gap-2">
                    {[
                      { id: 'monthly', label: 'Monthly Term' },
                      { id: 'quarterly', label: 'Quarterly Advance' },
                      { id: 'annually', label: 'Annual Advance Lease' }
                    ].map(freq => (
                      <button
                        key={freq.id}
                        onClick={() => setFrequency(freq.id as any)}
                        className={`flex-1 p-2 rounded-lg border text-center text-[10px] font-semibold transition-all ${
                          frequency === freq.id 
                            ? 'border-brand-blue bg-brand-blue/10 text-white' 
                            : 'border-white/5 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: DRAG-AND-DROP MULTIMEDIA ORGANIZER */}
          {currentStep === 6 && (
            <div id="wizard-step-6" className="max-w-2xl mx-auto space-y-5">
              <div className="text-center">
                <Image className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-bounce" />
                <h4 className="text-xl font-serif text-white font-bold">Organize Gallery Portfolio</h4>
                <p className="text-xs text-gray-400 mt-1">Configure property media, rearange gallery position, and assign cover ribbons</p>
              </div>

              {/* Drag n drop box */}
              <div 
                onClick={handleAddPresetPhoto}
                className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-blue hover:bg-brand-blue/5 transition-all group"
              >
                <UploadCloud className="w-10 h-10 text-gray-400 mx-auto group-hover:scale-110 transition-transform mb-2 text-brand-blue" />
                <span className="text-xs font-bold text-white block">Simulated drag and drop upload panel</span>
                <span className="text-[10px] text-gray-500 font-mono block mt-1">Supporting PNG, WebP up to 20 images. CLICK to append luxury interior photographs!</span>
              </div>

              {/* Image Reordering workspace */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Active Image Stack ({images.length} added)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id}
                      className={`p-2 bg-brand-dark/80 border rounded-xl flex gap-3 relative ${
                        img.isCover ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-white/5'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt="Workspace visual" 
                        className="w-16 h-16 object-cover rounded-lg border border-white/5" 
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <span className="text-[10px] font-mono text-gray-400 block truncate uppercase">Image ID: {img.id.slice(0, 8)}</span>
                          <span className="text-[9px] text-gray-500 font-mono">Location Rank: #{idx + 1}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSetCover(img.id)}
                            className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                              img.isCover ? 'bg-brand-gold text-brand-dark font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                          >
                            Set Cover
                          </button>
                        </div>
                      </div>

                      {/* Control arrows absolute panels */}
                      <div className="flex flex-col gap-1 justify-center">
                        <button 
                          onClick={() => handleReorderImage(idx, 'prev')}
                          disabled={idx === 0}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleReorderImage(idx, 'next')}
                          disabled={idx === images.length - 1}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 disabled:opacity-20"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Video and Virtual links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Youtube Walkthrough Link (Optional)</label>
                  <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-mono mb-1">Virtual 3D Tour Link (Optional)</label>
                  <input 
                    type="text" 
                    value={virtualTourUrl}
                    onChange={(e) => setVirtualTourUrl(e.target.value)}
                    placeholder="e.g. Matterport URL"
                    className="w-full bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-blue"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 7: COMPREHENSIVE PREVIEW & FINAL DECLARATION */}
          {currentStep === 7 && (
            <div id="wizard-step-7" className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xl font-serif text-white font-bold">Review & Authorize Publication</h4>
                <p className="text-xs text-gray-400 mt-1">Please confirm the listing presentation below. You can jump back to any step to revise.</p>
              </div>

              {/* Full Interactive Listing Presentation Card */}
              <div className="glass-premium rounded-2xl p-6 border border-white/10 space-y-4 bg-brand-dark/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                  <div>
                    <span className="bg-brand-blue/20 text-brand-blue text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {propertyType} Draft
                    </span>
                    <h4 className="text-lg font-serif text-white font-bold mt-1">
                      {chosenNeighborhood} Luxury {propertyType}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-serif font-black text-brand-gold block">
                      {currency === 'USD' ? '$' : 'KES '}{rent.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">/{frequency}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase block">Location Marker Node</span>
                    <span className="text-gray-200 mt-0.5 block font-semibold">{chosenAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase block">Assigned profile character</span>
                    <span className="text-gray-200 mt-0.5 block font-semibold">{roleType} Representative</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase block">Facility Interior Specs</span>
                    <span className="text-gray-200 mt-0.5 block font-semibold">
                      {bedrooms} Bed(s) • {bathrooms} Bath(s) • {size} {sizeUnit} • {isFurnished ? 'Furnished' : 'Unfurnished'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-mono text-[9px] uppercase block">Security Bond (Refundable)</span>
                    <span className="text-gray-200 mt-0.5 block font-semibold">
                      {currency === 'USD' ? '$' : 'KES '}{deposit.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Cover visual representation and other images check */}
                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1">Assigned Listing Cover image</span>
                  <div className="flex gap-2">
                    {images.filter(img => img.isCover).map(img => (
                      <div key={img.id} className="relative w-28 h-16 rounded-lg overflow-hidden border border-brand-gold/30">
                        <img src={img.url} className="w-full h-full object-cover" alt="Cover preview" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 left-1 font-mono text-[8px] bg-brand-gold text-brand-dark px-1 rounded uppercase font-bold">COVER</span>
                      </div>
                    ))}
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 flex items-center justify-center text-[10px] text-gray-400">
                      Total Assets: {images.length} Photo(s) {videoUrl && ' • Walkthrough video included'}
                    </div>
                  </div>
                </div>

                {/* Included Amenities chips list */}
                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase block mb-1.5">Activated Service Amenities</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedAmenities.map(amenId => {
                      const amenObj = availableAmenitiesList.find(a => a.id === amenId);
                      return (
                        <span key={amenId} className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[10px]">
                          {amenObj?.icon} {amenObj?.label || amenId}
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Sticky footer containing Back and Continue controls */}
        <div className="p-5 border-t border-white/5 bg-brand-dark flex items-center justify-between">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="flex items-center gap-1 text-xs hover:text-white transition-colors disabled:opacity-20 text-gray-400 group focus:outline-none"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Previous Node
          </button>

          {currentStep < 7 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 hover:shadow-lg hover:shadow-brand-blue/10 transition-all focus:outline-none"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Save as Draft
              </button>
              <button
                id="publish-submit-btn"
                onClick={handlePublishListing}
                className="bg-gradient-to-r from-brand-gold to-amber-600 text-brand-dark font-sans font-black py-2.5 px-6 rounded-xl text-xs shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/20 hover:scale-102 active:scale-98 transition-all"
              >
                Publish Live Listing
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}

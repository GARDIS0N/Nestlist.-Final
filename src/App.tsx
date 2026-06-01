/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Layers, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  HelpCircle,
  PlusCircle,
  ArrowRight
} from 'lucide-react';

import { 
  INITIAL_LISTINGS, 
  INITIAL_INQUIRIES, 
  INITIAL_VIEWINGS, 
  INITIAL_REVIEWS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_REPORTS 
} from './data/mockProperties';

import { 
  Listing, 
  Inquiry, 
  ViewingRequest, 
  Notification, 
  Transaction, 
  Report, 
  UserRole, 
  Profile, 
  PropertyType,
  SavedSearch,
  SimulatedEmail
} from './types';

import { KENYA_COUNTIES_CLEAN } from './data/kenyaCounties';

import Navbar from './components/Navbar';
import ListingCard from './components/ListingCard';
import ListPropertyFlow from './components/ListPropertyFlow';
import PropertyDetail from './components/PropertyDetail';
import Dashboards from './components/Dashboards';
import PaymentSandboxVisualizer from './components/PaymentSandboxVisualizer';

export default function App() {
  
  // GENERAL ACCOUNT STATES (Fideli-sync)
  const [currentRole, setCurrentRole] = useState<UserRole>('Tenant');
  const [activeTab, setActiveTab] = useState<'listings' | 'dashboard'>('listings');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // CORE REGISTRY (Simulated localized DB)
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [favorites, setFavorites] = useState<string[]>(['list-1', 'list-3']);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>(INITIAL_VIEWINGS);
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  
  // SAVED SEARCH ENGINE STATES
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([
    {
      id: 'saved-1',
      userId: 'current-user-id',
      name: 'Kilimani Skyview Budget',
      filters: {
        location: 'Kilimani',
        propertyType: 'Apartment',
        maxPrice: 350000,
        bedrooms: 3,
        amenities: ['wifi', 'parking'],
        isFurnished: true
      },
      notificationsEnabled: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'saved-2',
      userId: 'current-user-id',
      name: 'Runda Diplomatic Villas',
      filters: {
        location: 'Runda',
        propertyType: 'Villa',
        maxPrice: 600000,
        bedrooms: 'all',
        amenities: ['pool', 'security'],
        isFurnished: false
      },
      notificationsEnabled: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);
  const [newSavedSearchName, setNewSavedSearchName] = useState('');
  
  const [userAccounts, setUserAccounts] = useState([
    { id: 'usr-1', name: 'Erick Cheruiyot', role: 'Tenant', isSuspended: false, email: 'erick.c@tech.com' },
    { id: 'usr-2', name: 'Victoria Vance', role: 'Agent', isSuspended: false, email: 'victoria@nestlist.luxury' },
    { id: 'usr-3', name: 'David Mwangi', role: 'Landlord', isSuspended: false, email: 'mwangi@nestlist.luxury' },
    { id: 'usr-4', name: 'James Kamau', role: 'Caretaker', isSuspended: false, email: 'james.k@nestlist.luxury' }
  ]);

  const [userProfile, setUserProfile] = useState<Profile>({
    id: 'user-p1',
    userId: 'current-user-id',
    username: 'victoria',
    fullName: 'Victoria Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    bio: 'Premier Real Estate Partner specialized in High-end Diplomatic and Residential leasing across Nairobi Runda, Karen, and Westlands.',
    contactEmail: 'victoria@nestlist.luxury',
    contactPhone: '+254 712 345 678',
    isVerified: true,
    kycStatus: 'verified',
    createdAt: new Date().toISOString()
  });

  // WIZARD CONTROLS
  const [addListingOpen, setAddListingOpen] = useState(false);

  // FILTER ENGINE STATUS
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewFormat, setViewFormat] = useState<'grid' | 'list'>('grid');
  const [splitMapMode, setSplitMapMode] = useState(false);

  // FILTERS CRITERIA
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCounty, setSearchCounty] = useState<string>('all');
  const [searchPropertyType, setSearchPropertyType] = useState<string>('all');
  const [searchPriceRange, setSearchPriceRange] = useState<number>(500000); // Max cap
  const [searchBedrooms, setSearchBedrooms] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  // ADVANCED SPECS FILTERS
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [filterFurnishedOnly, setFilterFurnishedOnly] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterDistanceFromCenter, setFilterDistanceFromCenter] = useState<number>(30); // Max distance KMs

  // FULL-STACK SERVER INTEGRATION HARNESS
  const refreshServerListings = () => {
    fetch('/api/listings')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.listings && data.listings.length > 0) {
          setListings(prev => {
            // Merge serverside array on top of client mockup
            const serverMap = new Map(data.listings.map((l: any) => [l.id, l]));
            const localMerged = prev.map(l => serverMap.get(l.id) || l);
            const existingIds = new Set(prev.map(l => l.id));
            const brandNew = data.listings.filter((l: any) => !existingIds.has(l.id));
            return [...brandNew, ...localMerged];
          });
        }
      })
      .catch(err => console.warn("API Server ping waiting...", err));
  };

  useEffect(() => {
    refreshServerListings();
    const interval = setInterval(refreshServerListings, 4000);
    return () => clearInterval(interval);
  }, []);

  // Intercept and load safe sandbox visualizer component
  const isSandboxRoute = typeof window !== 'undefined' && window.location.pathname.includes('payment-sandbox-visualizer');
  if (isSandboxRoute) {
    return <PaymentSandboxVisualizer />;
  }

  // Map reference pin focus
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

  // Favorite toggle helper
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  // State appending functions (to mock Postgres inserts)
  const handleAddInquiry = (newInq: Inquiry) => {
    setInquiries([newInq, ...inquiries]);
    
    // Auto trigger notification alert
    const newNot: Notification = {
      id: `not-${Date.now()}`,
      userId: 'current-user-id',
      type: 'inquiry',
      title: 'New Listing Inquiry Received',
      description: `Client message received on your property listed at ${newInq.listingTitle}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNot, ...notifications]);
  };

  const handleUpdateInquiryStatus = (id: string, replyText: string) => {
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, isReplied: true, replyText };
      }
      return inq;
    });
    setInquiries(updated);
  };

  const handleAddViewingRequest = (newView: ViewingRequest) => {
    setViewingRequests([newView, ...viewingRequests]);

    const newNot: Notification = {
      id: `not-${Date.now()}`,
      userId: 'current-user-id',
      type: 'viewing',
      title: 'Viewing Slot Booked',
      description: `Tour session requested for: "${newView.listingTitle}" at ${new Date(newView.dateTime).toLocaleDateString()}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications([newNot, ...notifications]);
  };

  const handlePublishListing = (newListing: Listing) => {
    // Ensure author's verified status is synced with current profile verified status
    const verifiedListing: Listing = {
      ...newListing,
      status: 'pending_payment', // strict requirement
      author: {
        ...newListing.author,
        isVerified: userProfile.isVerified
      }
    };

    // Save on real express full-stack server backend
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifiedListing)
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        refreshServerListings();
      }
    })
    .catch(err => {
      console.warn("Express server listing create failed, using client fallback", err);
    });

    setListings([verifiedListing, ...listings]);

    // General notification for the publisher
    const publisherNotification: Notification = {
      id: `not-${Date.now()}`,
      userId: 'current-user-id',
      type: 'listing_status',
      title: 'Property Listing Published Live',
      description: `Draft "${verifiedListing.title}" successfully compiled and syndicated on NestList directory.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const matcherNotifications: Notification[] = [publisherNotification];
    const emailDispatched: SimulatedEmail[] = [];

    // Evaluate matches against saved searches
    savedSearches.forEach(search => {
      let matches = true;

      // 1. Location match
      if (search.filters.location && search.filters.location.trim()) {
        const queryTerm = search.filters.location.toLowerCase();
        const inAddress = verifiedListing.location.address.toLowerCase().includes(queryTerm);
        const inNeighborhood = verifiedListing.location.neighborhood.toLowerCase().includes(queryTerm);
        const inTitle = verifiedListing.title.toLowerCase().includes(queryTerm);
        if (!inAddress && !inNeighborhood && !inTitle) {
          matches = false;
        }
      }

      // 2. Property type match
      if (matches && search.filters.propertyType && search.filters.propertyType !== 'all') {
        if (verifiedListing.propertyType !== search.filters.propertyType) {
          matches = false;
        }
      }

      // 3. Price match (with approximate USD conversion)
      if (matches && search.filters.maxPrice) {
        let rentInKES = verifiedListing.pricing.rent;
        if (verifiedListing.pricing.currency === 'USD') {
          rentInKES = verifiedListing.pricing.rent * 130;
        }
        if (rentInKES > search.filters.maxPrice) {
          matches = false;
        }
      }

      // 4. Bedrooms match
      if (matches && search.filters.bedrooms && search.filters.bedrooms !== 'all') {
        if (verifiedListing.details.bedrooms !== search.filters.bedrooms) {
          matches = false;
        }
      }

      // 5. Furnishing match
      if (matches && search.filters.isFurnished) {
        if (!verifiedListing.details.isFurnished) {
          matches = false;
        }
      }

      // 6. Amenities match
      if (matches && search.filters.amenities && search.filters.amenities.length > 0) {
        const listingAmenities = verifiedListing.details.amenities;
        const matchesAllAmenities = search.filters.amenities.every(amenId => 
          listingAmenities.includes(amenId)
        );
        if (!matchesAllAmenities) {
          matches = false;
        }
      }

      // If fully satisfied, record the match trigger!
      if (matches) {
        // Construct notification
        const matchNotif: Notification = {
          id: `match-not-${Date.now()}-${search.id}`,
          userId: search.userId,
          type: 'saved_search_match',
          title: `Match Triggered: ${search.name}`,
          description: `"${verifiedListing.title}" in ${verifiedListing.location.neighborhood} matches your filtered parameters at ${verifiedListing.pricing.currency} ${verifiedListing.pricing.rent.toLocaleString()}/mo.`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        matcherNotifications.push(matchNotif);

        // Dispatch simulated email
        if (search.notificationsEnabled) {
          const emailRecord: SimulatedEmail = {
            id: `email-${Date.now()}-${search.id}`,
            savedSearchId: search.id,
            savedSearchName: search.name,
            recipientEmail: 'gardisonkirui11@gmail.com', // user metadata email
            subject: `[NestList Matching Alert] "${verifiedListing.title}" matches your Saved Search "${search.name}"`,
            body: `Hello NestList Elite Client,\n\nWe found a direct match for your saved search criteria "${search.name}"!\n\nMatched Asset Details:\n--------------------------\n- Property: ${verifiedListing.title}\n- Neighborhood: ${verifiedListing.location.neighborhood}\n- Price: ${verifiedListing.pricing.currency} ${verifiedListing.pricing.rent.toLocaleString()} / mo\n- Bed/Bath: ${verifiedListing.details.bedrooms} Bed / ${verifiedListing.details.bathrooms} Bath\n- Features: ${verifiedListing.details.isFurnished ? 'Furnished' : 'Unfurnished'}\n--------------------------\n\nAccess physical site visit calendar block on your space dashboard immediately.\n\nWarm regards,\nThe NestList Premier Syndicate Team`,
            sentAt: new Date().toISOString()
          };
          emailDispatched.push(emailRecord);
        }
      }
    });

    setNotifications(prev => [...matcherNotifications, ...prev]);
    if (emailDispatched.length > 0) {
      setSimulatedEmails(prev => [...emailDispatched, ...prev]);
    }
  };

  const handleMarkNotificationsAllRead = () => {
    const updated = notifications.map(not => ({ ...not, isRead: true }));
    setNotifications(updated);
  };

  // Admin controls syncer
  const handleFeatureListing = (id: string) => {
    const updated = listings.map(l => {
      if (l.id === id) {
        return { ...l, isFeatured: true };
      }
      return l;
    });
    setListings(updated);
  };

  const handleSuspendListing = (id: string) => {
    const updated = listings.map(l => {
      if (l.id === id) {
        return { ...l, isFeatured: false, status: 'paused' as any };
      }
      return l;
    });
    setListings(updated);
  };

  const handleDeleteListing = (id: string) => {
    const updated = listings.filter(l => l.id !== id);
    setListings(updated);
  };

  const handleUpdateReportStatus = (id: string, status: 'resolved' | 'dismissed') => {
    const updated = reports.filter(rep => rep.id !== id);
    setReports(updated);
  };

  const handleUpdateUserStatus = (id: string, isSuspended: boolean) => {
    const updated = userAccounts.map(u => {
      if (u.id === id) {
        return { ...u, isSuspended };
      }
      return u;
    });
    setUserAccounts(updated);
  };

  const handlePromoteUserRole = (id: string, newRole: UserRole) => {
    const updated = userAccounts.map(u => {
      if (u.id === id) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setUserAccounts(updated);
  };

  // Filter Amenities checkboxes helper
  const handleToggleFilterAmenity = (amenId: string) => {
    if (filterAmenities.includes(amenId)) {
      setFilterAmenities(filterAmenities.filter(item => item !== amenId));
    } else {
      setFilterAmenities([...filterAmenities, amenId]);
    }
  };

  const handleResetFilters = () => {
    setSearchLocation('');
    setSearchPropertyType('all');
    setSearchPriceRange(500000);
    setSearchBedrooms('all');
    setFilterAmenities([]);
    setFilterFurnishedOnly(false);
    setFilterPetFriendly(false);
    setFilterDistanceFromCenter(30);
  };

  const handleSaveCurrentFilters = () => {
    if (!newSavedSearchName.trim()) {
      alert("Please provide a name/label for your saved search preferences.");
      return;
    }

    const newSearch: SavedSearch = {
      id: `saved-search-${Date.now()}`,
      userId: 'current-user-id',
      name: newSavedSearchName,
      filters: {
        location: searchLocation,
        propertyType: searchPropertyType,
        maxPrice: searchPriceRange,
        bedrooms: searchBedrooms,
        amenities: filterAmenities,
        isFurnished: filterFurnishedOnly
      },
      notificationsEnabled: true,
      createdAt: new Date().toISOString()
    };

    setSavedSearches(prev => [newSearch, ...prev]);
    setNewSavedSearchName('');

    // Trigger instant in-app notification to confirm success
    const successNot: Notification = {
      id: `not-${Date.now()}`,
      userId: 'current-user-id',
      type: 'saved_search_match',
      title: 'Search Filters Saved',
      description: `Saved search preference "${newSearch.name}" successfully registered. Matching incoming listings will notify you.`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [successNot, ...prev]);
    
    alert(`Search preference "${newSearch.name}" is now stored in your account! Manage alerts inside your Tenant Space.`);
  };

  const handleDeleteSavedSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleSavedSearchNotifications = (id: string) => {
    setSavedSearches(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, notificationsEnabled: !s.notificationsEnabled };
      }
      return s;
    }));
  };

  const handleTriggerSavedSearch = (search: SavedSearch) => {
    setSearchLocation(search.filters.location);
    setSearchPropertyType(search.filters.propertyType);
    setSearchPriceRange(search.filters.maxPrice);
    setSearchBedrooms(search.filters.bedrooms);
    setFilterAmenities(search.filters.amenities);
    setFilterFurnishedOnly(search.filters.isFurnished);
    setActiveTab('listings');
  };

  // FILTER LOGIC COMPILER
  const compiledListings = useMemo(() => {
    let result = [...listings];

    // Filter location text (Matches text searches in keyword, title, neighborhood, address, or county name)
    if (searchLocation.trim()) {
      const criteria = searchLocation.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(criteria) || 
        item.location.address.toLowerCase().includes(criteria) ||
        item.location.neighborhood.toLowerCase().includes(criteria) ||
        (item.location.county && item.location.county.toLowerCase().includes(criteria))
      );
    }

    // Filter by selected Kenya County dropdown category
    if (searchCounty !== 'all') {
      result = result.filter(item => {
        const itemCounty = item.location.county || 'Nairobi';
        return itemCounty.toLowerCase() === searchCounty.toLowerCase();
      });
    }

    // Filter type
    if (searchPropertyType !== 'all') {
      result = result.filter(item => item.propertyType === searchPropertyType);
    }

    // Filter maximum price cap (Supports USD conversion as well)
    result = result.filter(item => {
      let currentPriceInKES = item.pricing.rent;
      if (item.pricing.currency === 'USD') {
        currentPriceInKES = item.pricing.rent * 130;  // approx rate KES 130 per USD
      }
      return currentPriceInKES <= searchPriceRange;
    });

    // Filter bedrooms
    if (searchBedrooms !== 'all') {
      result = result.filter(item => item.details.bedrooms === searchBedrooms);
    }

    // Filter furnishing
    if (filterFurnishedOnly) {
      result = result.filter(item => item.details.isFurnished);
    }

    // Filter amenities multi checklists
    if (filterAmenities.length > 0) {
      result = result.filter(item => 
        filterAmenities.every(requiredAmen => item.details.amenities.includes(requiredAmen))
      );
    }

    // SORTS
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'price-low') {
      result.sort((a, b) => {
        const costA = a.pricing.currency === 'USD' ? a.pricing.rent * 130 : a.pricing.rent;
        const costB = b.pricing.currency === 'USD' ? b.pricing.rent * 130 : b.pricing.rent;
        return costA - costB;
      });
    } else if (sortOrder === 'price-high') {
      result.sort((a, b) => {
        const costA = a.pricing.currency === 'USD' ? a.pricing.rent * 130 : a.pricing.rent;
        const costB = b.pricing.currency === 'USD' ? b.pricing.rent * 130 : b.pricing.rent;
        return costB - costA;
      });
    } else if (sortOrder === 'popular') {
      result.sort((a, b) => b.views - a.views);
    }

    return result;
  }, [listings, searchLocation, searchCounty, searchPropertyType, searchPriceRange, searchBedrooms, sortOrder, filterFurnishedOnly, filterAmenities]);

  // Selected Listing Object ref
  const activeListingDetails = listings.find(l => l.id === selectedListingId);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      
      {/* GLOBAL NAVBAR BANNER ELEMENT */}
      <Navbar 
        currentRole={currentRole}
        onChangeRole={(role) => {
          setCurrentRole(role);
          setActiveTab('dashboard'); // Auto-navigate to dashboard when changing roles to showcase
          setSelectedListingId(null);
        }}
        notifications={notifications}
        onMarkAllRead={handleMarkNotificationsAllRead}
        onOpenAddListing={() => setAddListingOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPropertyId={setSelectedListingId}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
      />

      {/* COMPONENT OUTLINE RENDER DECISIONS */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
          
          {/* OPTION 1: DISPLAY DETAILED SCREEN */}
          {selectedListingId && activeListingDetails ? (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <PropertyDetail 
                listing={activeListingDetails}
                isFavorite={favorites.includes(activeListingDetails.id)}
                onToggleFavorite={handleToggleFavorite}
                onBack={() => setSelectedListingId(null)}
                allListings={listings}
                onSelectSimilar={setSelectedListingId}
                onAddViewing={handleAddViewingRequest}
                onAddInquiry={handleAddInquiry}
              />
            </motion.div>
          ) 

          // OPTION 2: MULTI-TENANT DASHBOARD WORKSPACES
          : activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Dashboards 
                currentRole={currentRole}
                userProfile={userProfile}
                listings={listings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={(id) => {
                  setSelectedListingId(id);
                  setActiveTab('listings');
                }}
                viewingRequests={viewingRequests}
                inquiries={inquiries}
                onAddInquiry={handleAddInquiry}
                onUpdateInquiryStatus={handleUpdateInquiryStatus}
                onOpenAddListing={() => setAddListingOpen(true)}
                transactions={transactions}
                onAddTransaction={(tx) => setTransactions([tx, ...transactions])}
                reports={reports}
                onUpdateReportStatus={handleUpdateReportStatus}
                onFeatureListing={handleFeatureListing}
                onSuspendListing={handleSuspendListing}
                onDeleteListing={handleDeleteListing}
                userAccounts={userAccounts}
                onUpdateUserAccountStatus={handleUpdateUserStatus}
                onPromoteUserRole={handlePromoteUserRole}
                savedSearches={savedSearches}
                onDeleteSavedSearch={handleDeleteSavedSearch}
                onToggleSavedSearchNotifications={handleToggleSavedSearchNotifications}
                onTriggerSavedSearch={handleTriggerSavedSearch}
                simulatedEmails={simulatedEmails}
                onUpdateProfile={setUserProfile}
              />
            </motion.div>
          )

          // OPTION 3: PRIMARY HOMEPAGE EXPLORE SECTION (GRID / DIRECTORY BINDER)
          : (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* IMMERSIVE HEADER HERO SLIDER PARALLAX */}
              <div className="relative overflow-hidden py-16 px-4 md:px-8 bg-brand-dark border-b border-white/5">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(circle at top right, rgba(59,130,246,0.2) 0%, transparent 60%)'
                }}></div>

                <div className="max-w-4xl mx-auto text-center space-y-4">
                  <span className="inline-flex items-center gap-1.5 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-mono font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    NestList Elite Portfolio Syndicator
                  </span>
                  
                  <h1 className="text-3xl md:text-5xl font-serif text-white font-black tracking-tight leading-tight">
                    Premium Living, Synergistic Luxury.
                  </h1>
                  
                  <p className="text-xs md:text-sm text-gray-400 font-sans max-w-xl mx-auto">
                    The most definitive estate syndicate in Nairobi. Screen diplomat-vetted houses, villas, and minimalist duplexes with continuous service backups.
                  </p>

                  {/* HIGH FIDELITY INTEGRATED SEARCH ROW */}
                  <div className="pt-4 max-w-3xl mx-auto">
                    <div className="p-2 gap-2 bg-brand-card/90 backdrop-blur border border-white/10 rounded-2xl md:rounded-3xl shadow-xl flex flex-col md:flex-row items-center">
                      
                      {/* Search box */}
                      <div className="relative w-full flex-1">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-blue w-4 h-4" />
                        <input 
                          type="text" 
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          placeholder="Search estates or roads (e.g. Nyali, Runda)..."
                          className="w-full bg-transparent pl-10 pr-3 py-2 text-xs text-white outline-none placeholder-gray-500 font-medium"
                        />
                      </div>

                      <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-white/10"></div>

                      {/* County select */}
                      <div className="w-full md:w-44 text-left">
                        <label className="text-[8px] font-mono font-black uppercase text-brand-gold tracking-[0.1em] pl-3 block mb-0.5">County</label>
                        <select
                          value={searchCounty}
                          onChange={(e) => setSearchCounty(e.target.value)}
                          className="w-full bg-transparent text-xs py-1 px-3 text-gray-200 font-bold outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-brand-card text-white font-bold">All Kenya Counties</option>
                          {KENYA_COUNTIES_CLEAN.map((county, idx) => (
                            <option key={idx} value={county} className="bg-brand-card text-white font-medium">
                              {county}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-white/10"></div>

                      {/* Type pick */}
                      <div className="w-full md:w-44">
                        <select
                          value={searchPropertyType}
                          onChange={(e) => setSearchPropertyType(e.target.value)}
                          className="w-full bg-transparent text-xs py-2 px-3 text-gray-200 font-semibold outline-none cursor-pointer"
                        >
                          <option value="all" className="bg-brand-card text-white">All Properties</option>
                          <option value="Villa" className="bg-brand-card text-white">Luxury Villas</option>
                          <option value="Apartment" className="bg-brand-card text-white">Duplex Apartments</option>
                          <option value="House" className="bg-brand-card text-white font-semibold text-xs">Houses</option>
                          <option value="Studio" className="bg-brand-card text-white font-semibold text-xs">Studios</option>
                          <option value="Bedsitter" className="bg-brand-card text-white font-semibold text-xs">Bedsitters</option>
                        </select>
                      </div>

                      <div className="h-[1px] md:h-8 w-full md:w-[1px] bg-white/10"></div>

                      {/* Filter Slider toggle button */}
                      <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`w-full md:w-fit px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          showAdvancedFilters || filterAmenities.length > 0
                            ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' 
                            : 'text-gray-400 hover:text-white bg-white/5 border border-transparent'
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                      </button>

                    </div>
                  </div>

                </div>
              </div>

              {/* ADVANCED FILTER PANEL WORKBENCH AREA */}
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    id="advanced-filters-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden max-w-4xl mx-auto px-4 md:px-8"
                  >
                    <div className="p-6 bg-brand-card/30 border border-white/5 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-sans">
                      
                      {/* Price caps bounds */}
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase">
                          <span>Max Price Cap</span>
                          <span className="text-brand-gold font-bold">KES {searchPriceRange.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range"
                          min={20000}
                          max={600000}
                          step={10000}
                          value={searchPriceRange}
                          onChange={(e) => setSearchPriceRange(Number(e.target.value))}
                          className="w-full accent-brand-blue h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>KSh 20k</span>
                          <span>KSh 600k</span>
                        </div>
                      </div>

                      {/* Bedrooms specs */}
                      <div className="space-y-2">
                        <span className="block text-[10px] text-gray-400 font-mono uppercase">Bedrooms</span>
                        <div className="flex gap-1">
                          {['all', 1, 2, 3, 4, 5].map(b => (
                            <button
                              key={b}
                              onClick={() => setSearchBedrooms(b as any)}
                              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                                searchBedrooms === b 
                                  ? 'bg-brand-blue text-white ring-1 ring-brand-blue/30' 
                                  : 'bg-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              {b === 'all' ? 'All' : `${b}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Distance index */}
                      <div className="space-y-2 col-span-2 md:col-span-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase">
                          <span>Radius center</span>
                          <span className="text-brand-blue font-bold">{filterDistanceFromCenter} KM radius</span>
                        </div>
                        <input 
                          type="range"
                          min={2}
                          max={50}
                          step={1}
                          value={filterDistanceFromCenter}
                          onChange={(e) => setFilterDistanceFromCenter(Number(e.target.value))}
                          className="w-full accent-brand-blue h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Quick Toggles */}
                      <div className="space-y-3 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                          <input 
                            type="checkbox" 
                            checked={filterFurnishedOnly}
                            onChange={(e) => setFilterFurnishedOnly(e.target.checked)}
                            className="rounded border-white/10 text-brand-blue focus:ring-brand-blue bg-transparent"
                          />
                          <span>Furnished Only</span>
                        </label>
                      </div>

                      {/* Amenities checklist selectors inline */}
                      <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-4 space-y-2">
                        <span className="block text-[10px] text-gray-400 uppercase font-mono">Screen for service inclusions</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'wifi', name: '📶 WiFi' },
                            { id: 'parking', name: '🚗 Parking' },
                            { id: 'gym', name: '🏋️ Gym' },
                            { id: 'pool', name: '🏊 Pool' },
                            { id: 'security', name: '🛡️ Guards' },
                            { id: 'water', name: '🚰 Borehole' },
                            { id: 'electricity_backup', name: '⚡ Generator' }
                          ].map(am => (
                            <button
                              key={am.id}
                              onClick={() => handleToggleFilterAmenity(am.id)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold border ${
                                filterAmenities.includes(am.id)
                                  ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                                  : 'bg-white/5 border-transparent text-gray-400 hover:text-white'
                              }`}
                            >
                              {am.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Search preference and Reset utilities */}
                      <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                          <input 
                            type="text" 
                            value={newSavedSearchName}
                            onChange={(e) => setNewSavedSearchName(e.target.value)}
                            placeholder="Name search (e.g. Kilimani 3BR)"
                            className="bg-brand-dark/50 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white outline-none focus:border-brand-blue min-w-[200px]"
                          />
                          <button 
                            onClick={handleSaveCurrentFilters}
                            className="bg-brand-blue hover:bg-blue-600 text-white font-sans font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all pointer-events-auto cursor-pointer"
                          >
                            💾 Save Search Params
                          </button>
                        </div>
                        <button 
                          onClick={handleResetFilters}
                          className="text-[10px] font-bold text-gray-400 hover:text-white uppercase font-mono tracking-wider pointer-events-auto cursor-pointer"
                        >
                          Clear Premium parameters
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* LISTINGS DIRECTORY RENDER ZONE (DYNAMIC SPLIT GRID) */}
              <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-4">
                
                {/* Result count, layout formats toggles, and sorting selection */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-dark/50 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono">
                      FOUND: <span className="text-white font-bold">{compiledListings.length}</span> luxury listings matching parameters
                    </span>

                    {/* Split Map mode toggle option */}
                    <button
                      onClick={() => setSplitMapMode(!splitMapMode)}
                      className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border  transition-colors ${
                        splitMapMode 
                          ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                      }`}
                    >
                      🗺️ Map split view {splitMapMode ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-gray-400">
                    <span className="hidden sm:inline">SORT BY:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="bg-brand-card/60 p-1 px-2 border border-white/5 rounded-lg text-white"
                    >
                      <option value="newest">Featured Newest</option>
                      <option value="price-low">Price Low to High</option>
                      <option value="price-high">Price High to Low</option>
                      <option value="popular">Most Popular views</option>
                    </select>

                    {/* Layout format toggles */}
                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={() => setViewFormat('grid')}
                        className={`p-1.5 rounded-md ${viewFormat === 'grid' ? 'bg-brand-blue text-white' : 'hover:text-white'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewFormat('list')}
                        className={`p-1.5 rounded-md ${viewFormat === 'list' ? 'bg-brand-blue text-white' : 'hover:text-white'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid vs Split flow alignment */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column Feed (Grid / list format items) */}
                  <div className={`space-y-6 ${splitMapMode ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                    {compiledListings.length === 0 ? (
                      <div className="text-center py-24 glass-premium rounded-3xl border border-white/5">
                        <AlertCircle className="w-10 h-10 text-brand-gold mx-auto mb-3" />
                        <h4 className="text-base font-serif font-bold text-white">No properties matching parameters</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                          Try expanding your search cap, toggling un-furnished items, or resetting the active amenities criteria.
                        </p>
                        <button 
                          onClick={handleResetFilters}
                          className="bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue/20 px-4 py-2 rounded-xl text-xs font-semibold mt-4"
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      <div className={`grid gap-6 ${
                        viewFormat === 'list' 
                          ? 'grid-cols-1' 
                          : splitMapMode 
                          ? 'grid-cols-1 md:grid-cols-2' 
                          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {compiledListings.map(item => (
                          <div 
                            key={item.id}
                            onMouseEnter={() => setHoveredListingId(item.id)}
                            onMouseLeave={() => setHoveredListingId(null)}
                            className={`${item.id === hoveredListingId ? 'scale-101 ring-2 ring-brand-blue/10 rounded-2xl transition-all duration-300' : 'transition-transform duration-300'}`}
                          >
                            <ListingCard 
                              listing={item}
                              isFavorite={favorites.includes(item.id)}
                              onToggleFavorite={handleToggleFavorite}
                              onSelect={setSelectedListingId}
                              viewFormat={viewFormat}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column (MAP PANEL SPLIT MODE) */}
                  {splitMapMode && (
                    <div className="lg:col-span-4 h-[75vh] sticky top-28 rounded-3xl border border-white/15 overflow-hidden shadow-2xl bg-brand-dark/80 relative flex flex-col justify-between p-4">
                      
                      {/* Grid overlay mapping */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '100%, 20px 20px, 20px 20px'
                      }}></div>

                      <div className="z-10 bg-brand-dark/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 space-y-1">
                        <span className="text-[10px] text-brand-gold font-mono uppercase block font-bold leading-none">Map Split Synced Ledger</span>
                        <span className="text-[10px] text-gray-400 block font-mono">Nairobi High-Security Perimeter Zone</span>
                      </div>

                      {/* Interactive dot markers based on filtered list coordinates */}
                      <div className="flex-1 relative flex items-center justify-center">
                        {compiledListings.map(lst => {
                          const latY = lst.location.coordinates.lat;
                          const lngX = lst.location.coordinates.lng;

                          // Approximate mapper into pixel grid percent ( Nairobi coordinates approx focus)
                          const targetXPercent = ((lngX - 36.65) / 0.25) * 100;
                          const targetYPercent = ((Math.abs(latY) - 1.2) / 0.15) * 100;

                          return (
                            <button
                              key={lst.id}
                              onClick={() => setSelectedListingId(lst.id)}
                              onMouseEnter={() => setHoveredListingId(lst.id)}
                              onMouseLeave={() => setHoveredListingId(null)}
                              className="absolute w-8 h-8 flex items-center justify-center group pointer-events-auto transition-transform active:scale-95"
                              style={{
                                left: `${targetXPercent}%`,
                                top: `${targetYPercent}%`
                              }}
                            >
                              <div className="relative">
                                {/* Pin visual nodes */}
                                <div className={`absolute -inset-1 rounded-full transition-all duration-300 ${
                                  lst.id === hoveredListingId ? 'bg-brand-gold/30 animate-ping' : 'bg-brand-blue/20'
                                }`}></div>
                                
                                <div className={`w-3.5 h-3.5 rounded-full border border-white shadow-lg flex items-center justify-center transition-all ${
                                  lst.id === hoveredListingId ? 'bg-brand-gold text-brand-dark scale-115' : 'bg-brand-blue text-white'
                                }`}>
                                  <span className="text-[8px] font-sans font-black">
                                    {lst.pricing.currency === 'USD' ? '$' : 'K'}
                                  </span>
                                </div>

                                {/* Floating card tooltips on pin hover */}
                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-dark border border-white/15 p-2 rounded shadow-2xl z-40 max-w-[120px] pointer-events-none text-left">
                                  <span className="text-[9px] font-sans font-bold text-white block truncate">{lst.title}</span>
                                  <span className="text-[8px] text-brand-gold block mt-0.5 leading-none font-mono">
                                    {lst.pricing.currency === 'USD' ? '$' : 'K'}{lst.pricing.rent.toLocaleString()}
                                  </span>
                                </div>

                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="z-10 bg-brand-dark/95 p-3 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-center text-gray-500 font-mono leading-relaxed">
                          Hover mapping pins to inspect financial attributes. Click on pins opens property deep sheet.
                        </p>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* DETAILED 7-STEP PROPERTIES CREATION OVERLAY */}
      <AnimatePresence>
        {addListingOpen && (
          <ListPropertyFlow 
            onClose={() => setAddListingOpen(false)}
            onPublish={handlePublishListing}
            currentRole={currentRole}
          />
        )}
      </AnimatePresence>

      {/* FOOTER BLOCK */}
      <footer className="py-8 bg-brand-dark border-t border-white/5 px-4 md:px-8 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 NestList Luxury Estates Syndicate. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors font-semibold text-brand-gold">Stripe Sandbox Integrations</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors text-brand-blue">Supabase Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

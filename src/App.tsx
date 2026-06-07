/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { getApiUrl } from './utils/apiHelper';
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
  ArrowRight,
  CheckCircle
} from 'lucide-react';


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
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import ToastContainer from './components/ToastContainer';
import { toast } from './utils/toast';

import { checkExpiredListings } from './utils/paymentAndNotify';

export default function App() {
  
  // Install global UI alert overlay overrides to support high-fidelity iframe operation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message: any) => {
        const msg = String(message);
        if (
          msg.toLowerCase().includes('error') || 
          msg.toLowerCase().includes('failed') || 
          msg.toLowerCase().includes('reject') || 
          msg.toLowerCase().includes('invalid') ||
          msg.toLowerCase().includes('cap') ||
          msg.toLowerCase().includes('limit')
        ) {
          toast.error(msg);
        } else if (
          msg.toLowerCase().includes('success') || 
          msg.toLowerCase().includes('active') || 
          msg.toLowerCase().includes('approved') || 
          msg.toLowerCase().includes('✓') || 
          msg.toLowerCase().includes('complete')
        ) {
          toast.success(msg);
        } else if (
          msg.toLowerCase().includes('warning') || 
          msg.toLowerCase().includes('required') || 
          msg.toLowerCase().includes('caution') || 
          msg.toLowerCase().includes('alert')
        ) {
          toast.warning(msg);
        } else {
          toast.info(msg);
        }
      };
    }
  }, []);

  // GENERAL ACCOUNT STATES (Fideli-sync)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('Tenant');
  const [activeTab, setActiveTab ] = useState<'home' | 'search' | 'dashboard' | 'profile'>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // CORE REGISTRY (Simulated localized DB)
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewingRequests, setViewingRequests] = useState<ViewingRequest[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
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

  const registerProfileUpdate = (updater: Profile | ((prev: Profile) => Profile)) => {
    setUserProfile(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      if (updated.fullName) localStorage.setItem('nestlist_name', updated.fullName);
      if (updated.contactPhone) localStorage.setItem('nestlist_user_phone', updated.contactPhone);
      if (updated.contactEmail) localStorage.setItem('nestlist_email', updated.contactEmail);
      if (updated.avatarUrl !== undefined) localStorage.setItem('nestlist_avatar', updated.avatarUrl);
      if (updated.bio !== undefined) localStorage.setItem('nestlist_bio', updated.bio);
      return updated;
    });
  };

  // WIZARD CONTROLS
  const [addListingOpen, setAddListingOpen] = useState(false);

  // FILTER ENGINE STATUS
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewFormat, setViewFormat] = useState<'grid' | 'list'>('grid');
  const [splitMapMode, setSplitMapMode] = useState(false);
  const [mapViewType, setMapViewType] = useState<'street' | 'satellite'>('street');

  // FILTERS CRITERIA WITH CACHE (Upgrade 9)
  const [searchLocation, setSearchLocation] = useState(() => localStorage.getItem('nestlist_cache_location') || '');
  const [searchCounty, setSearchCounty] = useState<string>('all');
  const [searchPropertyType, setSearchPropertyType] = useState(() => localStorage.getItem('nestlist_cache_propertyType') || 'all');
  const [searchPriceRange, setSearchPriceRange] = useState<number>(() => {
    const cached = localStorage.getItem('nestlist_cache_priceRange');
    return cached ? parseInt(cached, 10) : 500000;
  });
  const [searchBedrooms, setSearchBedrooms] = useState<number | 'all' | '5plus'>(() => {
    const cached = localStorage.getItem('nestlist_cache_bedrooms');
    if (cached === 'all' || cached === '5plus') return cached;
    return cached ? (parseInt(cached, 10) as any) : 'all';
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');

  // Performance tracking & pagination states (Upgrade 9 & 12)
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('nestlist_recent_searches');
      return cached ? JSON.parse(cached) : ["Kilimani", "Westlands", "Karen"];
    } catch {
      return ["Kilimani", "Westlands", "Karen"];
    }
  });

  const handleSearchSubmit = (loc: string) => {
    setSearchLocation(loc);
    setShowSearchSuggestions(false);
    if (loc.trim() && !recentSearches.includes(loc)) {
      const updated = [loc, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('nestlist_recent_searches', JSON.stringify(updated));
    }
  };

  // Automatically save state metrics in cache
  useEffect(() => {
    localStorage.setItem('nestlist_cache_location', searchLocation);
    localStorage.setItem('nestlist_cache_propertyType', searchPropertyType);
    localStorage.setItem('nestlist_cache_priceRange', searchPriceRange.toString());
    localStorage.setItem('nestlist_cache_bedrooms', searchBedrooms.toString());
    setVisibleCount(12); // reset view on changed inputs
  }, [searchLocation, searchPropertyType, searchPriceRange, searchBedrooms]);

  // ADVANCED SPECS FILTERS
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [filterFurnishedOnly, setFilterFurnishedOnly] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterDistanceFromCenter, setFilterDistanceFromCenter] = useState<number>(30); // Max distance KMs

  // FULL-STACK SERVER INTEGRATION HARNESS (with loading tracking)
  const refreshServerListings = () => {
    fetch(getApiUrl('/api/listings'))
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.listings) {
          setListings(data.listings);
        }
        setIsListingsLoading(false);
      })
      .catch(err => {
        console.warn("API Server ping waiting...", err);
        setIsListingsLoading(false);
      });
  };

  const refreshUserData = () => {
    const token = localStorage.getItem('nestlist_token');
    if (!token) return;

    // 1. Fetch Inquiries
    fetch(getApiUrl('/api/inquiries'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.inquiries) {
          // Translate to listing-detail model representation
          const mapped = data.inquiries.map((i: any) => ({
            id: i.id,
            listingId: i.listingId,
            listingTitle: i.listingTitle || 'Rent Property',
            listingImage: i.listingImage || '',
            senderName: i.tenantName || 'Tenant Name',
            senderEmail: i.tenantEmail || 'tenant@email.com',
            senderPhone: i.tenantPhone || '',
            message: i.message,
            isReplied: i.isReplied || false,
            createdAt: i.createdAt
          }));
          setInquiries(mapped);
        }
      })
      .catch(err => console.warn("Failed to fetch inquiries:", err));

    // 2. Fetch Notifications
    fetch(getApiUrl('/api/notifications'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.notifications) {
          // Map to local Notification schema
          const mapped = data.notifications.map((n: any) => ({
            id: n.id,
            userId: n.userId,
            type: n.type || 'inquiry',
            title: n.title,
            description: n.message,
            isRead: n.isRead,
            createdAt: n.createdAt
          }));
          setNotifications(mapped);
        }
      })
      .catch(err => console.warn("Failed to fetch notifications:", err));

    // 3. Fetch Transactions / Payments
    fetch(getApiUrl('/api/payments'))
      .then(res => res.json())
      .then(data => {
        if (data.success && data.payments) {
          const txs: Transaction[] = data.payments.map((p: any) => ({
            id: p.id,
            userId: p.userId || 'current-user-id',
            amount: p.amount,
            currency: p.currency || 'KES',
            status: p.status || 'success',
            description: p.description || 'Property Listing Payment',
            type: p.type || 'boost',
            createdAt: p.createdAt || p.paymentTimestamp || new Date().toISOString()
          }));
          setTransactions(txs);
        }
      })
      .catch(err => console.warn("Failed to fetch payments:", err));

    // 4. Fetch Users (for Admin Workspace space)
    fetch(getApiUrl('/api/users'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.users) {
          const accounts = data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            isSuspended: u.isSuspended || false,
            email: u.email
          }));
          setUserAccounts(accounts);
        }
      })
      .catch(err => console.warn("Failed to fetch user accounts:", err));

    // 5. Fetch Reports / claims (for claims management)
    fetch(getApiUrl('/api/reports'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.reports) {
          setReports(data.reports);
        }
      })
      .catch(err => console.warn("Failed to fetch system claims:", err));
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshUserData();
      const userInterval = setInterval(refreshUserData, 6000);
      return () => clearInterval(userInterval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // Identity auto-login from local token on layout mount
    const token = localStorage.getItem('nestlist_token');
    if (token && token !== "MOCK_TOKEN") {
      fetch(getApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          const u = data.user;
          setCurrentRole(u.role);
          const savedPhone = localStorage.getItem('nestlist_user_phone') || '';
          
          if (u.avatarUrl) localStorage.setItem('nestlist_avatar', u.avatarUrl);
          if (u.bio) localStorage.setItem('nestlist_bio', u.bio);

          setUserProfile({
            id: u.id,
            userId: u.id,
            username: (u.email || 'guest').split('@')[0],
            fullName: u.name,
            avatarUrl: u.avatarUrl || '',
            bio: u.bio || '',
            contactEmail: u.email,
            contactPhone: savedPhone || u.phone || '',
            location: u.location || 'Nairobi, Kenya',
            preferredContact: u.preferredContact || 'Email',
            twoFactorEnabled: u.twoFactorEnabled || false,
            notificationPrefs: u.notificationPrefs || { email: true, sms: true, push: true },
            privacySettings: u.privacySettings || { publicProfile: true, searchIndexing: true, showContact: true },
            agencyName: u.agencyName || '',
            businessLogo: u.businessLogo || '',
            businessDescription: u.businessDescription || '',
            officeLocation: u.officeLocation || '',
            businessContact: u.businessContact || '',
            isVerified: u.isVerified !== undefined ? u.isVerified : true,
            kycStatus: u.role === 'Agent' || u.role === 'Landlord' ? 'verified' : 'pending',
            createdAt: u.createdAt || new Date().toISOString()
          });
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('nestlist_token');
        }
      })
      .catch(err => {
        console.warn("Identity auto-login error. Attempting cached credentials fallback...", err);
        const savedPhone = localStorage.getItem('nestlist_user_phone') || '';
        const savedRole = localStorage.getItem('nestlist_role') as UserRole || 'Tenant';
        const savedEmail = localStorage.getItem('nestlist_email');
        const savedName = localStorage.getItem('nestlist_name');
        const savedAvatar = localStorage.getItem('nestlist_avatar') || '';
        const savedBio = localStorage.getItem('nestlist_bio') || '';

        if (savedEmail && savedRole) {
          setCurrentRole(savedRole);
          setUserProfile(prev => ({
            ...prev,
            fullName: savedName || prev.fullName,
            contactEmail: savedEmail,
            contactPhone: savedPhone || prev.contactPhone,
            avatarUrl: savedAvatar || prev.avatarUrl,
            bio: savedBio || prev.bio,
            kycStatus: savedRole === 'Agent' || savedRole === 'Landlord' ? 'verified' : 'pending'
          }));
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('nestlist_token');
        }
      });
    }

    refreshServerListings();
    const interval = setInterval(refreshServerListings, 4000);

    // Dynamic event to open listing details directly from payment step 8 success screen
    const handleOpenDetails = (e: Event) => {
      const listingId = (e as CustomEvent).detail;
      if (listingId) {
        setSelectedListingId(listingId);
        setActiveTab('home'); // focus home tab to present listing modal details
      }
    };
    window.addEventListener('open-listing-details', handleOpenDetails);

    return () => {
      clearInterval(interval);
      window.removeEventListener('open-listing-details', handleOpenDetails);
    };
  }, []);

  // Run passive listing expiry audits once listings populate
  useEffect(() => {
    if (listings.length > 0) {
      checkExpiredListings(listings, setListings);
    }
  }, [listings.length]);

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
  const handleAddInquiry = async (newInq: Inquiry) => {
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

    // Retrieve full listing details for contextual dispatches
    const listing = listings.find(l => l.id === newInq.listingId);
    if (listing) {
      // 1. Send SMS notify to Landlord via Africa's Talking Node
      const landlordPhone = listing.author?.phone || '+254712345678';
      const mpesaSmsText = `Hello! You have received a premium inquiry from ${newInq.senderName} (${newInq.senderPhone}) on your property "${listing.title}". Message: "${newInq.message.substring(0, 60)}..."`;
      
      const { sendSMSNotification, sendEmailNotification } = await import('./utils/paymentAndNotify');
      await sendSMSNotification(landlordPhone, mpesaSmsText);

      // 2. EmailJS - Send template_new_inquiry to landlord
      await sendEmailNotification('template_new_inquiry', {
        to_email: listing.author?.email || 'mwangi@nestlist.luxury',
        landlord_name: listing.author?.name || 'Property Owner',
        tenant_name: newInq.senderName,
        tenant_phone: newInq.senderPhone,
        tenant_email: newInq.senderEmail,
        listing_title: listing.title,
        message: newInq.message
      });

      // 3. EmailJS - Send template_inquiry_sent to tenant
      await sendEmailNotification('template_inquiry_sent', {
        to_email: newInq.senderEmail || 'mkenya@gmail.com',
        tenant_name: newInq.senderName,
        listing_title: listing.title,
        landlord_phone: landlordPhone,
        message: newInq.message
      });
    }
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        ...newListing.author,
        isVerified: userProfile.isVerified
      }
    } as any;

    // Send SMS notify to landlord of creation
    import('./utils/paymentAndNotify').then(({ sendSMSNotification, getListingFee }) => {
      const landlordPhone = verifiedListing.author?.phone || '+254712345678';
      const fee = getListingFee(verifiedListing.propertyType, verifiedListing.details.bedrooms);
      const msg = `Hello! Your property listing "${verifiedListing.title}" has been successfully received on NestList. Please complete the listing fee of KSh ${fee} to publish it live for 30 days.`;
      sendSMSNotification(landlordPhone, msg);
    });

    // Save on real express full-stack server backend
    const token = localStorage.getItem('nestlist_token');
    fetch(getApiUrl('/api/listings'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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

  const handleActivateListing = (id: string) => {
    const updated = listings.map(l => {
      if (l.id === id) {
        return { ...l, status: 'active' as any };
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
      toast.warning("Please provide a name/label for your saved search preferences.");
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
    
    toast.success(`Search preference "${newSearch.name}" is now stored in your account!`);
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
    setActiveTab('home');
  };

  // FILTER LOGIC COMPILER
  const compiledListings = useMemo(() => {
    let result = [...listings];

    // Exclude any pending_payment status listings unless it belongs to the active landlord/agent user
    result = result.filter(item => {
      if (item.status === 'active' || !item.status) return true;
      // Keep it visible if current user is the author
      if (item.author?.email === userProfile?.contactEmail) return true;
      return false;
    });

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
      if (searchBedrooms === '5plus') {
        result = result.filter(item => item.details.bedrooms >= 5);
      } else {
        result = result.filter(item => item.details.bedrooms === searchBedrooms);
      }
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

  // Slice compiledListings to implement infinite visual pagination limit (Upgrade 9)
  const paginatedListings = useMemo(() => {
    return compiledListings.slice(0, visibleCount);
  }, [compiledListings, visibleCount]);

  // Selected Listing Object ref
  const activeListingDetails = listings.find(l => l.id === selectedListingId);

  const handleLogout = () => {
    localStorage.removeItem('nestlist_token');
    localStorage.removeItem('nestlist_user_phone');
    localStorage.removeItem('nestlist_role');
    localStorage.removeItem('nestlist_email');
    localStorage.removeItem('nestlist_name');
    localStorage.removeItem('nestlist_avatar');
    localStorage.removeItem('nestlist_bio');
    setIsLoggedIn(false);
    setCurrentRole('Tenant');
    setSelectedListingId(null);
    setActiveTab('home');
  };

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('nestlist_token', token);
    localStorage.setItem('nestlist_user_phone', user.phone || '');
    localStorage.setItem('nestlist_role', user.role);
    localStorage.setItem('nestlist_email', user.email);
    localStorage.setItem('nestlist_name', user.name);
    if (user.avatarUrl) localStorage.setItem('nestlist_avatar', user.avatarUrl);
    if (user.bio) localStorage.setItem('nestlist_bio', user.bio);

    setCurrentRole(user.role);
    setUserProfile({
      id: user.id || 'user-p1',
      userId: user.id || 'current-user-id',
      username: (user.email || 'guest').split('@')[0],
      fullName: user.name || 'User Name',
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
      contactEmail: user.email || '',
      contactPhone: user.phone || '',
      location: user.location || 'Nairobi, Kenya',
      preferredContact: user.preferredContact || 'Email',
      twoFactorEnabled: user.twoFactorEnabled || false,
      notificationPrefs: user.notificationPrefs || { email: true, sms: true, push: true },
      privacySettings: user.privacySettings || { publicProfile: true, searchIndexing: true, showContact: true },
      agencyName: user.agencyName || '',
      businessLogo: user.businessLogo || '',
      businessDescription: user.businessDescription || '',
      officeLocation: user.officeLocation || '',
      businessContact: user.businessContact || '',
      isVerified: user.isVerified !== undefined ? user.isVerified : true,
      kycStatus: user.role === 'Agent' || user.role === 'Landlord' ? 'verified' : 'pending',
      createdAt: user.createdAt || new Date().toISOString()
    });
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login 
          onLoginSuccess={handleLoginSuccess} 
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-between selection:bg-brand-blue selection:text-white">
      <ToastContainer />
      
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
        setActiveTab={(tab) => setActiveTab(tab as any)}
        onSelectPropertyId={setSelectedListingId}
        userProfile={userProfile}
        onUpdateProfile={registerProfileUpdate}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
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
                isLoggedIn={isLoggedIn}
                userProfile={userProfile}
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
                  setActiveTab('home');
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
                onUpdateProfile={registerProfileUpdate}
                onActivateListing={handleActivateListing}
                onLogout={handleLogout}
              />
            </motion.div>
          )

          // OPTION 3: TENANT HOME WORKSPACE AND INTERACTIVE SEARCH WORKBENCH (Adopting the NestList Browse design!)
          : (activeTab === 'home' || activeTab === 'search') ? (
            <motion.div 
              key="browse-search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8 max-w-6xl mx-auto px-4 mt-6 pb-20"
            >
              {/* HERO SECTION */}
              <div className="text-center py-10 md:py-16 space-y-6 relative overflow-hidden rounded-3xl">
                {/* Floating ambient color blobs that change color per page visual theme */}
                <div className="absolute -top-12 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none animate-shimmer-line" />
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-shimmer-line" />

                <div className="space-y-5 relative z-10">
                  {/* Live Listing Count Pill */}
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold text-emerald-400 font-dmsans uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    {compiledListings.length} verified properties live
                  </div>

                  {/* Large Heading with subtle animated background gradient glow */}
                  <h1 className="text-[36px] md:text-[52px] font-extrabold font-syne tracking-tight text-white max-w-4xl mx-auto leading-tight transition-all">
                    Find Your Dream Home <br className="hidden sm:inline" />
                    <span className="relative inline-block bg-gradient-to-r from-[#7C6FF7] via-[#C084FC] via-[#34D399] via-[#60A5FA] to-[#FB923C] bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer-line py-1">
                      Across Kenya
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-slate-400 font-dmsans max-w-xl mx-auto text-sm md:text-base font-semibold">
                    Browse verified properties from trusted landlords
                  </p>

                  {/* 3 Trust Stats */}
                  <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 pt-2 text-xs md:text-sm font-semibold text-slate-300 font-dmsans">
                    <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">🏠 1,200+ Listings</span>
                    <span className="text-slate-600">•</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">✅ Verified Landlords</span>
                    <span className="text-slate-600">•</span>
                    <span className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full">⚡ Instant Contact</span>
                  </div>
                </div>

                {/* Full-width Search Bar height 56px (h-14) (Upgrade 2, 10 & 12) */}
                <div id="hero-search-wrapper" className="pt-6 relative max-w-3xl mx-auto z-30">
                  {/* Clicking backdrop closes the suggestion popup */}
                  {showSearchSuggestions && (
                    <div 
                      className="fixed inset-0 z-20 cursor-default" 
                      onClick={() => setShowSearchSuggestions(false)} 
                    />
                  )}

                  <div className="relative z-30 bg-[#0E0F1C]/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 w-full shadow-2xl shadow-purple-950/20 glow-purple-focus h-auto md:h-14">
                    <div className="flex items-center gap-2 px-3.5 flex-1 w-full border-b md:border-b-0 md:border-r border-white/5 pb-2.5 md:pb-0 h-full">
                      <MapPin className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />
                      <input 
                        type="text" 
                        value={searchLocation}
                        onChange={(e) => {
                          setSearchLocation(e.target.value);
                          setShowSearchSuggestions(true);
                        }}
                        onFocus={() => setShowSearchSuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit(searchLocation);
                          }
                        }}
                        placeholder="Where would you like to live? (e.g. Kilimani, Westlands, Nyali...)"
                        className="w-full bg-transparent border-none outline-none font-dmsans font-semibold text-white placeholder:text-slate-500 text-sm py-1.5 focus:ring-0 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => handleSearchSubmit(searchLocation)}
                      className="w-full md:w-auto h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 active:scale-95 text-white text-xs font-syne font-black px-8 rounded-xl tracking-wider transition-all cursor-pointer select-none py-3.5"
                    >
                      SEARCH HOME
                    </button>
                  </div>

                  {/* DROP-DOWN SEARCH SUGGESTIONS INTERACTIVE POPUP (Upgrade 12) */}
                  {showSearchSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0C0D17]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl z-40 text-left space-y-4 max-h-[350px] overflow-y-auto scrollbar-none">
                      
                      {/* Live queries list if keyword populated */}
                      {searchLocation.trim() && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-mono font-black text-violet-400 tracking-wider">Matching Areas:</span>
                          <div className="grid grid-cols-1 gap-1">
                            {["Kilimani", "Westlands", "Karen", "Lavington", "Kileleshwa", "Kasarani", "Ruaka", "Ngong Road", "South B", "South C", "Eastleigh", "Mombasa CBD", "Nyali", "Nakuru", "Eldoret", "Kisumu"]
                              .filter(loc => loc.toLowerCase().includes(searchLocation.toLowerCase()))
                              .slice(0, 5)
                              .map(matchingLoc => (
                                <button
                                  key={matchingLoc}
                                  onClick={() => handleSearchSubmit(matchingLoc)}
                                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-slate-200 text-xs font-bold font-dmsans transition-all flex items-center gap-2 cursor-pointer"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                                  <span>{matchingLoc}</span>
                                </button>
                              ))
                            }
                          </div>
                        </div>
                      )}

                      {/* Recent queries */}
                      {recentSearches.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-mono font-black text-slate-500 tracking-wider">Recent Searches</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentSearches([]);
                                localStorage.removeItem('nestlist_recent_searches');
                              }}
                              className="text-[9px] font-bold text-rose-400 hover:underline uppercase font-mono transition-colors cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {recentSearches.map(term => (
                              <button
                                key={term}
                                onClick={() => handleSearchSubmit(term)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-violet-600/20 border border-white/5 text-[11px] font-bold text-slate-300 transition-all font-dmsans cursor-pointer"
                              >
                                ↺ {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Estates Grid list */}
                      <div className="space-y-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] uppercase font-mono font-black text-slate-500 tracking-wider">Popular Kenya Estates</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {["Kilimani", "Westlands", "Karen", "Lavington", "Kileleshwa", "Kasarani", "Ruaka", "Ngong Road", "South B", "South C", "Eastleigh", "Mombasa CBD", "Nyali", "Nakuru", "Eldoret", "Kisumu"].map(est => (
                            <button
                              key={est}
                              onClick={() => handleSearchSubmit(est)}
                              className="text-left px-2.5 py-2 rounded-xl hover:bg-white/5 text-slate-300 text-[11px] font-bold transition-all truncate hover:text-white cursor-pointer"
                            >
                              🗺️ {est}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Popular search chips */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-400 relative z-10">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Popular:</span>
                    {["Kilimani", "Westlands", "Karen", "Kasarani", "Mombasa"].map(chip => (
                      <button
                        key={chip}
                        onClick={() => handleSearchSubmit(chip)}
                        className="px-3 py-1 bg-[#121324] hover:bg-violet-600/20 border border-white/5 text-slate-300 rounded-full transition-all text-[11px] active:scale-95 cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FILTER ROW */}
              <div className="bg-[#0E0F1C]/85 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 font-dmsans">
                
                {/* Scrollable Row for Unified Property and bedroom pills */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/5 pb-4 overflow-hidden w-full">
                  <div className="space-y-1 w-full max-w-full overflow-hidden">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase font-mono tracking-widest">Filter by category or size:</span>
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-none max-w-full">
                      {[
                        { label: 'All', type: 'all', beds: 'all' },
                        { label: 'Single Room', type: 'Single Room', beds: 'all' },
                        { label: 'Bedsitter', type: 'Bedsitter', beds: 'all' },
                        { label: 'Studio', type: 'Studio', beds: 'all' },
                        { label: '1BR', type: 'all', beds: 1 },
                        { label: '2BR', type: 'all', beds: 2 },
                        { label: '3BR', type: 'all', beds: 3 },
                        { label: '4BR', type: 'all', beds: 4 },
                        { label: '5BR+', type: 'all', beds: '5plus' }
                      ].map(pill => {
                        const isPillActive = (pill.type === 'all' && pill.beds === 'all') 
                          ? (searchPropertyType === 'all' && searchBedrooms === 'all')
                          : (pill.type !== 'all' ? searchPropertyType === pill.type : searchBedrooms === pill.beds);

                        return (
                          <motion.button
                            key={pill.label}
                            whileTap={{ scale: 0.90 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            onClick={() => {
                              if (pill.type === 'all' && pill.beds === 'all') {
                                setSearchPropertyType('all');
                                setSearchBedrooms('all');
                              } else if (pill.type !== 'all') {
                                setSearchPropertyType(pill.type);
                                setSearchBedrooms('all');
                              } else {
                                setSearchPropertyType('all');
                                setSearchBedrooms(pill.beds as any);
                              }
                            }}
                            className={`px-4.5 py-2.5 rounded-xl text-xs font-syne font-extrabold transition-all duration-300 border cursor-pointer select-none relative ${
                              isPillActive
                                ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white border-transparent shadow-[0_0_20px_rgba(139,92,246,0.35)] font-black'
                                : 'bg-[#121324] text-slate-400 border-white/5 hover:border-white/15'
                            }`}
                          >
                            {pill.label}
                            {isPillActive && (
                              <motion.span 
                                layoutId="activeFilterPillDot"
                                className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#08080F]"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clear all filters trigger */}
                  {(() => {
                    const isAnyFilterActive = searchLocation !== '' || searchPropertyType !== 'all' || searchBedrooms !== 'all' || searchCounty !== 'all' || searchPriceRange !== 500000 || filterFurnishedOnly || filterAmenities.length > 0;
                    if (!isAnyFilterActive) return null;
                    return (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 text-xs font-syne font-black rounded-full transition-all cursor-pointer select-none shrink-0"
                      >
                        ✕ Clear All Filters
                      </motion.button>
                    );
                  })()}
                </div>

                {/* Sub row with slider and selectors */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                    
                    {/* Price Slider integrated directly instead of dropdown */}
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-3.5 flex-1 min-w-[240px] space-y-1.5 text-left">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-405 font-mono">
                        <span>Max Rent Budget Slider:</span>
                        <span className="text-violet-400 font-extrabold text-[11px]">KES {searchPriceRange.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range"
                        min={15000}
                        max={600000}
                        step={5000}
                        value={searchPriceRange}
                        onChange={(e) => setSearchPriceRange(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>

                    {/* County / City filter */}
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-center text-left">
                      <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider mb-1 block">Metropolitan Area:</span>
                      <select
                        value={searchCounty}
                        onChange={(e) => setSearchCounty(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-white cursor-pointer outline-none min-w-[140px] py-1"
                      >
                        <option value="all">Everywhere in Kenya</option>
                        {KENYA_COUNTIES_CLEAN.map((county, idx) => (
                          <option key={idx} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sorting dropdown */}
                    <div className="bg-[#121324] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-center text-left">
                      <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider mb-1 block">Sorted Sequence:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="bg-transparent border-none text-xs font-bold text-white cursor-pointer outline-none min-w-[150px] py-1"
                      >
                        <option value="newest">Newest Houses</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="popular">Most Viewed / Hot</option>
                      </select>
                    </div>

                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                    {/* Matching text info indicator */}
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      {compiledListings.length} {compiledListings.length === 1 ? 'property' : 'properties'} found
                    </span>

                    {/* Grid/List view toggle buttons */}
                    <div className="flex items-center bg-[#121324] border border-white/5 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => setViewFormat('grid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewFormat === 'grid' 
                            ? 'bg-gradient-to-r from-violet-500 to-indigo-505 text-white font-extrabold shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Grid style"
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewFormat('list')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          viewFormat === 'list' 
                            ? 'bg-gradient-to-r from-violet-500 to-indigo-550 text-white font-extrabold shadow-md' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="List style"
                      >
                        List
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADVANCED CRITERIA DRAWER */}
              <div className="text-left bg-[#0E0F1C]/45 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-dmsans">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Slider cap */}
                  <div className="space-y-1.5 min-w-[200px]">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 font-mono">
                      <span>Maximum rent budget:</span>
                      <span className="text-violet-400 font-extrabold">KSh {searchPriceRange.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range"
                      min={20000}
                      max={600000}
                      step={10000}
                      value={searchPriceRange}
                      onChange={(e) => setSearchPriceRange(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>

                  {/* Furnished Status Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 font-bold">
                    <input 
                      type="checkbox" 
                      checked={filterFurnishedOnly}
                      onChange={(e) => setFilterFurnishedOnly(e.target.checked)}
                      className="rounded border-white/10 text-violet-500 bg-white/5 focus:ring-violet-500"
                    />
                    <span>Furnished Only</span>
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-500 text-xs font-mono font-medium">{compiledListings.length} matching spaces found</span>
                  <button 
                    onClick={handleResetFilters}
                    className="text-[10px] font-syne font-extrabold text-indigo-405 hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    Reset Keys
                  </button>
                </div>
              </div>

              {/* FEATURED Properties section */}
              {compiledListings.some(l => l.isFeatured) && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="bg-gradient-to-r from-amber-250 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-syne font-extrabold text-sm uppercase tracking-wider flex items-center gap-1">
                      ★ Featured Properties
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">VERIFIED PREMIUM SELECTIONS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {compiledListings.filter(l => l.isFeatured).slice(0, 3).map(item => (
                      <div key={item.id} className="transition-all duration-300 hover:scale-[1.03] scale-[1.02] origin-center z-10">
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
                </div>
              )}

              {/* REGULAR PROPERTIES TITLE */}
              <div className="text-left border-b border-white/5 pb-2 flex justify-between items-center font-syne">
                <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest font-mono">
                  All Kenya Listings
                </span>
                <span className="text-xs text-slate-500 font-bold font-dmsans">
                  {compiledListings.length} Available Properties
                </span>
              </div>

              {/* LISTINGS Grid FEED */}
              {isListingsLoading ? (
                /* Skeleton loader (Upgrade 9) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#0E0F1C]/75 border border-white/5 rounded-[24px] p-4 space-y-4 animate-pulse">
                      <div className="w-full h-[180px] bg-slate-800/35 rounded-2xl animate-skeleton" />
                      <div className="h-4.5 bg-slate-800/35 rounded w-3/4 animate-skeleton" />
                      <div className="h-3 bg-slate-800/35 rounded w-1/2 animate-skeleton" />
                      <div className="flex gap-2 pt-1 border-t border-white/5 pt-3">
                        <div className="h-3 bg-slate-800/35 rounded w-10 animate-skeleton" />
                        <div className="h-3 bg-slate-800/35 rounded w-10 animate-skeleton" />
                        <div className="h-3 bg-slate-800/35 rounded w-10 animate-skeleton" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : compiledListings.length === 0 ? (
                /* Empty state format (Upgrade 8) */
                <div className="text-center py-20 bg-[#0E0F1C]/65 border border-white/10 rounded-[32px] p-8 space-y-5 max-w-lg mx-auto backdrop-blur-md shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 pointer-events-none" />
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="text-7xl block select-none filter drop-shadow-[0_8px_16px_rgba(139,92,246,0.3)]"
                  >
                    🏠
                  </motion.div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-syne font-black text-lg text-white leading-tight">
                      No properties found in {searchLocation || 'this region'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto font-dmsans font-semibold">
                      Be the first partner to syndi-list your premium property here and capture verified organic leads!
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => setAddListingOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:brightness-110 text-white text-xs font-syne font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-lg shadow-violet-600/20"
                    >
                      Post a Listing
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-350 text-xs font-syne font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedListings.map(item => (
                        <div key={item.id} className="transition-all duration-300 hover:scale-[1.015]">
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
                  </div>

                  {/* Load More Pagination Trigger (Upgrade 9) */}
                  {visibleCount < compiledListings.length && (
                    <div className="pt-4 pb-6 flex justify-center w-full">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="px-8 py-3.5 bg-[#121324] hover:bg-violet-600/10 border border-white/5 hover:border-violet-500/30 text-slate-300 hover:text-white text-xs font-syne font-black rounded-2xl tracking-[2px] transition-all duration-350 select-none uppercase shadow-md shadow-black/80"
                      >
                        Load More Listings
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )

          // OPTION 4: COMPLETE ADVANCED PROFILE PAGE & ACCOUNT SETTINGS MANAGEMENT HUB
          : (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfilePage
                userProfile={userProfile}
                onUpdateProfile={registerProfileUpdate}
                listings={listings}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectListing={(id) => {
                  setSelectedListingId(id);
                  setActiveTab('home');
                }}
                inquiries={inquiries}
                notifications={notifications}
                currentRole={currentRole}
                onChangeRole={setCurrentRole}
                onLogout={handleLogout}
              />
            </motion.div>
          )
        }
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

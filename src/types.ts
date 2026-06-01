/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Tenant' | 'Landlord' | 'Caretaker' | 'Agent' | 'Admin';

export interface Profile {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  kycStatus: 'unverified' | 'pending' | 'verified';
  createdAt: string;
  verificationId?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: Profile;
  createdAt: string;
}

export type PropertyType = 'House' | 'Apartment' | 'Studio' | 'Bedsitter' | 'Villa' | 'Commercial';

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  isCover: boolean;
  order: number;
}

export type Currency = 'KES' | 'USD';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually';
export type ListingStatus = 'active' | 'draft' | 'pending_approval' | 'expired' | 'paused' | 'pending_payment';

export interface Amenity {
  id: string;
  name: string;
  icon: string; // lucide icon name
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  roleType: 'Landlord' | 'Agent' | 'Caretaker';
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    neighborhood: string;
    tags: string[];
    county?: string;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    size: number;
    sizeUnit: 'sqft' | 'sqm';
    isFurnished: boolean;
    amenities: string[]; // ids or names of amenities
  };
  pricing: {
    rent: number;
    deposit: number;
    currency: Currency;
    frequency: PaymentFrequency;
  };
  media: {
    images: ListingImage[];
    videoUrl?: string;
    virtualTourUrl?: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
    phone: string;
    email: string;
    isVerified: boolean;
  };
  isFeatured: boolean;
  status: ListingStatus;
  createdAt: string;
  views: number;
  inquiriesCount: number;
  savesCount: number;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  isReplied: boolean;
  replyText?: string;
  createdAt: string;
}

export interface ViewingRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  agentName: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'declined';
  notes?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  listingId: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'inquiry' | 'viewing' | 'listing_status' | 'payment' | 'review' | 'saved_search_match';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: {
    location: string;
    propertyType: string;
    maxPrice: number;
    bedrooms: number | 'all';
    amenities: string[];
    isFurnished: boolean;
  };
  notificationsEnabled: boolean;
  createdAt: string;
}

export interface SimulatedEmail {
  id: string;
  savedSearchId: string;
  savedSearchName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'Free' | 'Pro' | 'Business';
  status: 'active' | 'canceled' | 'past_due';
  expiresAt: string;
  billingFrequency: 'monthly' | 'annually';
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: 'success' | 'failed' | 'pending';
  description: string;
  type: 'subscription' | 'boost';
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

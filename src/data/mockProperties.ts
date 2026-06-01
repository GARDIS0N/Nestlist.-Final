/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Listing, Inquiry, ViewingRequest, Review, Notification, Transaction, Report } from '../types';

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list-1',
    title: 'The Runda Crest Majestic Villa',
    description: 'Tucked away in the elite enclave of Runda, this magnificent 5-bedroom villa stands as a masterwork of premium architectural design. Spanned over lush manicured gardens, the residence enjoys a modern, open-concept lounge, a double-volume gourmet kitchen equipped with high-end appliances, an in-house private gym, a sparkling temperature-controlled lap pool, and high-security provisions inside a secure gated boundary.',
    propertyType: 'Villa',
    roleType: 'Agent',
    location: {
      address: '15 Runda Drive, Nairobi',
      coordinates: { lat: -1.2185, lng: 36.8048 },
      neighborhood: 'Runda Enclave',
      tags: ['Diplomatic Zone', 'High Security', 'Manicured Gardens']
    },
    details: {
      bedrooms: 5,
      bathrooms: 6,
      size: 5800,
      sizeUnit: 'sqft',
      isFurnished: true,
      amenities: ['wifi', 'parking', 'gym', 'pool', 'security', 'water', 'electricity_backup']
    },
    pricing: {
      rent: 4200,
      deposit: 8400,
      currency: 'USD',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-1-1', listingId: 'list-1', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 },
        { id: 'img-1-2', listingId: 'list-1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 },
        { id: 'img-1-3', listingId: 'list-1', url: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=800', isCover: false, order: 2 },
        { id: 'img-1-4', listingId: 'list-1', url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=800', isCover: false, order: 3 }
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      virtualTourUrl: 'https://my.matterport.com/show/?m=mocktourid1'
    },
    author: {
      id: 'agent-1',
      name: 'Victoria Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'Agent',
      phone: '+254 712 345 678',
      email: 'victoria@nestlist.luxury',
      isVerified: true
    },
    isFeatured: true,
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    views: 412,
    inquiriesCount: 28,
    savesCount: 145
  },
  {
    id: 'list-2',
    title: 'Kilimani Skyview Premium Duplex',
    description: 'Rising gracefully over the central skyline of Kilimani, this 3-bedroom luxury duplex apartment delivers bespoke urban charm. Offering panoramic views of Nairobi from its wrap-around glass balcony, the duplex features polished Spanish floor tiles, integrated sound systems, an open sky deck, high-speed elevators, continuous solar water heating, and a solid building support squad.',
    propertyType: 'Apartment',
    roleType: 'Landlord',
    location: {
      address: 'Chania Avenue, Kilimani, Nairobi',
      coordinates: { lat: -1.2941, lng: 36.7893 },
      neighborhood: 'Kilimani',
      tags: ['Sky Canopy', 'Centrally Located', 'High-speed Elevators']
    },
    details: {
      bedrooms: 3,
      bathrooms: 4,
      size: 240,
      sizeUnit: 'sqm',
      isFurnished: false,
      amenities: ['wifi', 'parking', 'gym', 'security', 'water', 'electricity_backup']
    },
    pricing: {
      rent: 145000,
      deposit: 145000,
      currency: 'KES',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-2-1', listingId: 'list-2', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 },
        { id: 'img-2-2', listingId: 'list-2', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 },
        { id: 'img-2-3', listingId: 'list-2', url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800', isCover: false, order: 2 }
      ],
      videoUrl: '',
      virtualTourUrl: ''
    },
    author: {
      id: 'agent-2',
      name: 'David Mwangi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      role: 'Landlord',
      phone: '+254 722 998 877',
      email: 'mwangi@nestlist.luxury',
      isVerified: true
    },
    isFeatured: true,
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    views: 189,
    inquiriesCount: 12,
    savesCount: 52
  },
  {
    id: 'list-3',
    title: 'Minimalist Westlands Horizon Studio',
    description: 'Perfect for modern young professionals, this executive studio apartment boasts ultra-modern design aesthetics, smart keyless entry, modular walk-in wardrobes, a rooftop swimming pool with stunning sunset views over the Karura forest line, and immediate walking distance to premium financial centers.',
    propertyType: 'Studio',
    roleType: 'Agent',
    location: {
      address: 'General Mathenge Dr, Westlands, Nairobi',
      coordinates: { lat: -1.2589, lng: 36.8011 },
      neighborhood: 'Westlands North',
      tags: ['Walking Distance', 'Rooftop Pool', 'Smart Entry']
    },
    details: {
      bedrooms: 1,
      bathrooms: 1,
      size: 65,
      sizeUnit: 'sqm',
      isFurnished: true,
      amenities: ['wifi', 'parking', 'gym', 'pool', 'security', 'water']
    },
    pricing: {
      rent: 80000,
      deposit: 80000,
      currency: 'KES',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-3-1', listingId: 'list-3', url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 },
        { id: 'img-3-2', listingId: 'list-3', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 }
      ],
      videoUrl: '',
      virtualTourUrl: ''
    },
    author: {
      id: 'agent-1',
      name: 'Victoria Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'Agent',
      phone: '+254 712 345 678',
      email: 'victoria@nestlist.luxury',
      isVerified: true
    },
    isFeatured: false,
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    views: 302,
    inquiriesCount: 15,
    savesCount: 88
  },
  {
    id: 'list-4',
    title: 'The Karen Green Sanctuary Estate',
    description: 'Immersed in mature woodland and quiet streams, this bespoke 4-bedroom countryside house offers colonial warmth integrated with modern smart utilities. Featuring high solid cedar beams, a large stone hearth, solar backup grid, reliable pure borehole water supply, detached staff quarters for two, and pristine nature walk access paths.',
    propertyType: 'House',
    roleType: 'Caretaker',
    location: {
      address: '38 Marula Lane, Karen, Nairobi',
      coordinates: { lat: -1.3262, lng: 36.7214 },
      neighborhood: 'Karen Woods',
      tags: ['Country Feel', 'Borehole Water', 'Solar Hybrid']
    },
    details: {
      bedrooms: 4,
      bathrooms: 4,
      size: 4700,
      sizeUnit: 'sqft',
      isFurnished: false,
      amenities: ['parking', 'security', 'water', 'electricity_backup']
    },
    pricing: {
      rent: 2800,
      deposit: 5600,
      currency: 'USD',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-4-1', listingId: 'list-4', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 },
        { id: 'img-4-2', listingId: 'list-4', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 },
        { id: 'img-4-3', listingId: 'list-4', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800', isCover: false, order: 2 }
      ],
      videoUrl: '',
      virtualTourUrl: ''
    },
    author: {
      id: 'agent-3',
      name: 'James Kamau',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      role: 'Caretaker',
      phone: '+254 733 111 222',
      email: 'james.kamau@nestlist.luxury',
      isVerified: false
    },
    isFeatured: false,
    status: 'active',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (Not listed as new)
    views: 120,
    inquiriesCount: 3,
    savesCount: 19
  },
  {
    id: 'list-5',
    title: 'Whispering Palms Beachfront Villa',
    description: 'Experience pure paradise in this stunning 6-bedroom beachfront villa with breathtaking views of the Indian Ocean. Designed to merge indoor comfort with ocean breezes, this luxury property boast of direct private beach access, a magnificent infinity pool cascading towards the sea, dynamic smart control systems, and round-the-clock chef options.',
    propertyType: 'Villa',
    roleType: 'Agent',
    location: {
      address: 'Diani Beach Road, Mombasa, Kenya',
      coordinates: { lat: -4.2819, lng: 39.5932 },
      neighborhood: 'Diani Luxury Coast',
      tags: ['Beachfront', 'Infinity Pool', 'Private Haven']
    },
    details: {
      bedrooms: 6,
      bathrooms: 7,
      size: 7200,
      sizeUnit: 'sqft',
      isFurnished: true,
      amenities: ['wifi', 'parking', 'gym', 'pool', 'security', 'water', 'electricity_backup']
    },
    pricing: {
      rent: 6500,
      deposit: 13000,
      currency: 'USD',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-5-1', listingId: 'list-5', url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 },
        { id: 'img-5-2', listingId: 'list-5', url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&q=80&w=800', isCover: false, order: 1 }
      ],
      videoUrl: '',
      virtualTourUrl: ''
    },
    author: {
      id: 'agent-1',
      name: 'Victoria Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      role: 'Agent',
      phone: '+254 712 345 678',
      email: 'victoria@nestlist.luxury',
      isVerified: true
    },
    isFeatured: true,
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    views: 890,
    inquiriesCount: 65,
    savesCount: 412
  },
  {
    id: 'list-6',
    title: 'Ngong Road Compact Modern Bedsitter',
    description: 'A cozy yet highly functional micro-apartment designed with modular Murphy bed framing, full kitchenette amenities, hot shower, individual water meters, secure neighborhood watch, and excellent transit linkage right on the Ngong Road artery.',
    propertyType: 'Bedsitter',
    roleType: 'Landlord',
    location: {
      address: 'Ngong Road, Woodley Sector, Nairobi',
      coordinates: { lat: -1.3015, lng: 36.7725 },
      neighborhood: 'Ngong Road Corridor',
      tags: ['Budget Friendly', 'Transit Access', 'Instant Hot Water']
    },
    details: {
      bedrooms: 1,
      bathrooms: 1,
      size: 32,
      sizeUnit: 'sqm',
      isFurnished: false,
      amenities: ['wifi', 'parking', 'security', 'water']
    },
    pricing: {
      rent: 22000,
      deposit: 22000,
      currency: 'KES',
      frequency: 'monthly'
    },
    media: {
      images: [
        { id: 'img-6-1', listingId: 'list-6', url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=1200', isCover: true, order: 0 }
      ],
      videoUrl: '',
      virtualTourUrl: ''
    },
    author: {
      id: 'agent-4',
      name: 'Peter Korir',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      role: 'Landlord',
      phone: '+254 755 432 109',
      email: 'korir@nestlist.luxury',
      isVerified: false
    },
    isFeatured: false,
    status: 'active',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    views: 82,
    inquiriesCount: 4,
    savesCount: 16
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-1',
    listingId: 'list-1',
    listingTitle: 'The Runda Crest Majestic Villa',
    listingImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=400',
    senderName: 'Dr. Arthur Pendelton',
    senderEmail: 'arthur.p@unep.org',
    senderPhone: '+254 788 888 111',
    message: 'Greetings Victoria, I am an incoming diplomatic delegate arriving in Nairobi this July. I am highly interested in leasing the Runda Enclave villa for a 2-year duration. Is the garden security compliant with standard embassy clearance protocols?',
    isReplied: true,
    replyText: 'Hello Dr Arthur, yes! The villa was previously occupied by embassy staffers and has dual-gate security check, alarm response systems, and diplomatic-grade compliance reports already on file. Let me know when you arrive so we can schedule a tour.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inq-2',
    listingId: 'list-2',
    listingTitle: 'Kilimani Skyview Premium Duplex',
    listingImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400',
    senderName: 'Sarah Jenkins',
    senderEmail: 'sjenkins@techstars.co',
    senderPhone: '+254 799 123 456',
    message: 'Hello David, is the rent of KES 145,000 slightly negotiable if we pay 6 months in advance? Also, does the backup generator support high-power appliances like induction ovens and washers directly during outages?',
    isReplied: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_VIEWINGS: ViewingRequest[] = [
  {
    id: 'view-1',
    listingId: 'list-1',
    listingTitle: 'The Runda Crest Majestic Villa',
    listingImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=400',
    agentName: 'Victoria Vance',
    dateTime: '2026-06-05T10:00:00.000Z',
    status: 'confirmed',
    notes: 'Access details arranged with main security gate. Landlord present.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'view-2',
    listingId: 'list-3',
    listingTitle: 'Minimalist Westlands Horizon Studio',
    listingImage: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=400',
    agentName: 'Victoria Vance',
    dateTime: '2026-06-08T14:30:00.000Z',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    listingId: 'list-1',
    authorName: 'Marques Brownlee',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    rating: 5,
    comment: 'Absolutely superb design layout. The virtual tour was 100% accurate, and the level of service coordinated by Victoria made moving into our retreat seamless.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-2',
    listingId: 'list-2',
    authorName: 'Aminata Diop',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    rating: 4,
    comment: 'Terrific duplex apartment! The sunset views from Kilimani are extraordinary. Power backups work instantly. Docking one star because traffic on Chania Road can get noisy during evening rush hours.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    userId: 'current-user-id',
    type: 'inquiry',
    title: 'New Client Inquiry',
    description: 'Dr. Arthur Pendelton left a detailed inquiry on "The Runda Crest Majestic Villa".',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'not-2',
    userId: 'current-user-id',
    type: 'viewing',
    title: 'Viewing Session Confirmed',
    description: 'Your scheduled tour for "The Runda Crest Majestic Villa" has been marked as confirmed.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'not-3',
    userId: 'current-user-id',
    type: 'payment',
    title: 'Invoice Settled Successfully',
    description: 'Boost listing payment received: Transaction ID TX-NEST-8491 ($49.00 USD).',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    userId: 'current-user-id',
    amount: 999,
    currency: 'KES',
    status: 'success',
    description: 'Pro Plan Monthly Subscription renewal',
    type: 'subscription',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-2',
    userId: 'current-user-id',
    amount: 2499,
    currency: 'KES',
    status: 'success',
    description: 'Upgrade to Business Tier (Unlimited Listings + Analytics)',
    type: 'subscription',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-3',
    userId: 'current-user-id',
    amount: 49,
    currency: 'USD',
    status: 'success',
    description: 'Enclave Villa Boost Feature Package (7 Days)',
    type: 'boost',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    listingId: 'list-6',
    listingTitle: 'Ngong Road Compact Modern Bedsitter',
    reporterName: 'George Mweti',
    reporterEmail: 'g.mweti@comms.co.ke',
    reason: 'Duplicate Listing',
    details: 'This bedsitter is listed three separate times by different agents using different phone numbers.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

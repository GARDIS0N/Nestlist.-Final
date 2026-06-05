import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
// Prioritize service role key since our backend server represents a secure environment
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false
  }
}) : null;

let useLocalFallback = true; // Default to local fallback until verified

if (isConfigured && supabase) {
  console.log("⚡ Checking Supabase SQL schema health on:", SUPABASE_URL);
  (async () => {
    try {
      const { error } = await supabase.from("users").select("id").limit(1);
      if (error) {
        console.warn("ℹ️ Supabase tables are inactive or missing. NestList fallback local engine enabled.", error.message);
        useLocalFallback = true;
      } else {
        console.log("⚡ Supabase SQL schema healthy! Connected directly to Cloud PostgreSQL.");
        useLocalFallback = false;
      }
    } catch (err) {
      console.warn("ℹ️ Supabase connection check failed. Fallback local engine enabled.", err);
      useLocalFallback = true;
    }
  })();
} else {
  console.log("ℹ️ Supabase environment variables not set. NestList fallback local engine enabled.");
  useLocalFallback = true;
}

export function isSupabaseActive(): boolean {
  return isConfigured && supabase !== null && !useLocalFallback;
}

// ============================================
// DATA STRUCTURE TRANSFORMERS (SNAKE <-> CAMEL)
// ============================================

// --- 1. USERS ---
export function mapUserFromDB(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    role: row.role,
    phone: row.phone || "",
    isVerified: row.is_verified,
    favorites: Array.isArray(row.favorites) ? row.favorites : [],
    createdAt: row.created_at
  };
}

export function mapUserToDB(user: any): any {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    password_hash: user.passwordHash,
    role: user.role,
    phone: user.phone || "",
    is_verified: user.isVerified !== undefined ? user.isVerified : true,
    favorites: Array.isArray(user.favorites) ? JSON.stringify(user.favorites) : "[]",
    created_at: user.createdAt || new Date().toISOString()
  };
}

// --- 2. LISTINGS ---
export function mapListingFromDB(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    propertyType: row.property_type,
    roleType: row.role_type,
    location: typeof row.location === "string" ? JSON.parse(row.location) : row.location,
    details: typeof row.details === "string" ? JSON.parse(row.details) : row.details,
    pricing: typeof row.pricing === "string" ? JSON.parse(row.pricing) : row.pricing,
    media: typeof row.media === "string" ? JSON.parse(row.media) : row.media,
    author: typeof row.author === "string" ? JSON.parse(row.author) : row.author,
    isFeatured: row.is_featured,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at || null,
    views: row.views || 0,
    inquiriesCount: row.inquiries_count || 0,
    savesCount: row.saves_count || 0
  };
}

export function mapListingToDB(listing: any): any {
  if (!listing) return null;
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description || "",
    property_type: listing.propertyType,
    role_type: listing.roleType,
    location: listing.location || {},
    details: listing.details || {},
    pricing: listing.pricing || {},
    media: listing.media || {},
    author: listing.author || {},
    is_featured: listing.isFeatured || false,
    status: listing.status || "draft",
    created_at: listing.createdAt || new Date().toISOString(),
    expires_at: listing.expiresAt || null,
    views: listing.views || 0,
    inquiries_count: listing.inquiriesCount || 0,
    saves_count: listing.savesCount || 0
  };
}

// --- 3. PAYMENTS ---
export function mapPaymentFromDB(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    amount: Number(row.amount),
    currency: row.currency || "KES",
    provider: row.provider || "mpesa",
    status: row.status || "pending",
    phoneNumber: row.phone_number || "",
    checkoutRequestID: row.checkout_request_id || null,
    mpesaReceiptNumber: row.mpesa_receipt_number || null,
    transactionId: row.transaction_id || null,
    paymentTimestamp: row.payment_timestamp || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapPaymentToDB(pay: any): any {
  if (!pay) return null;
  return {
    id: pay.id,
    listing_id: pay.listingId,
    amount: pay.amount,
    currency: pay.currency || "KES",
    provider: pay.provider || "mpesa",
    status: pay.status || "pending",
    phone_number: pay.phoneNumber || "",
    checkout_request_id: pay.checkoutRequestID || null,
    mpesa_receipt_number: pay.mpesaReceiptNumber || null,
    transaction_id: pay.transactionId || null,
    payment_timestamp: pay.paymentTimestamp || null,
    created_at: pay.createdAt || new Date().toISOString(),
    updated_at: pay.updatedAt || new Date().toISOString()
  };
}

// --- 4. INQUIRIES ---
export function mapInquiryFromDB(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    listingId: row.listing_id,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    tenantEmail: row.tenant_email,
    tenantPhone: row.tenant_phone || "",
    message: row.message,
    createdAt: row.created_at
  };
}

export function mapInquiryToDB(inq: any): any {
  if (!inq) return null;
  return {
    id: inq.id,
    listing_id: inq.listingId,
    tenant_id: inq.tenantId,
    tenant_name: inq.tenantName,
    tenant_email: inq.tenantEmail,
    tenant_phone: inq.tenantPhone || "",
    message: inq.message,
    created_at: inq.createdAt || new Date().toISOString()
  };
}

// --- 5. NOTIFICATIONS ---
export function mapNotificationFromDB(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at
  };
}

export function mapNotificationToDB(not: any): any {
  if (!not) return null;
  return {
    id: not.id,
    user_id: not.userId,
    title: not.title,
    message: not.message,
    is_read: not.isRead || false,
    created_at: not.createdAt || new Date().toISOString()
  };
}

// ============================================
// SUPABASE OPERATIONS INTERFACE
// ============================================

export const dbService = {
  // --- USERS ---
  async getUsers(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Supabase user fetch failed:", error);
      return [];
    }
    return (data || []).map(mapUserFromDB);
  },

  async createUser(user: any): Promise<boolean> {
    if (!supabase) return false;
    const dbRow = mapUserToDB(user);
    const { error } = await supabase.from("users").insert(dbRow);
    if (error) {
      console.error("Supabase create user error:", error);
      return false;
    }
    return true;
  },

  async updateUserFavorites(userId: string, favorites: string[]): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from("users")
      .update({ favorites: JSON.stringify(favorites) })
      .eq("id", userId);
    if (error) {
      console.error("Supabase update favorites error:", error);
      return false;
    }
    return true;
  },

  // --- LISTINGS ---
  async getListings(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase listings fetch failed:", error);
      return [];
    }
    return (data || []).map(mapListingFromDB);
  },

  async createListing(listing: any): Promise<boolean> {
    if (!supabase) return false;
    const dbRow = mapListingToDB(listing);
    const { error } = await supabase.from("listings").insert(dbRow);
    if (error) {
      console.error("Supabase create listing error:", error);
      return false;
    }
    return true;
  },

  async updateListing(id: string, listingUpdate: any): Promise<boolean> {
    if (!supabase) return false;
    // Map whatever update keys are passed
    const updates: any = {};
    if (listingUpdate.title !== undefined) updates.title = listingUpdate.title;
    if (listingUpdate.description !== undefined) updates.description = listingUpdate.description;
    if (listingUpdate.propertyType !== undefined) updates.property_type = listingUpdate.propertyType;
    if (listingUpdate.roleType !== undefined) updates.role_type = listingUpdate.roleType;
    if (listingUpdate.status !== undefined) updates.status = listingUpdate.status;
    if (listingUpdate.expiresAt !== undefined) updates.expires_at = listingUpdate.expiresAt;
    if (listingUpdate.location !== undefined) updates.location = listingUpdate.location;
    if (listingUpdate.details !== undefined) updates.details = listingUpdate.details;
    if (listingUpdate.pricing !== undefined) updates.pricing = listingUpdate.pricing;
    if (listingUpdate.media !== undefined) updates.media = listingUpdate.media;
    if (listingUpdate.author !== undefined) updates.author = listingUpdate.author;
    if (listingUpdate.isFeatured !== undefined) updates.is_featured = listingUpdate.isFeatured;
    if (listingUpdate.views !== undefined) updates.views = listingUpdate.views;
    if (listingUpdate.inquiriesCount !== undefined) updates.inquiries_count = listingUpdate.inquiriesCount;
    if (listingUpdate.savesCount !== undefined) updates.saves_count = listingUpdate.savesCount;

    const { error } = await supabase.from("listings").update(updates).eq("id", id);
    if (error) {
      console.error("Supabase update listing error:", error);
      return false;
    }
    return true;
  },

  async deleteListing(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete listing error:", error);
      return false;
    }
    return true;
  },

  async incrementListingViews(id: string): Promise<number> {
    if (!supabase) return 0;
    // Perform inline update
    const { data, error } = await supabase.rpc("increment_listing_views", { target_id: id });
    if (error) {
      // Fallback manual read-then-write logic
      const { data: listings } = await supabase.from("listings").select("views").eq("id", id).single();
      const nextViews = ((listings?.views || 0) + 1);
      await supabase.from("listings").update({ views: nextViews }).eq("id", id);
      return nextViews;
    }
    return data || 0;
  },

  async updateListingSaves(id: string, savesCount: number): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase.from("listings").update({ saves_count: savesCount }).eq("id", id);
    return !error;
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("payments").select("*");
    if (error) {
      console.error("Supabase payments fetch failed:", error);
      return [];
    }
    return (data || []).map(mapPaymentFromDB);
  },

  async createPayment(pay: any): Promise<boolean> {
    if (!supabase) return false;
    const dbRow = mapPaymentToDB(pay);
    const { error } = await supabase.from("payments").insert(dbRow);
    if (error) {
      console.error("Supabase create payment error:", error);
      return false;
    }
    return true;
  },

  async updatePayment(id: string, updates: any): Promise<boolean> {
    if (!supabase) return false;
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.checkoutRequestID !== undefined) dbUpdates.checkout_request_id = updates.checkoutRequestID;
    if (updates.mpesaReceiptNumber !== undefined) dbUpdates.mpesa_receipt_number = updates.mpesaReceiptNumber;
    if (updates.transactionId !== undefined) dbUpdates.transaction_id = updates.transactionId;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.paymentTimestamp !== undefined) dbUpdates.payment_timestamp = updates.paymentTimestamp;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from("payments").update(dbUpdates).eq("id", id);
    if (error) {
      console.error("Supabase update payment error:", error);
      return false;
    }
    return true;
  },

  // --- INQUIRIES ---
  async getInquiries(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("inquiries").select("*");
    if (error) {
      console.error("Supabase inquiries fetch failed:", error);
      return [];
    }
    return (data || []).map(mapInquiryFromDB);
  },

  async createInquiry(inq: any): Promise<boolean> {
    if (!supabase) return false;
    const dbRow = mapInquiryToDB(inq);
    const { error } = await supabase.from("inquiries").insert(dbRow);
    if (error) {
      console.error("Supabase create inquiry error:", error);
      return false;
    }
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase notifications fetch failed:", error);
      return [];
    }
    return (data || []).map(mapNotificationFromDB);
  },

  async createNotification(not: any): Promise<boolean> {
    if (!supabase) return false;
    const dbRow = mapNotificationToDB(not);
    const { error } = await supabase.from("notifications").insert(dbRow);
    if (error) {
      console.error("Supabase create notification error:", error);
      return false;
    }
    return true;
  },

  async markNotificationsAsRead(userId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);
    if (error) {
      console.error("Supabase mark notifications as read error:", error);
      return false;
    }
    return true;
  }
};

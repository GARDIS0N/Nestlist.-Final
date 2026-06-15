import { isFirebaseActive, firebaseDbService } from "./firebase-service.js";
import { isSupabaseActive as isSupaActive, dbService as supaDbService } from "./supabase-service.js";

// Export isSupabaseActive as a unified function returning true if any cloud provider (Firebase or Supabase) is loaded.
export function isSupabaseActive(): boolean {
  return isFirebaseActive() || isSupaActive();
}

// Map the operations through our cloud router. Firebase has absolute priority.
export const dbService = {
  // --- USERS ---
  async getUsers(activeUser?: any): Promise<any[]> {
    if (isFirebaseActive()) {
      return firebaseDbService.getUsers(activeUser);
    }
    return supaDbService.getUsers();
  },

  async createUser(user: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.createUser(user, activeUser);
    }
    return supaDbService.createUser(user);
  },

  async updateUser(userId: string, updates: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.updateUser(userId, updates, activeUser);
    }
    return supaDbService.updateUser(userId, updates);
  },

  async updateUserFavorites(userId: string, favorites: string[], activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.updateUserFavorites(userId, favorites, activeUser);
    }
    return supaDbService.updateUserFavorites(userId, favorites);
  },

  // --- LISTINGS ---
  async getListings(activeUser?: any): Promise<any[]> {
    if (isFirebaseActive()) {
      return firebaseDbService.getListings(activeUser);
    }
    return supaDbService.getListings();
  },

  async createListing(listing: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.createListing(listing, activeUser);
    }
    return supaDbService.createListing(listing);
  },

  async updateListing(id: string, listingUpdate: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.updateListing(id, listingUpdate, activeUser);
    }
    return supaDbService.updateListing(id, listingUpdate);
  },

  async deleteListing(id: string, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.deleteListing(id, activeUser);
    }
    return supaDbService.deleteListing(id);
  },

  async incrementListingViews(id: string, activeUser?: any): Promise<number> {
    if (isFirebaseActive()) {
      return firebaseDbService.incrementListingViews(id, activeUser);
    }
    return supaDbService.incrementListingViews(id);
  },

  async updateListingSaves(id: string, savesCount: number, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.updateListingSaves(id, savesCount, activeUser);
    }
    return supaDbService.updateListingSaves(id, savesCount);
  },

  // --- PAYMENTS ---
  async getPayments(activeUser?: any): Promise<any[]> {
    if (isFirebaseActive()) {
      return firebaseDbService.getPayments(activeUser);
    }
    return supaDbService.getPayments();
  },

  async createPayment(pay: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.createPayment(pay, activeUser);
    }
    return supaDbService.createPayment(pay);
  },

  async updatePayment(id: string, updates: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.updatePayment(id, updates, activeUser);
    }
    return supaDbService.updatePayment(id, updates);
  },

  // --- INQUIRIES ---
  async getInquiries(activeUser?: any): Promise<any[]> {
    if (isFirebaseActive()) {
      return firebaseDbService.getInquiries(activeUser);
    }
    return supaDbService.getInquiries();
  },

  async createInquiry(inq: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.createInquiry(inq, activeUser);
    }
    return supaDbService.createInquiry(inq);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(activeUser?: any): Promise<any[]> {
    if (isFirebaseActive()) {
      return firebaseDbService.getNotifications(activeUser);
    }
    return supaDbService.getNotifications();
  },

  async createNotification(not: any, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.createNotification(not, activeUser);
    }
    return supaDbService.createNotification(not);
  },

  async markNotificationsAsRead(userId: string, activeUser?: any): Promise<boolean> {
    if (isFirebaseActive()) {
      return firebaseDbService.markNotificationsAsRead(userId, activeUser);
    }
    return supaDbService.markNotificationsAsRead(userId);
  }
};

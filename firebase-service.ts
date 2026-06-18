import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

let isConfigured = false;
let db: Firestore | null = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    const firebaseConfig = JSON.parse(raw);
    if (firebaseConfig && firebaseConfig.projectId) {
      if (getApps().length === 0) {
        initializeApp({
          projectId: firebaseConfig.projectId
        });
      }
      
      if (firebaseConfig.firestoreDatabaseId) {
        try {
          db = getFirestore(getApps()[0]!, firebaseConfig.firestoreDatabaseId);
        } catch (e) {
          db = getFirestore(getApps()[0]!);
        }
      } else {
        db = getFirestore(getApps()[0]!);
      }
      
      isConfigured = true;
      console.log("⚡ Firebase Admin SDK initialized successfully with Database ID:", firebaseConfig.firestoreDatabaseId);
    }
  }
} catch (err) {
  console.warn("⚠️ Failed to initialize Firebase Admin SDK:", err);
}

export function isFirebaseActive(): boolean {
  return isConfigured && db !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING (SKILL REQUIREMENT)
// ─────────────────────────────────────────────────────────────────────────────

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null,
  activeUser?: { id?: string; email?: string }
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: activeUser?.id || null,
      email: activeUser?.email || null,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error("Firestore Admin Exception Catch:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE OPERATIONS IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export const firebaseDbService = {
  // --- USERS ---
  async getUsers(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive() || !db) return [];
    const pathName = "users";
    try {
      const snapshot = await db.collection(pathName).get();
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createUser(user: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `users/${user.id}`;
    try {
      const payload = {
        id: user.id || "",
        email: (user.email || "").toLowerCase().trim(),
        name: user.name || "",
        role: user.role || "Tenant",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        bio: user.bio || "",
        isVerified: user.isVerified !== undefined ? user.isVerified : true,
        favorites: Array.isArray(user.favorites) ? user.favorites : [],
        createdAt: user.createdAt || new Date().toISOString()
      };
      await db.collection("users").doc(user.id).set(payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updateUser(userId: string, updates: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `users/${userId}`;
    try {
      const mapped: any = {};
      if (updates.name !== undefined) mapped.name = updates.name;
      if (updates.phone !== undefined) mapped.phone = updates.phone;
      if (updates.avatarUrl !== undefined) mapped.avatarUrl = updates.avatarUrl;
      if (updates.bio !== undefined) mapped.bio = updates.bio;
      if (updates.isVerified !== undefined) mapped.isVerified = updates.isVerified;
      if (updates.favorites !== undefined) {
        mapped.favorites = Array.isArray(updates.favorites) ? updates.favorites : [];
      }

      await db.collection("users").doc(userId).update(mapped);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async updateUserFavorites(userId: string, favorites: string[], activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `users/${userId}`;
    try {
      await db.collection("users").doc(userId).update({
        favorites: Array.isArray(favorites) ? favorites : []
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- LISTINGS ---
  async getListings(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive() || !db) return [];
    const pathName = "listings";
    try {
      const snapshot = await db.collection(pathName).orderBy("createdAt", "desc").get();
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createListing(listing: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `listings/${listing.id}`;
    try {
      const payload = {
        id: listing.id,
        title: listing.title || "",
        description: listing.description || "",
        propertyType: listing.propertyType || "",
        roleType: listing.roleType || "",
        location: listing.location || {},
        details: listing.details || {},
        pricing: listing.pricing || {},
        media: listing.media || {},
        author: listing.author || {},
        isFeatured: listing.isFeatured || false,
        status: listing.status || "draft",
        createdAt: listing.createdAt || new Date().toISOString(),
        expiresAt: listing.expiresAt || null,
        views: listing.views || 0,
        inquiriesCount: listing.inquiriesCount || 0,
        savesCount: listing.savesCount || 0
      };
      await db.collection("listings").doc(listing.id).set(payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updateListing(id: string, listingUpdate: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `listings/${id}`;
    try {
      const updates: any = {};
      if (listingUpdate.title !== undefined) updates.title = listingUpdate.title;
      if (listingUpdate.description !== undefined) updates.description = listingUpdate.description;
      if (listingUpdate.propertyType !== undefined) updates.propertyType = listingUpdate.propertyType;
      if (listingUpdate.roleType !== undefined) updates.roleType = listingUpdate.roleType;
      if (listingUpdate.status !== undefined) updates.status = listingUpdate.status;
      if (listingUpdate.expiresAt !== undefined) updates.expiresAt = listingUpdate.expiresAt;
      if (listingUpdate.location !== undefined) updates.location = listingUpdate.location;
      if (listingUpdate.details !== undefined) updates.details = listingUpdate.details;
      if (listingUpdate.pricing !== undefined) updates.pricing = listingUpdate.pricing;
      if (listingUpdate.media !== undefined) updates.media = listingUpdate.media;
      if (listingUpdate.author !== undefined) updates.author = listingUpdate.author;
      if (listingUpdate.isFeatured !== undefined) updates.isFeatured = listingUpdate.isFeatured;
      if (listingUpdate.views !== undefined) updates.views = listingUpdate.views;
      if (listingUpdate.inquiriesCount !== undefined) updates.inquiriesCount = listingUpdate.inquiriesCount;
      if (listingUpdate.savesCount !== undefined) updates.savesCount = listingUpdate.savesCount;

      await db.collection("listings").doc(id).update(updates);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async deleteListing(id: string, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `listings/${id}`;
    try {
      await db.collection("listings").doc(id).delete();
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, pathName, activeUser);
    }
  },

  async incrementListingViews(id: string, activeUser?: any): Promise<number> {
    if (!isFirebaseActive() || !db) return 0;
    const pathName = `listings/${id}`;
    try {
      await db.collection("listings").doc(id).update({
        views: FieldValue.increment(1)
      });
      // Retrieve the updated count
      const docSnap = await db.collection("listings").doc(id).get();
      return docSnap.data()?.views || 1;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async updateListingSaves(id: string, savesCount: number, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `listings/${id}`;
    try {
      await db.collection("listings").doc(id).update({ savesCount: savesCount });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- PAYMENTS ---
  async getPayments(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive() || !db) return [];
    const pathName = "payments";
    try {
      const snapshot = await db.collection(pathName).get();
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createPayment(pay: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `payments/${pay.id}`;
    try {
      const payload = {
        id: pay.id,
        listingId: pay.listingId,
        amount: pay.amount,
        currency: pay.currency || "KES",
        provider: pay.provider || "mpesa",
        status: pay.status || "pending",
        phoneNumber: pay.phoneNumber || "",
        checkoutRequestID: pay.checkoutRequestID || null,
        mpesaReceiptNumber: pay.mpesaReceiptNumber || null,
        transactionId: pay.transactionId || null,
        paymentTimestamp: pay.paymentTimestamp || null,
        createdAt: pay.createdAt || new Date().toISOString(),
        updatedAt: pay.updatedAt || new Date().toISOString()
      };
      await db.collection("payments").doc(pay.id).set(payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updatePayment(id: string, updates: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `payments/${id}`;
    try {
      const dbUpdates: any = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.checkoutRequestID !== undefined) dbUpdates.checkoutRequestID = updates.checkoutRequestID;
      if (updates.mpesaReceiptNumber !== undefined) dbUpdates.mpesaReceiptNumber = updates.mpesaReceiptNumber;
      if (updates.transactionId !== undefined) dbUpdates.transactionId = updates.transactionId;
      if (updates.phoneNumber !== undefined) dbUpdates.phoneNumber = updates.phoneNumber;
      if (updates.paymentTimestamp !== undefined) dbUpdates.paymentTimestamp = updates.paymentTimestamp;
      dbUpdates.updatedAt = new Date().toISOString();

      await db.collection("payments").doc(id).update(dbUpdates);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- INQUIRIES ---
  async getInquiries(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive() || !db) return [];
    const pathName = "inquiries";
    try {
      const snapshot = await db.collection(pathName).get();
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createInquiry(inq: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `inquiries/${inq.id}`;
    try {
      const payload = {
        id: inq.id,
        listingId: inq.listingId,
        tenantId: inq.tenantId,
        tenantName: inq.tenantName || "",
        tenantEmail: inq.tenantEmail || "",
        tenantPhone: inq.tenantPhone || "",
        message: inq.message || "",
        createdAt: inq.createdAt || new Date().toISOString()
      };
      await db.collection("inquiries").doc(inq.id).set(payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive() || !db) return [];
    const pathName = "notifications";
    try {
      const snapshot = await db.collection(pathName).orderBy("createdAt", "desc").get();
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createNotification(not: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = `notifications/${not.id}`;
    try {
      const payload = {
        id: not.id,
        userId: not.userId,
        title: not.title || "",
        message: not.message || "",
        isRead: not.isRead || false,
        createdAt: not.createdAt || new Date().toISOString()
      };
      await db.collection("notifications").doc(not.id).set(payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async markNotificationsAsRead(userId: string, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive() || !db) return false;
    const pathName = "notifications";
    try {
      const querySnapshot = await db.collection(pathName)
        .where("userId", "==", userId)
        .where("isRead", "==", false)
        .get();
      
      const batch = db.batch();
      querySnapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, { isRead: true });
      });
      
      await batch.commit();
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  }
};

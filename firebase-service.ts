import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocFromServer,
  increment
} from "firebase/firestore";
import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

// Load config dynamically from root JSON configuration file to be ESM safe
let isConfigured = false;
let firebaseConfig: any = null;
let app: any = null;
let db: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    firebaseConfig = JSON.parse(raw);
    if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
      isConfigured = true;
    }
  }
} catch (err) {
  console.warn("⚠️ Failed to parse firebase-applet-config.json:", err);
}

if (isConfigured && firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    // Explicitly pass databaseId to prevent breaking changes on multi-database setups
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("⚡ Firebase client initialized with Firestore Database ID:", firebaseConfig.firestoreDatabaseId);

    // Validate connection to Firestore on initialization
    (async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        console.log("⚡ Firebase connected successfully!");
      } catch (error) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.error("Please check your Firebase configuration of the server.");
        } else {
          console.log("⚡ Connection validation skipped (unseeded 'test/connection' is normal during provisioning).");
        }
      }
    })();
  } catch (err) {
    console.warn("⚠️ Failed to initialize Firebase:", err);
    isConfigured = false;
  }
} else {
  console.warn("ℹ️ Firebase configuration parameters not set. Skipping engine activation.");
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
  console.error("Firestore Exception Catch:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ─────────────────────────────────────────────────────────────────────────────
// FIRESTORE OPERATIONS IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

export const firebaseDbService = {
  // --- USERS ---
  async getUsers(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive()) return [];
    const pathName = "users";
    try {
      const q = query(collection(db, pathName));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createUser(user: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
    const pathName = `users/${user.id}`;
    try {
      // Store clean, direct fields. Arrays stay arrays. No JSON parsing needed.
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
      await setDoc(doc(db, "users", user.id), payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updateUser(userId: string, updates: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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

      await updateDoc(doc(db, "users", userId), mapped);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async updateUserFavorites(userId: string, favorites: string[], activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
    const pathName = `users/${userId}`;
    try {
      await updateDoc(doc(db, "users", userId), {
        favorites: Array.isArray(favorites) ? favorites : []
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- LISTINGS ---
  async getListings(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive()) return [];
    const pathName = "listings";
    try {
      const q = query(collection(db, pathName), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createListing(listing: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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
      await setDoc(doc(db, "listings", listing.id), payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updateListing(id: string, listingUpdate: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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

      await updateDoc(doc(db, "listings", id), updates);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async deleteListing(id: string, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
    const pathName = `listings/${id}`;
    try {
      await deleteDoc(doc(db, "listings", id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, pathName, activeUser);
    }
  },

  async incrementListingViews(id: string, activeUser?: any): Promise<number> {
    if (!isFirebaseActive()) return 0;
    const pathName = `listings/${id}`;
    try {
      await updateDoc(doc(db, "listings", id), {
        views: increment(1)
      });
      // Retrieve the updated count
      const docSnap = await getDoc(doc(db, "listings", id));
      return docSnap.data()?.views || 1;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  async updateListingSaves(id: string, savesCount: number, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
    const pathName = `listings/${id}`;
    try {
      await updateDoc(doc(db, "listings", id), { savesCount: savesCount });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- PAYMENTS ---
  async getPayments(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive()) return [];
    const pathName = "payments";
    try {
      const q = query(collection(db, pathName));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createPayment(pay: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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
      await setDoc(doc(db, "payments", pay.id), payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async updatePayment(id: string, updates: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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

      await updateDoc(doc(db, "payments", id), dbUpdates);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  },

  // --- INQUIRIES ---
  async getInquiries(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive()) return [];
    const pathName = "inquiries";
    try {
      const q = query(collection(db, pathName));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createInquiry(inq: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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
      await setDoc(doc(db, "inquiries", inq.id), payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(activeUser?: any): Promise<any[]> {
    if (!isFirebaseActive()) return [];
    const pathName = "notifications";
    try {
      const q = query(collection(db, pathName), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, pathName, activeUser);
    }
  },

  async createNotification(not: any, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
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
      await setDoc(doc(db, "notifications", not.id), payload);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, pathName, activeUser);
    }
  },

  async markNotificationsAsRead(userId: string, activeUser?: any): Promise<boolean> {
    if (!isFirebaseActive()) return false;
    const pathName = "notifications";
    try {
      // Fetch user's unread notifications and update them sequentially (client SDK ESM clean update batch style)
      const q = query(
        collection(db, pathName), 
        where("userId", "==", userId), 
        where("isRead", "==", false)
      );
      const querySnapshot = await getDocs(q);
      
      const promises: Promise<void>[] = [];
      querySnapshot.forEach((docSnap) => {
        promises.push(updateDoc(doc(db, "notifications", docSnap.id), { isRead: true }));
      });
      
      await Promise.all(promises);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, pathName, activeUser);
    }
  }
};

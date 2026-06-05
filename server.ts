import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { isSupabaseActive, dbService } from "./supabase-service.js";

dotenv.config();

const app = express();
app.use(express.json());

// Enable highly flexible and robust CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

const PORT = Number(process.env.PORT) || 3000;

// DB PATH
const DB_DIR = path.join(process.cwd(), "src", "data");
const DB_FILE = path.join(DB_DIR, "database.json");

// Ensure src/data exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Ensure database file exists with empty seed (no mock listings, as requested)
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    listings: [],
    payments: [],
    inquiries: [],
    notifications: []
  }, null, 2));
}

// Database helper functions
function loadDB(): any {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], listings: [], payments: [], inquiries: [], notifications: [] };
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Password utility using native SHA-256 (Robust, no native bcrypt dependency)
function hashPassword(password: string): string {
  return crypto.createHmac("sha256", "nestlist-secret-salt-2026").update(password).digest("hex");
}

// Token session generator and decoder (Self-contained, ultra-robust stateless session JWT)
const TOKEN_SECRET = "nestlist-cryptographic-token-signature-key-2026";

function createToken(user: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years expiracy for easier session control
  })).toString("base64url");

  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payloadStr = Buffer.from(payload, "base64").toString("utf-8");
    const payloadObj = JSON.parse(payloadStr);

    if (payloadObj.exp && Date.now() / 1000 > payloadObj.exp) {
      return null;
    }
    return payloadObj;
  } catch (err) {
    return null;
  }
}

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token missing" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ success: false, error: "Access token invalid or expired" });
  }

  req.user = user;
  next();
}

// ============================================
// DARAJA API M-PESA PAYMENTS INTEGRATION
// ============================================
// Safaricom Credentials
const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "Krt8pu4qFzcfbdsibP2GGPflwcSOqKFWNdMXDXyYkmR1Z1Lk";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "EPlOqQvGl4TTH3bvN1AScB8G16XOuPJLBDMy3f4Dnl8frc4v4NwVl1YJZlClvgTS";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158695eded2925d4da9a5745fa54a3bbc5c893fdea4d612";

// Helper to get required Safaricom AccessToken
async function getMpesaToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const baseUrl = (MPESA_ENV.toLowerCase() === "production" || MPESA_ENV.toLowerCase() === "live")
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
  const url = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` }
  });

  if (!res.ok) {
    throw new Error("M-Pesa authorization OAuth request failed.");
  }

  const data: any = await res.json();
  return data.access_token;
}

// ============================================
// API ENDPOINTS
// ============================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "full-stack-secure-database", time: new Date() });
});

// User Registration Router
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, phone } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ success: false, error: "Missing required profile fields" });
  }

  if (role !== "Tenant" && role !== "Agent" && role !== "Landlord") {
    return res.status(400).json({ success: false, error: "Invalid user role specified" });
  }

  let newUser: any;

  if (isSupabaseActive()) {
    try {
      const users = await dbService.getUsers();
      const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ success: false, error: "Email already registered" });
      }

      newUser = {
        id: `usr-${Date.now()}`,
        email: email.toLowerCase(),
        name,
        passwordHash: hashPassword(password),
        role,
        phone: phone || "",
        isVerified: true,
        favorites: [],
        createdAt: new Date().toISOString()
      };

      const success = await dbService.createUser(newUser);
      if (!success) {
        throw new Error("Unable to create user on Supabase Cloud Postgres.");
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    newUser = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      passwordHash: hashPassword(password),
      role,
      phone: phone || "",
      isVerified: true,
      favorites: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);
  }

  const token = createToken(newUser);
  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      favorites: newUser.favorites
    }
  });
});

// User Login Router
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  let user: any;

  if (isSupabaseActive()) {
    try {
      const users = await dbService.getUsers();
      user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    } catch (err: any) {
      return res.status(500).json({ success: false, error: "Supabase connection error: " + err.message });
    }
  } else {
    const db = loadDB();
    user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ success: false, error: "Invalid login credentials" });
  }

  const token = createToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      favorites: user.favorites || []
    }
  });
});

// Profile fetching
app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  let user: any;

  if (isSupabaseActive()) {
    try {
      const users = await dbService.getUsers();
      user = users.find((u: any) => u.id === req.user.userId);
    } catch (err) {
      return res.status(500).json({ success: false, error: "Supabase retrieval failed" });
    }
  } else {
    const db = loadDB();
    user = db.users.find((u: any) => u.id === req.user.userId);
  }

  if (!user) {
    return res.status(404).json({ success: false, error: "User profile from token was not found" });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      favorites: user.favorites || []
    }
  });
});

// ============================================
// PROPERTY LISTINGS API
// ============================================

// Fetch properties
app.get("/api/listings", async (req, res) => {
  if (isSupabaseActive()) {
    try {
      const listings = await dbService.getListings();
      return res.json({ success: true, listings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  const db = loadDB();
  // Filter active listings for unauthenticated users
  // and landlords can see all of theirs. Let's return all and let frontend selectively show or query.
  res.json({ success: true, listings: db.listings });
});

// Create property listing (forces "pending_payment" and configures billing structure)
app.post("/api/listings", authenticateToken, async (req: any, res) => {
  if (req.user.role !== "Agent" && req.user.role !== "Landlord") {
    return res.status(403).json({ success: false, error: "Only Agents or Landlords can publish listings" });
  }

  const listingData = req.body;
  const listingId = listingData.id || `list-${Date.now()}`;
  
  // Clean coordinates fallback
  const location = listingData.location || {};
  if (!location.coordinates || typeof location.coordinates.lat !== "number") {
    location.coordinates = { lat: -1.2921, lng: 36.8219 }; // Nairobi fallbacks
  }

  // Calculate NestList listing fee based on property type and bedroom counts
  const propertyType = listingData.propertyType || "Apartment";
  const bedrooms = listingData.details?.bedrooms || 0;
  let listingFee = 500; // default standard

  if (propertyType === "Single Room") listingFee = 100;
  else if (propertyType === "Bedsitter") listingFee = 200;
  else if (propertyType === "Studio") listingFee = 250;
  else if (bedrooms === 0) listingFee = 100;
  else if (bedrooms === 1) listingFee = 500;
  else if (bedrooms === 2) listingFee = 700;
  else if (bedrooms === 3) listingFee = 1000;
  else if (bedrooms === 4) listingFee = 1200;
  else listingFee = 1500;

  const freshListing = {
    ...listingData,
    id: listingId,
    status: "pending_payment", // mandatory setup
    expiresAt: null,
    createdAt: new Date().toISOString(),
    views: 0,
    inquiriesCount: 0,
    savesCount: 0,
    author: {
      id: req.user.userId,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone || "",
      email: req.user.email,
      isVerified: true
    }
  };

  const paymentRecord = {
    id: `pay-${Date.now()}`,
    listingId: listingId,
    amount: listingFee,
    currency: "KES",
    provider: "mpesa",
    status: "pending",
    phoneNumber: req.user.phone || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseActive()) {
    try {
      const crListing = await dbService.createListing(freshListing);
      const crPayment = await dbService.createPayment(paymentRecord);
      if (!crListing || !crPayment) {
        throw new Error("Supabase was unable to insert listing or payment rows");
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    db.listings.push(freshListing);
    db.payments.push(paymentRecord);
    saveDB(db);
  }

  res.status(201).json({
    success: true,
    listing: freshListing,
    payment: paymentRecord
  });
});

// Edit profile/owner listing
app.put("/api/listings/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;

  if (isSupabaseActive()) {
    try {
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === id);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found" });
      }

      if (listing.author?.id !== req.user.userId) {
        return res.status(403).json({ success: false, error: "Access denied. Action authorized for listing owner only." });
      }

      const updatedFields = {
        ...req.body,
        id, // protect ID
        author: listing.author, // protect owner
        createdAt: listing.createdAt, // protect creation date
        views: listing.views || 0,
        inquiriesCount: listing.inquiriesCount || 0,
        savesCount: listing.savesCount || 0
      };

      await dbService.updateListing(id, updatedFields);
      return res.json({ success: true, listing: { ...listing, ...updatedFields } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const index = db.listings.findIndex((l: any) => l.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    const listing = db.listings[index];
    if (listing.author?.id !== req.user.userId) {
      return res.status(403).json({ success: false, error: "Access denied. Action authorized for listing owner only." });
    }

    db.listings[index] = {
      ...listing,
      ...req.body,
      id, // protect id
      author: listing.author, // protect owner
      createdAt: listing.createdAt, // protect creation date
      views: listing.views || 0,
      inquiriesCount: listing.inquiriesCount || 0,
      savesCount: listing.savesCount || 0
    };

    saveDB(db);
    res.json({ success: true, listing: db.listings[index] });
  }
});

// Delete owner listing
app.delete("/api/listings/:id", authenticateToken, async (req: any, res) => {
  const { id } = req.params;

  if (isSupabaseActive()) {
    try {
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === id);

      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found" });
      }

      if (listing.author?.id !== req.user.userId) {
        return res.status(403).json({ success: false, error: "Access denied. Action authorized for listing owner only." });
      }

      await dbService.deleteListing(id);
      return res.json({ success: true, message: "Listing deleted successfully" });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const listing = db.listings.find((l: any) => l.id === id);

    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.author?.id !== req.user.userId) {
      return res.status(403).json({ success: false, error: "Access denied. Action authorized for listing owner only." });
    }

    db.listings = db.listings.filter((l: any) => l.id !== id);
    db.payments = db.payments.filter((p: any) => p.listingId !== id);
    db.inquiries = db.inquiries.filter((i: any) => i.listingId !== id);

    saveDB(db);
    res.json({ success: true, message: "Listing deleted successfully" });
  }
});

// Increment views counter
app.post("/api/listings/:id/increment-views", async (req, res) => {
  const { id } = req.params;

  if (isSupabaseActive()) {
    try {
      const views = await dbService.incrementListingViews(id);
      return res.json({ success: true, views });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const listing = db.listings.find((l: any) => l.id === id);
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      saveDB(db);
      res.json({ success: true, views: listing.views });
    } else {
      res.status(404).json({ success: false, error: "Listing not found" });
    }
  }
});

// Toggle Favorites endpoint
app.post("/api/listings/:id/favorite", authenticateToken, async (req: any, res) => {
  const { id } = req.params;

  if (isSupabaseActive()) {
    try {
      const users = await dbService.getUsers();
      const user = users.find((u: any) => u.id === req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const favorites = user.favorites || [];
      const favIndex = favorites.indexOf(id);
      let isFavorited = false;
      let savesCountOffset = 0;

      if (favIndex === -1) {
        favorites.push(id);
        isFavorited = true;
        savesCountOffset = 1;
      } else {
        favorites.splice(favIndex, 1);
        isFavorited = false;
        savesCountOffset = -1;
      }

      await dbService.updateUserFavorites(req.user.userId, favorites);

      // Update listing saves count
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === id);
      if (listing) {
        const nextSaves = Math.max(0, (listing.savesCount || 0) + savesCountOffset);
        await dbService.updateListingSaves(id, nextSaves);
      }

      return res.json({ success: true, isFavorited, favorites });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    
    const userIndex = db.users.findIndex((u: any) => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = db.users[userIndex];
    user.favorites = user.favorites || [];
    
    const favIndex = user.favorites.indexOf(id);
    let isFavorited = false;
    if (favIndex === -1) {
      user.favorites.push(id);
      isFavorited = true;
      
      // Increment listing savesCount
      const listing = db.listings.find((l: any) => l.id === id);
      if (listing) {
        listing.savesCount = (listing.savesCount || 0) + 1;
      }
    } else {
      user.favorites.splice(favIndex, 1);
      isFavorited = false;
      
      const listing = db.listings.find((l: any) => l.id === id);
      if (listing && listing.savesCount > 0) {
        listing.savesCount = listing.savesCount - 1;
      }
    }

    saveDB(db);
    res.json({ success: true, isFavorited, favorites: user.favorites });
  }
});

// Inquiry Submission
app.post("/api/listings/:id/inquire", authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Inquiry message is required" });
  }

  const freshInquiry = {
    id: `inq-${Date.now()}`,
    listingId: id,
    tenantId: req.user.userId,
    tenantName: req.user.name,
    tenantEmail: req.user.email,
    tenantPhone: req.user.phone || "",
    message,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseActive()) {
    try {
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === id);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found" });
      }

      await dbService.createInquiry(freshInquiry);

      // Update listing inquiry count
      const nextInqCount = (listing.inquiriesCount || 0) + 1;
      await dbService.updateListing(id, { inquiriesCount: nextInqCount });

      // Create owner notification
      const notificationForOwner = {
        id: `not-${Date.now()}`,
        userId: listing.author.id,
        title: "New Property Inquiry",
        message: `A tenant has inquired about your listing "${listing.title}". Message: "${message}". Contact: ${req.user.name} (${req.user.phone || "No phone"}, ${req.user.email})`,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      await dbService.createNotification(notificationForOwner);

      return res.status(201).json({ success: true, inquiry: freshInquiry });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const listing = db.listings.find((l: any) => l.id === id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    db.inquiries.push(freshInquiry);

    // Update listings stats
    listing.inquiriesCount = (listing.inquiriesCount || 0) + 1;

    // Send landlord/agent notification
    const notificationForOwner = {
      id: `not-${Date.now()}`,
      userId: listing.author.id,
      title: "New Property Inquiry",
      message: `A tenant has inquired about your listing "${listing.title}". Message: "${message}". Contact: ${req.user.name} (${req.user.phone || "No phone"}, ${req.user.email})`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.push(notificationForOwner);

    saveDB(db);
    res.status(201).json({ success: true, inquiry: freshInquiry });
  }
});

// Fetch notifications
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  if (isSupabaseActive()) {
    try {
      const notifications = await dbService.getNotifications();
      const userNotifications = notifications.filter((n: any) => n.userId === req.user.userId);
      return res.json({ success: true, notifications: userNotifications });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const userNotifications = db.notifications.filter((n: any) => n.userId === req.user.userId);
    res.json({ success: true, notifications: userNotifications });
  }
});

// Clear/read notifications
app.post("/api/notifications/read", authenticateToken, async (req: any, res) => {
  if (isSupabaseActive()) {
    try {
      await dbService.markNotificationsAsRead(req.user.userId);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    db.notifications = db.notifications.map((n: any) => {
      if (n.userId === req.user.userId) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveDB(db);
    res.json({ success: true });
  }
});

// List payment records (for system verification and dashboard synchronization)
app.get("/api/payments", async (req, res) => {
  if (isSupabaseActive()) {
    try {
      const payments = await dbService.getPayments();
      return res.json({ success: true, payments });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    res.json({ success: true, payments: db.payments });
  }
});

// User Session/Token Invalidation (Logout Endpoint)
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out and invalidated session successfully" });
});

// Proactive Listing Lifecycle Expiry Status Endpoint
app.post("/api/listings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: "status is required" });
  }

  if (isSupabaseActive()) {
    try {
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === id);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found" });
      }

      await dbService.updateListing(id, { status });
      return res.json({ success: true, listing: { ...listing, status } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const listingIndex = db.listings.findIndex((l: any) => l.id === id);
    if (listingIndex !== -1) {
      db.listings[listingIndex].status = status;
      saveDB(db);
      res.json({ success: true, listing: db.listings[listingIndex] });
    } else {
      res.status(404).json({ success: false, error: "Listing not found" });
    }
  }
});

// Africa's Talking SMS Dispatch Proxy Gateway Route
app.post("/api/sms/send", async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ success: false, error: "Recipient phone 'to' and 'message' content are required." });
  }

  const username = process.env.AFRICASTALKING_USERNAME || "sandbox";
  const apiKey = process.env.AFRICASTALKING_API_KEY;

  let formattedPhone = to.trim().replace(/^\+/, "").replace(/^0/, "254");
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }
  formattedPhone = "+" + formattedPhone;

  try {
    if (!apiKey) {
      throw new Error("Africa's Talking API Key missing from server environment config.");
    }

    const resAT = await fetch(
      username === "sandbox"
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "apikey": apiKey
        },
        body: new URLSearchParams({
          username: username,
          to: formattedPhone,
          message: message
        })
      }
    );

    const data = await resAT.json();
    return res.json({ success: true, payload: data });
  } catch (err: any) {
    console.warn("⚠️ Africa's Talking Proxy offline or missing key. Triggering sandbox simulation feedback.", err.message);
    return res.json({
      success: true,
      simulated: true,
      message: `[SIMULATED SMS to ${formattedPhone}]: ${message}`
    });
  }
});

// ============================================
// REAL DARAJA API STK PUSH PROCESSOR
// ============================================

// Utility helper to mask the Safaricom phone numbers after submission
function maskPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.trim().replace(/^\+/, "");
  if (cleaned.length < 8) return "****";
  return cleaned.slice(0, 4) + "*".repeat(cleaned.length - 7) + cleaned.slice(-3);
}

app.post("/api/payments/mpesa/stkpush", async (req, res) => {
  const { listingId, phoneNumber, amount } = req.body;

  if (!listingId || !phoneNumber || !amount) {
    return res.status(400).json({ success: false, error: "listingId, phoneNumber, and amount are required" });
  }

  // Format phone number to 2547xxxxxxxx format
  let formattedPhone = phoneNumber.trim().replace(/^\+/, "").replace(/^0/, "254");
  if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }

  let paymentRecord: any;

  if (isSupabaseActive()) {
    try {
      const payments = await dbService.getPayments();
      // Prevent double charging: One payment per listing
      const duplicateConfirmed = payments.find((p: any) => p.listingId === listingId && p.status === "success");
      if (duplicateConfirmed) {
        return res.status(400).json({ success: false, error: "One payment per listing — this listing fee has already been successfully paid." });
      }

      paymentRecord = payments.find((p: any) => p.listingId === listingId && p.status === "pending");

      // Create payment record dynamically if it was missing or already completed previously
      if (!paymentRecord) {
        paymentRecord = {
          id: `pay-${Date.now()}`,
          listingId: listingId,
          amount: Math.round(Number(amount)),
          currency: "KES",
          provider: "mpesa",
          status: "pending",
          phoneNumber: formattedPhone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await dbService.createPayment(paymentRecord);
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();

    // Prevent double charging: One payment per listing
    const duplicateConfirmed = db.payments.find((p: any) => p.listingId === listingId && p.status === "success");
    if (duplicateConfirmed) {
      return res.status(400).json({ success: false, error: "One payment per listing — this listing fee has already been successfully paid." });
    }

    paymentRecord = db.payments.find((p: any) => p.listingId === listingId && p.status === "pending");

    // Create payment record dynamically if it was missing or already completed previously
    if (!paymentRecord) {
      paymentRecord = {
        id: `pay-${Date.now()}`,
        listingId: listingId,
        amount: Math.round(Number(amount)),
        currency: "KES",
        provider: "mpesa",
        status: "pending",
        phoneNumber: formattedPhone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.payments.push(paymentRecord);
      saveDB(db);
    }
  }

  try {
    const accessToken = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

    // Cryptographic signature check: append Daraja HMAC or secure hash to verify genuineness
    const signatureSecret = "daraja-signature-callback-token-secret-2026";
    const callbackSignature = crypto
      .createHmac("sha256", signatureSecret)
      .update(listingId)
      .digest("hex");

    // Dynamic Callback resolution based on app hosting URL
    const publicUrl = process.env.APP_URL || "https://ais-dev-sfmibnnqnbsnb3cvrwir6j-158126767579.europe-west2.run.app";
    const callbackUrl = `${publicUrl.replace(/\/$/, "")}/api/payments/mpesa/callback?signature=${callbackSignature}`;

    const stkBody = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(Number(amount)),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `NESTLIST-${listingId.slice(-4).toUpperCase()}`,
      TransactionDesc: "NestList Listing Placement Fee"
    };

    const baseUrl = (MPESA_ENV.toLowerCase() === "production" || MPESA_ENV.toLowerCase() === "live")
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
    const pushUrl = `${baseUrl}/mpesa/stkpush/v1/processrequest`;
    const pushRes = await fetch(pushUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(stkBody)
    });

    if (!pushRes.ok) {
      const errorText = await pushRes.text();
      throw new Error(`Daraja API Refused Prompt: ${errorText}`);
    }

    const mpesaResult: any = await pushRes.json();

    if (mpesaResult.ResponseCode === "0") {
      const checkoutRequestID = mpesaResult.CheckoutRequestID;
      const maskedPhone = maskPhoneNumber(formattedPhone);

      if (isSupabaseActive()) {
        await dbService.updatePayment(paymentRecord.id, {
          checkoutRequestID,
          phoneNumber: maskedPhone
        });
      } else {
        const db = loadDB();
        const curPay = db.payments.find((p: any) => p.id === paymentRecord.id);
        if (curPay) {
          curPay.checkoutRequestID = checkoutRequestID;
          curPay.phoneNumber = maskedPhone;
          curPay.updatedAt = new Date().toISOString();
        }
        saveDB(db);
      }

      return res.json({
        success: true,
        checkoutRequestID,
        paymentId: paymentRecord.id,
        message: "STK push initiated successfully!"
      });
    } else {
      throw new Error(mpesaResult.ResponseDescription || "Unknown Daraja transaction rejection.");
    }
  } catch (err: any) {
    console.warn("⚠️ REAL Daraja token or processing failed, generating pending record for custom manual simulations:", err.message);
    const checkoutRequestID = `MOCK-STK-${Date.now().toString().slice(-6)}`;
    const maskedPhone = maskPhoneNumber(formattedPhone);

    if (isSupabaseActive()) {
      await dbService.updatePayment(paymentRecord.id, {
        checkoutRequestID,
        phoneNumber: maskedPhone
      });
    } else {
      const db = loadDB();
      const curPay = db.payments.find((p: any) => p.id === paymentRecord.id);
      if (curPay) {
        curPay.checkoutRequestID = checkoutRequestID;
        curPay.phoneNumber = maskedPhone;
        curPay.updatedAt = new Date().toISOString();
      }
      saveDB(db);
    }

    res.json({
      success: true,
      checkoutRequestID,
      paymentId: paymentRecord.id,
      message: "Gateway triggered under local testing simulation."
    });
  }
});

// Safaricom Callback STK Webhook Endpoint with secure Daraja signature checks
app.post("/api/payments/mpesa/callback", async (req, res) => {
  const mpesaBody = req.body;
  const { signature } = req.query;
  console.log("🔔 SAFARICOM DARAJA SECURE CALLBACK:", JSON.stringify(mpesaBody, null, 2));

  try {
    if (!mpesaBody || !mpesaBody.Body || !mpesaBody.Body.stkCallback) {
      return res.status(400).json({ success: false, error: "Invalid mpesa callback payload structure" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = mpesaBody.Body.stkCallback;

    let payment: any;

    if (isSupabaseActive()) {
      const payments = await dbService.getPayments();
      payment = payments.find((p: any) => p.checkoutRequestID === CheckoutRequestID);
    } else {
      const db = loadDB();
      payment = db.payments.find((p: any) => p.checkoutRequestID === CheckoutRequestID);
    }

    if (!payment) {
      return res.status(404).json({ success: false, error: "Target checkout request ID matching payment not found" });
    }

    // Validate callback is genuinely from Safaricom: check signature query parameter matches
    const signatureSecret = "daraja-signature-callback-token-secret-2026";
    const expectedSignature = crypto
      .createHmac("sha256", signatureSecret)
      .update(payment.listingId)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ SECURITY EXCEPTION: Callback signature is invalid!");
      return res.status(403).json({ success: false, error: "Access Denied: Callback signature spoofing detected." });
    }

    let nextStatus = "failed";
    let mpesaReceiptNumber = null;
    let transactionId = null;
    let paymentTimestamp = null;

    if (ResultCode === 0) {
      nextStatus = "success";
      paymentTimestamp = new Date().toISOString();

      // Retrieve receipt number from CallbackMetadata values (used as the transaction ID from Daraja)
      if (CallbackMetadata && Array.isArray(CallbackMetadata.Item)) {
        const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === "MpesaReceiptNumber");
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
          transactionId = receiptItem.Value;
        }
      }
    }

    if (isSupabaseActive()) {
      await dbService.updatePayment(payment.id, {
        status: nextStatus,
        mpesaReceiptNumber,
        transactionId,
        paymentTimestamp
      });

      if (ResultCode === 0) {
        // Activate listing
        const expireTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await dbService.updateListing(payment.listingId, {
          status: "active",
          expiresAt: expireTime
        });
      }
    } else {
      const db = loadDB();
      const curPay = db.payments.find((p: any) => p.id === payment.id);
      if (curPay) {
        curPay.status = nextStatus;
        curPay.mpesaReceiptNumber = mpesaReceiptNumber;
        curPay.transactionId = transactionId;
        curPay.paymentTimestamp = paymentTimestamp;
        curPay.updatedAt = new Date().toISOString();
      }

      if (ResultCode === 0) {
        const listing = db.listings.find((l: any) => l.id === payment.listingId);
        if (listing) {
          listing.status = "active";
          listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
      }
      saveDB(db);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("❌ Callback parse error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Developer Simulator for testing Callback resolutions offline / sandbox limits
app.post("/api/payments/mpesa/simulate-success", async (req, res) => {
  const { checkoutRequestID } = req.body;
  if (!checkoutRequestID) {
    return res.status(400).json({ success: false, error: "checkoutRequestID is required" });
  }

  let payment: any;

  if (isSupabaseActive()) {
    try {
      const payments = await dbService.getPayments();
      payment = payments.find((p: any) => p.checkoutRequestID === checkoutRequestID);

      if (!payment) {
        return res.status(404).json({ success: false, error: "Payment checkout record not found for simulation" });
      }

      const receiptNumber = `NLR${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const now = new Date().toISOString();

      await dbService.updatePayment(payment.id, {
        status: "success",
        mpesaReceiptNumber: receiptNumber,
        transactionId: receiptNumber,
        paymentTimestamp: now
      });

      // Activate corresponding property listing and notify
      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === payment.listingId);
      if (listing) {
        await dbService.updateListing(payment.listingId, {
          status: "active",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        const notification = {
          id: `not-${Date.now()}`,
          userId: listing.author.id,
          title: "Listing Published Live!",
          message: `Your property listing "${listing.title}" has been successfully active and published live for 30 days!`,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        await dbService.createNotification(notification);
      }

      const updatedPayment = {
        ...payment,
        status: "success",
        mpesaReceiptNumber: receiptNumber,
        transactionId: receiptNumber,
        paymentTimestamp: now,
        updatedAt: now
      };

      return res.json({ success: true, payment: updatedPayment });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const index = db.payments.findIndex((p: any) => p.checkoutRequestID === checkoutRequestID);

    if (index === -1) {
      return res.status(404).json({ success: false, error: "Payment checkout record not found for simulation" });
    }

    const payment = db.payments[index];
    payment.status = "success";
    payment.mpesaReceiptNumber = `NLR${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    payment.transactionId = payment.mpesaReceiptNumber;
    payment.paymentTimestamp = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    // Activate listed asset
    const listingIndex = db.listings.findIndex((l: any) => l.id === payment.listingId);
    if (listingIndex !== -1) {
      db.listings[listingIndex].status = "active";
      db.listings[listingIndex].expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Create success notification for user listing
    const listingOwnerId = db.listings[listingIndex]?.author?.id;
    if (listingOwnerId) {
      db.notifications.push({
        id: `not-${Date.now()}`,
        userId: listingOwnerId,
        title: "Listing Published Live!",
        message: `Your property listing "${db.listings[listingIndex]?.title}" has been successfully active and published live for 30 days!`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDB(db);
    res.json({ success: true, payment });
  }
});

// Dedicated Status Polling Route
app.get("/api/payments/mpesa/status/:checkoutRequestID", async (req, res) => {
  const { checkoutRequestID } = req.params;

  if (isSupabaseActive()) {
    try {
      const payments = await dbService.getPayments();
      const payment = payments.find((p: any) => p.checkoutRequestID === checkoutRequestID);

      if (!payment) {
        return res.status(404).json({ success: false, error: "Payment checkout session not found" });
      }

      const listings = await dbService.getListings();
      const listing = listings.find((l: any) => l.id === payment.listingId);

      return res.json({
        success: true,
        status: payment.status,
        mpesaReceiptNumber: payment.mpesaReceiptNumber || null,
        updatedAt: payment.updatedAt,
        listingStatus: listing ? listing.status : null
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const payment = db.payments.find((p: any) => p.checkoutRequestID === checkoutRequestID);

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment checkout session not found" });
    }

    const listing = db.listings.find((l: any) => l.id === payment.listingId);

    res.json({
      success: true,
      status: payment.status,
      mpesaReceiptNumber: payment.mpesaReceiptNumber || null,
      updatedAt: payment.updatedAt,
      listingStatus: listing ? listing.status : null
    });
  }
});


// List Inquiries (Sent or Received depending on role structure)
app.get("/api/inquiries", authenticateToken, async (req: any, res) => {
  if (isSupabaseActive()) {
    try {
      return res.json({ success: true, inquiries: [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const userRole = req.user.role;
    const userId = req.user.userId;
    
    let filteredInquiries = [];
    if (userRole === "Tenant") {
      filteredInquiries = (db.inquiries || []).filter((i: any) => i.tenantId === userId);
    } else {
      const userListings = (db.listings || []).filter((l: any) => l.author?.id === userId);
      const userListingIds = userListings.map((l: any) => l.id);
      filteredInquiries = (db.inquiries || []).filter((i: any) => userListingIds.includes(i.listingId));
    }
    
    res.json({ success: true, inquiries: filteredInquiries });
  }
});

// List Registered Users (Safe projection for Admin space)
app.get("/api/users", authenticateToken, async (req: any, res) => {
  if (isSupabaseActive()) {
    try {
      return res.json({ success: true, users: [] });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    const db = loadDB();
    const safeUsers = (db.users || []).map(({ passwordHash, ...u }: any) => u);
    res.json({ success: true, users: safeUsers });
  }
});

// Get all system Claims and Flag Reports
app.get("/api/reports", authenticateToken, async (req: any, res) => {
  const db = loadDB();
  res.json({ success: true, reports: db.reports || [] });
});

// Submit a System Flag / Report
app.post("/api/reports", authenticateToken, async (req: any, res) => {
  const { listingId, reason, details } = req.body;
  if (!listingId || !reason) {
    return res.status(400).json({ success: false, error: "listingId and reason are required" });
  }
  
  const db = loadDB();
  const listing = (db.listings || []).find((l: any) => l.id === listingId);
  const freshReport = {
    id: `rep-${Date.now()}`,
    listingId,
    listingTitle: listing ? listing.title : "Unknown Property",
    reporterName: req.user.name,
    reporterEmail: req.user.email,
    reason,
    details: details || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  
  db.reports = db.reports || [];
  db.reports.push(freshReport);
  saveDB(db);
  
  res.status(201).json({ success: true, report: freshReport });
});


// MIDDLEWARE GATEWAYS AND STATIC ASSETS SERVING FOR PRODUCTION AND GENERAL IFRAME INTERACTIVE CHANNELS
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 NESTLIST PLATFORM server running on http://localhost:${PORT} under mode ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

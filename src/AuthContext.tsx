import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: 'landlord' | 'tenant' | 'admin';
  created_at: string;
  email?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isMockMode: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; profile: Profile | null; error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: 'landlord' | 'tenant' | 'admin'
  ) => Promise<{ user: User | null; profile: Profile | null; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isSupabaseConfigured = Boolean(
  (import.meta as any).env.VITE_SUPABASE_URL && 
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY && 
  (import.meta as any).env.VITE_SUPABASE_URL !== "https://your-project.supabase.co" &&
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY !== "your-anon-key"
);

// Default mock profiles database
const DEFAULT_MOCK_PROFILES_DB = [
  {
    id: "landlord-1",
    email: "landlord@nestlist.ke",
    password: "password",
    full_name: "Francis Ngari",
    phone: "254712345678",
    role: "landlord" as const,
    created_at: new Date().toISOString()
  },
  {
    id: "tenant-1",
    email: "tenant@nestlist.ke",
    password: "password",
    full_name: "Alice Achieng",
    phone: "254799887766",
    role: "tenant" as const,
    created_at: new Date().toISOString()
  },
  {
    id: "admin-1",
    email: "admin@nestlist.ke",
    password: "password",
    full_name: "SaaS Admin",
    phone: "254700000000",
    role: "admin" as const,
    created_at: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return true;
    return localStorage.getItem("nestlist_offline_mode") === "true";
  });

  const activateMockMode = () => {
    setIsMockMode(true);
    localStorage.setItem("nestlist_offline_mode", "true");
  };

  // Load mock profiles DB
  const getMockProfilesDb = () => {
    const cached = localStorage.getItem("nestlist_mock_profiles_db");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return DEFAULT_MOCK_PROFILES_DB;
      }
    }
    localStorage.setItem("nestlist_mock_profiles_db", JSON.stringify(DEFAULT_MOCK_PROFILES_DB));
    return DEFAULT_MOCK_PROFILES_DB;
  };

  const saveMockProfileToDb = (newProfile: any) => {
    const db = getMockProfilesDb();
    db.push(newProfile);
    localStorage.setItem("nestlist_mock_profiles_db", JSON.stringify(db));
  };

  // Fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (isMockMode) {
      const db = getMockProfilesDb();
      const p = db.find((item: any) => item.id === userId);
      return p ? { id: p.id, full_name: p.full_name, phone: p.phone, role: p.role, created_at: p.created_at } : null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.id);
      setProfile(prof);
    }
  };

  useEffect(() => {
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        setLoading(true);

        if (!isSupabaseConfigured || isMockMode) {
          console.log("ℹ️ Initialized in Sandbox Auth Mode.");
          const cachedSession = localStorage.getItem("nestlist_mock_session");
          if (cachedSession) {
            const parsed = JSON.parse(cachedSession);
            setSession(parsed);
            setUser(parsed.user);
            const prof = await fetchProfile(parsed.user.id);
            setProfile(prof);
          }
          setLoading(false);
          return;
        }

        // Try Live Supabase config on active mount
        try {
          const { data: { session: activeSession }, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (activeSession) {
            setSession(activeSession);
            setUser(activeSession.user);
            const prof = await fetchProfile(activeSession.user.id);
            setProfile(prof);
            setIsMockMode(false);
          } else {
            // Check mock session even if supabase is configured in case it was a mock login previously
            const cachedSession = localStorage.getItem("nestlist_mock_session");
            if (cachedSession) {
              const parsed = JSON.parse(cachedSession);
              setSession(parsed);
              setUser(parsed.user);
              const prof = await fetchProfile(parsed.user.id);
              setProfile(prof);
              activateMockMode();
            } else {
              setSession(null);
              setUser(null);
              setProfile(null);
              setIsMockMode(false);
            }
          }
        } catch (authError: any) {
          console.warn("Supabase getSession failed, falling back to Sandbox Auth:", authError.message);
          activateMockMode();
          const cachedSession = localStorage.getItem("nestlist_mock_session");
          if (cachedSession) {
            const parsed = JSON.parse(cachedSession);
            setSession(parsed);
            setUser(parsed.user);
            const prof = await fetchProfile(parsed.user.id);
            setProfile(prof);
          }
        }

        // Setup listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            if (isMockMode) return; // ignore live changes in mock mode
            setLoading(true);
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession?.user) {
              const prof = await fetchProfile(currentSession.user.id);
              setProfile(prof);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }
        );
        authSubscription = subscription;

      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [isMockMode]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const emailLower = email.trim().toLowerCase();

    // 1. Try real Supabase auth if configured
    if (isSupabaseConfigured && !isMockMode) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password,
        });

        if (error) {
          // If the error looks like a "Failed to fetch", fall back to mock auth
          if (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("fetch failed")) {
            console.warn("Supabase host offline. Activating Sandbox Auth fallback.");
            activateMockMode();
          } else {
            setLoading(false);
            return { user: null, profile: null, error };
          }
        } else if (data.user) {
          const prof = await fetchProfile(data.user.id);
          setSession(data.session);
          setUser(data.user);
          setProfile(prof);
          setLoading(false);
          return { user: data.user, profile: prof, error: null };
        }
      } catch (err: any) {
        if (err.message?.toLowerCase().includes("failed to fetch") || err.message?.toLowerCase().includes("fetch failed")) {
          console.warn("Supabase host offline during signin. Activating Sandbox Auth Mode.");
          activateMockMode();
        } else {
          setLoading(false);
          return { user: null, profile: null, error: err };
        }
      }
    }

    // 2. Sandbox Mock Auth (either forced or fallback)
    const db = getMockProfilesDb();
    let mockUserAccount = db.find((u: any) => u.email.toLowerCase() === emailLower);

    if (mockUserAccount) {
      if (mockUserAccount.password !== password) {
        setLoading(false);
        return { 
          user: null, 
          profile: null, 
          error: new Error("Incorrect password for this sandbox account. Please verify your credentials or register a new one.") 
        };
      }
    } else {
      // Auto-create a brand new sandbox account on the fly for any new logins in mock mode!
      const newId = `usr-mock-${Date.now()}`;
      mockUserAccount = {
        id: newId,
        email: emailLower,
        password: password,
        full_name: emailLower.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        phone: "+254712345678",
        role: emailLower.includes('landlord') ? ('landlord' as const) : (emailLower.includes('admin') ? ('admin' as const) : ('tenant' as const)),
        created_at: new Date().toISOString()
      };
      saveMockProfileToDb(mockUserAccount);
    }

    const mockUser = {
      id: mockUserAccount.id,
      email: mockUserAccount.email,
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: mockUserAccount.created_at,
    } as any;

    const mockSession = {
      access_token: "mock-token-session",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token-session",
      user: mockUser,
    } as any;

    localStorage.setItem("nestlist_mock_session", JSON.stringify(mockSession));
    setSession(mockSession);
    setUser(mockUser);
    setProfile({
      id: mockUserAccount.id,
      full_name: mockUserAccount.full_name,
      phone: mockUserAccount.phone,
      role: mockUserAccount.role,
      created_at: mockUserAccount.created_at
    });
    activateMockMode();
    setLoading(false);
    return { user: mockUser, profile: mockUserAccount, error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: 'landlord' | 'tenant' | 'admin'
  ) => {
    setLoading(true);
    const emailLower = email.trim().toLowerCase();

    // 1. Try real Supabase auth if configured
    if (isSupabaseConfigured && !isMockMode) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: emailLower,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("failed to fetch") || error.message.toLowerCase().includes("fetch failed")) {
            console.warn("Supabase host offline during register. Redirecting to Sandbox Auth.");
            activateMockMode();
          } else {
            setLoading(false);
            return { user: null, profile: null, error };
          }
        } else if (data.user) {
          // Insert inside profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              phone: phone || null,
              role: role,
            });

          if (profileError) {
            console.error("Profiles table insertion failed: ", profileError.message);
          }

          const prof = { id: data.user.id, full_name: fullName, phone: phone || null, role, created_at: new Date().toISOString() };
          setLoading(false);
          return { user: data.user, profile: prof, error: null };
        }
      } catch (err: any) {
        if (err.message?.toLowerCase().includes("failed to fetch") || err.message?.toLowerCase().includes("fetch failed")) {
          console.warn("Supabase host offline during register. Activating Sandbox Auth.");
          activateMockMode();
        } else {
          setLoading(false);
          return { user: null, profile: null, error: err };
        }
      }
    }

    // 2. Sandbox Mock Auth SignUp
    const db = getMockProfilesDb();
    const exists = db?.some((u: any) => u.email.toLowerCase() === emailLower);

    if (exists) {
      setLoading(false);
      return { user: null, profile: null, error: new Error("An account with this email address already exists in the sandbox database.") };
    }

    const newId = `usr-mock-${Date.now()}`;
    const newMockProfile = {
      id: newId,
      email: emailLower,
      password: password,
      full_name: fullName,
      phone: phone || null,
      role: role,
      created_at: new Date().toISOString()
    };

    saveMockProfileToDb(newMockProfile);
    activateMockMode();
    setLoading(false);
    return { 
      user: { id: newId, email: emailLower } as any, 
      profile: { id: newId, full_name: fullName, phone: phone || null, role, created_at: newMockProfile.created_at }, 
      error: null 
    };
  };

  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem("nestlist_mock_session");
      localStorage.removeItem("nestlist_offline_mode");
      setIsMockMode(!isSupabaseConfigured);
      if (isSupabaseConfigured && !isMockMode) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn("Supabase signOut error:", err);
        }
      }
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error('Error signing out:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isMockMode, signOut, refreshProfile, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { getApiUrl } from "./utils/apiHelper";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "landlord" | "tenant" | "admin";
  created_at: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  preferredContact?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isMockMode: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ user: any | null; profile: Profile | null; error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: "landlord" | "tenant" | "admin" | "agent"
  ) => Promise<{ user: any | null; profile: Profile | null; error: any }>;
  submitOTP: (code: string) => Promise<{ success: boolean }>;
  signUpStep: "idle" | "verifying" | "completed";
  resendVerificationOTP: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map unified roles
const mapBackendRoleToAppRole = (role: string): "landlord" | "tenant" | "admin" => {
  if (!role) return "tenant";
  const r = role.toLowerCase();
  if (r === "tenant") return "tenant";
  if (r === "landlord" || r === "agent" || r === "editor") return "landlord";
  if (r === "admin") return "admin";
  return "tenant";
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isUserLoaded, isSignedIn, user: clerkUser } = useUser();
  const { isLoaded: isSignInLoaded, signIn: clerkSignIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp: clerkSignUp, setActive: setSignUpActive } = useSignUp();
  const { signOut: clerkSignOut } = useClerk();

  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [signUpStep, setSignUpStep] = useState<"idle" | "verifying" | "completed">("idle");
  const [pendingSignup, setPendingSignup] = useState<{
    email: string;
    fullName: string;
    phone: string;
    role: "landlord" | "tenant" | "admin" | "agent";
  } | null>(null);

  // Hook into Clerk user changes to produce our unified AuthContext user/profile structure
  useEffect(() => {
    const syncUserSession = async () => {
      if (!isUserLoaded) {
        setLoading(true);
        return;
      }

      if (isSignedIn && clerkUser) {
        // Resolve google / SSO pending user roles
        let clerkRole = clerkUser.publicMetadata?.role;
        let clerkPhone = clerkUser.publicMetadata?.phone;

        if (!clerkRole) {
          const pendingRole = localStorage.getItem("nestlist_oauth_pending_role") || "tenant";
          const pendingPhone = localStorage.getItem("nestlist_oauth_pending_phone") || "";
          try {
            const syncRes = await fetch(getApiUrl("/api/set-role"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: clerkUser.id,
                role: pendingRole,
                phone: pendingPhone,
              }),
            });

            if (syncRes.ok) {
              await clerkUser.reload();
              clerkRole = pendingRole;
              clerkPhone = pendingPhone;
            }
          } catch (err) {
            console.error("Failed to sync role to metadata upon Social/SSO sign up:", err);
          } finally {
            localStorage.removeItem("nestlist_oauth_pending_role");
            localStorage.removeItem("nestlist_oauth_pending_phone");
          }
        }

        const email = clerkUser.primaryEmailAddress?.emailAddress || "";
        const u = {
          id: clerkUser.id,
          email: email,
          email_confirmed_at: clerkUser.emailAddresses[0]?.verification?.status === "verified" ? new Date().toISOString() : null,
        };

        const p: Profile = {
          id: clerkUser.id,
          full_name: clerkUser.fullName || email.split("@")[0],
          phone: (clerkPhone as string) || (clerkUser.publicMetadata?.phone as string) || null,
          role: mapBackendRoleToAppRole((clerkRole || "tenant") as string),
          created_at: clerkUser.createdAt ? clerkUser.createdAt.toISOString() : new Date().toISOString(),
          email: email,
          avatarUrl: clerkUser.imageUrl || "",
          bio: "",
          location: "Nairobi, Kenya"
        };

        // If Checked rememberMe: Keep active. Unchecked rememberMe: expire on close
        if (localStorage.getItem("nestlist_remember_me") === "false") {
          if (!sessionStorage.getItem("nestlist_session_active")) {
            // New browser session detected with Remember Me unchecked -> force logout
            clerkSignOut().then(() => {
              setUser(null);
              setProfile(null);
              setLoading(false);
            });
            return;
          }
        }

        sessionStorage.setItem("nestlist_session_active", "true");
        setUser(u);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    syncUserSession();
  }, [isUserLoaded, isSignedIn, clerkUser]);

  const refreshProfile = async () => {
    if (clerkUser) {
      await clerkUser.reload();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      if (!isSignInLoaded || !clerkSignIn) {
        throw new Error("Clerk authentication is loading. Please reload the page.");
      }

      const cleanEmail = email.trim().toLowerCase();

      // Submit identification parameters
      await clerkSignIn.create({
        identifier: cleanEmail,
        password: password,
      });

      // Complete login factor
      const completeSignIn = await clerkSignIn.attemptFirstFactor({
        strategy: "password",
        password: password,
      });

      if (completeSignIn.status === "complete") {
        await setSignInActive({ session: completeSignIn.createdSessionId });
        return { user: { id: completeSignIn.createdSessionId, email: cleanEmail }, profile: null, error: null };
      } else {
        throw new Error("Multi-factor or secondary authentication parameter requested.");
      }
    } catch (err: any) {
      console.error("Clerk signIn rejected:", err);
      return { user: null, profile: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: "landlord" | "tenant" | "admin" | "agent"
  ) => {
    try {
      setLoading(true);
      if (!isSignUpLoaded || !clerkSignUp) {
        throw new Error("Clerk Registration service is offline. Please try again.");
      }

      const cleanEmail = email.trim().toLowerCase();
      const names = fullName.trim().split(/\s+/);
      const firstName = names[0] || "Partner";
      const lastName = names.slice(1).join(" ") || "Nestlist";

      // 1. Initialize sign up
      await clerkSignUp.create({
        emailAddress: cleanEmail,
        password: password,
        firstName,
        lastName,
      });

      // 2. Prepare verification
      await clerkSignUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Hold on screen configuration
      setPendingSignup({
        email: cleanEmail,
        fullName,
        phone,
        role,
      });

      setSignUpStep("verifying");
      return { user: { email: cleanEmail }, profile: null, error: null };
    } catch (err: any) {
      console.error("Clerk signUp rejected:", err);
      return { user: null, profile: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async (code: string) => {
    try {
      setLoading(true);
      if (!clerkSignUp) {
        throw new Error("Clerk was not loaded correctly.");
      }
      if (!pendingSignup) {
        throw new Error("No enrollment profile parameters found in state.");
      }

      const { email, phone, fullName, role } = pendingSignup;

      // Complete verification
      const completeSignUp = await clerkSignUp.attemptEmailAddressVerification({
        code: code,
      });

      if (completeSignUp.status === "complete") {
        // Sync publicMetadata to user profile through the secure backend endpoints
        try {
          await fetch(getApiUrl("/api/set-role"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: completeSignUp.createdUserId,
              role: role,
              phone: phone,
            }),
          });
        } catch (setRoleErr) {
          console.error("Failed to establish target role metadata during creation:", setRoleErr);
        }

        // Activate core session
        await setSignUpActive({ session: completeSignUp.createdSessionId });

        setSignUpStep("completed");
        setPendingSignup(null);
        return { success: true };
      } else {
        throw new Error("Email activation verification parameters not finished.");
      }
    } catch (err: any) {
      console.error("Clerk confirmation failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationOTP = async () => {
    if (!clerkSignUp) throw new Error("Clerk registration module not initialized.");
    await clerkSignUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });
  };

  const signOut = async () => {
    try {
      setLoading(true);
      sessionStorage.removeItem("nestlist_session_active");
      await clerkSignOut();
      setUser(null);
      setProfile(null);
      setSignUpStep("idle");
      setPendingSignup(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isMockMode: false,
        signOut,
        refreshProfile,
        signIn,
        signUp,
        submitOTP,
        signUpStep,
        resendVerificationOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

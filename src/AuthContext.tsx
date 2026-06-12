import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "landlord" | "tenant" | "admin";
  created_at: string;
  email?: string;
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
    role: "landlord" | "tenant" | "admin"
  ) => Promise<{ user: any | null; profile: Profile | null; error: any }>;
  submitOTP: (code: string) => Promise<{ success: boolean }>;
  signUpStep: "idle" | "verifying" | "completed";
  resendVerificationOTP: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: isUserLoaded, user: clerkUser } = useUser();
  const { isLoaded: isSignInLoaded, signIn: clerkSignIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp: clerkSignUp, setActive } = useSignUp();
  const { signOut: clerkSignOut } = useClerk();

  const [loading, setLoading] = useState<boolean>(true);
  const [signUpStep, setSignUpStep] = useState<"idle" | "verifying" | "completed">("idle");
  const [pendingSignup, setPendingSignup] = useState<{ role: string; phone: string } | null>(null);

  // Sync loading state with Clerk loaded statuses
  useEffect(() => {
    if (isUserLoaded && isSignInLoaded && isSignUpLoaded) {
      setLoading(false);
    }
  }, [isUserLoaded, isSignInLoaded, isSignUpLoaded]);

  // Sync pending OAuth user metadata (role and phone) received during Google OAuth redirection
  useEffect(() => {
    const syncOauthMetadata = async () => {
      if (clerkUser) {
        const currentRole = clerkUser.publicMetadata?.role;
        const currentPhone = clerkUser.publicMetadata?.phone;
        const pendingRole = localStorage.getItem("nestlist_oauth_pending_role");
        const pendingPhone = localStorage.getItem("nestlist_oauth_pending_phone");

        if (!currentRole && (pendingRole || pendingPhone)) {
          try {
            console.log("Syncing pending OAuth role and phone to Clerk publicMetadata:", { pendingRole, pendingPhone });
            const response = await fetch("/api/set-role", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: clerkUser.id,
                role: pendingRole || "tenant",
                phone: pendingPhone || ""
              }),
            });
            const data = await response.json();
            if (data.success) {
              await clerkUser.reload();
              localStorage.removeItem("nestlist_oauth_pending_role");
              localStorage.removeItem("nestlist_oauth_pending_phone");
            }
          } catch (err) {
            console.error("Failed to sync pending OAuth metadata:", err);
          }
        }
      }
    };

    if (isUserLoaded && clerkUser) {
      syncOauthMetadata();
    }
  }, [clerkUser, isUserLoaded]);

  // Derive user object matching key parameters expected by standard application viewports
  const user = clerkUser
    ? {
        ...clerkUser,
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        email_confirmed_at: clerkUser.primaryEmailAddress?.verification.status === "verified" ? new Date().toISOString() : null,
      }
    : null;

  // Derive premium name and authorization role properties from fullName and publicMetadata.role attributes
  const profile: Profile | null = clerkUser
    ? {
        id: clerkUser.id,
        full_name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress.split("@")[0] || "Guest",
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || (clerkUser.publicMetadata?.phone as string) || pendingSignup?.phone || null,
        role: (clerkUser.publicMetadata?.role as "landlord" | "tenant" | "admin") || "tenant",
        created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
      }
    : null;

  const refreshProfile = async () => {
    if (clerkUser) {
      await clerkUser.reload();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      if (!isSignInLoaded) {
        throw new Error("Secure sign-in module is loading. Please retry in a moment.");
      }

      const attempt = await clerkSignIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        return { user: attempt, profile: null, error: null };
      } else {
        throw new Error(`Authentication incomplete. Unresolved authentication strategy callback status: ${attempt.status}`);
      }
    } catch (err: any) {
      console.error("Clerk sign-in exception:", err);
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
    role: "landlord" | "tenant" | "admin"
  ) => {
    try {
      setLoading(true);
      if (!isSignUpLoaded) {
        throw new Error("Secure sign-up module is loading. Please retry in a moment.");
      }

      const names = fullName.trim().split(/\s+/);
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      // Store selection metadata to apply after email verification
      setPendingSignup({ role, phone });

      // Call signUp.create
      await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Call prepareEmailAddressVerification
      await clerkSignUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setSignUpStep("verifying");
      return { user: clerkSignUp, profile: null, error: null };
    } catch (err: any) {
      console.error("Clerk sign-up initialization exception:", err);
      return { user: null, profile: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async (code: string) => {
    try {
      setLoading(true);
      if (!isSignUpLoaded) {
        throw new Error("Authentication module load failure.");
      }

      // Call attemptEmailAddressVerification
      const result = await clerkSignUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        const userId = result.createdUserId;
        const role = pendingSignup?.role || "tenant";

        // Assign user role in publicMetadata via full-featured backend pipeline proxy callback
        try {
          await fetch("/api/set-role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, role }),
          });
        } catch (apiErr) {
          console.error("Failed to commit user role claims to modern backend registry:", apiErr);
        }

        // Complete the sign-up session process
        await setActive({ session: result.createdSessionId });
        setSignUpStep("completed");
        return { success: true };
      } else {
        throw new Error(`OTP submission signature is incomplete: ${result.status}`);
      }
    } catch (err: any) {
      console.error("Clerk OTP verification failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationOTP = async () => {
    if (!isSignUpLoaded) {
      throw new Error("Authentication module state not synchronized.");
    }
    await clerkSignUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await clerkSignOut();
      setSignUpStep("idle");
      setPendingSignup(null);
    } catch (err: any) {
      console.error("Clerk sign-out error:", err);
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

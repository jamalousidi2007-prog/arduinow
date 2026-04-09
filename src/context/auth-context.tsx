"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Locale, UserProfile, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferredLocale: (locale: Locale) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const mapAuthError = (error: unknown): string => {
  if (!(error instanceof Error)) return "Unexpected authentication error.";

  if (error.message.includes("auth/invalid-credential")) {
    return "Invalid credentials.";
  }
  if (error.message.includes("auth/email-already-in-use")) {
    return "This email is already used.";
  }
  if (error.message.includes("auth/weak-password")) {
    return "Password should be at least 6 characters.";
  }
  if (error.message.includes("auth/network-request-failed")) {
    return "Network issue. Check your internet connection.";
  }
  return error.message;
};

const deriveRole = (email: string): UserRole => {
  const seedAdmin = process.env.NEXT_PUBLIC_SEED_ADMIN_EMAIL;
  if (seedAdmin && seedAdmin.toLowerCase() === email.toLowerCase()) {
    return "admin";
  }
  return "user";
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const profileSubscriptionRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const authSubscription = onAuthStateChanged(auth, async (firebaseUser) => {
      profileSubscriptionRef.current?.();
      profileSubscriptionRef.current = null;

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setLoading(true);

      const userRef = doc(db, "users", firebaseUser.uid);
      const now = Date.now();

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const nextProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "Operator",
            role: deriveRole(firebaseUser.email ?? ""),
            banned: false,
            locale: "en",
            createdAtMs: now,
            lastSeenAtMs: now,
          };
          await setDoc(userRef, nextProfile);
        } else {
          await updateDoc(userRef, { lastSeenAtMs: now });
        }
      } catch (error) {
        setAuthError(mapAuthError(error));
      }

      profileSubscriptionRef.current = onSnapshot(
        userRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setProfile(null);
            setLoading(false);
            return;
          }

          const nextProfile = snapshot.data() as UserProfile;
          if (nextProfile.banned) {
            setAuthError(
              "This account is currently banned by an administrator.",
            );
            setProfile(null);
            void signOut(auth);
            return;
          }

          setAuthError(null);
          setProfile(nextProfile);
          setLoading(false);
        },
        (error) => {
          setAuthError(mapAuthError(error));
          setLoading(false);
        },
      );
    });

    return () => {
      authSubscription();
      profileSubscriptionRef.current?.();
      profileSubscriptionRef.current = null;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await signInWithEmailAndPassword(auth, email, password).catch((error) => {
      const message = mapAuthError(error);
      setAuthError(message);
      throw new Error(message);
    });
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      setAuthError(null);
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      ).catch((error) => {
        const message = mapAuthError(error);
        setAuthError(message);
        throw new Error(message);
      });

      await updateProfile(credential.user, { displayName });

      const now = Date.now();
      const newProfile: UserProfile = {
        uid: credential.user.uid,
        email,
        displayName,
        role: deriveRole(email),
        banned: false,
        locale: "en",
        createdAtMs: now,
        lastSeenAtMs: now,
      };

      await setDoc(doc(db, "users", credential.user.uid), newProfile);
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updatePreferredLocale = useCallback(
    async (locale: Locale) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { locale });
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authError,
      signIn,
      signUp,
      logout,
      updatePreferredLocale,
    }),
    [authError, loading, logout, profile, signIn, signUp, updatePreferredLocale, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};


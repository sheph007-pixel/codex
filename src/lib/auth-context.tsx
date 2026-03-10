"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { DEMO_CRM_USER_ID } from "./demo-data";
import type { User } from "@supabase/supabase-js";

export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

interface AuthState {
  user: User | null;
  crmUserId: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  crmUserId: null,
  loading: true,
  error: null,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Resolve supabase auth user -> CRM users table row
async function resolveCrmUserId(user: User): Promise<string | null> {
  try {
    // Try supabase_auth_id first
    const { data: authRows } = await supabase
      .from("users")
      .select("id")
      .eq("supabase_auth_id", user.id)
      .limit(1);

    if (authRows && authRows.length > 0) {
      return (authRows[0] as { id: string }).id;
    }

    // Fallback: match by email
    const { data: emailRows } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email ?? "")
      .limit(1);

    if (emailRows && emailRows.length > 0) {
      const userId = (emailRows[0] as { id: string }).id;
      // Link supabase_auth_id for future lookups
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("users") as any)
        .update({ supabase_auth_id: user.id })
        .eq("id", userId);
      return userId;
    }
  } catch (err) {
    console.error("Failed to resolve CRM user ID:", err);
  }

  return null;
}

const DEMO_USER = isDemoMode()
  ? ({ id: "demo-user", email: "demo@kennion.crm" } as User)
  : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [crmUserId, setCrmUserId] = useState<string | null>(
    isDemoMode() ? DEMO_CRM_USER_ID : null
  );
  const [loading, setLoading] = useState(!isDemoMode());
  const error: string | null = null;

  useEffect(() => {
    if (isDemoMode()) return;

    // Check existing session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          const id = await resolveCrmUserId(session.user);
          setCrmUserId(id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth session check failed:", err);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const id = await resolveCrmUserId(session.user);
        setCrmUserId(id);
      } else {
        setUser(null);
        setCrmUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error?.message ?? null;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user) {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return signInErr?.message ?? null;
    }
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCrmUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, crmUserId, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

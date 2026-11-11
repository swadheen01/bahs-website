"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  teacherId?: number;
  class?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. If landing on any page with OAuth callback parameters, immediately forward to /auth/callback
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;

      if (
        pathname !== "/auth/callback" &&
        (search.includes("code=") || hash.includes("access_token=") || search.includes("error_description="))
      ) {
        window.location.replace("/auth/callback" + search + hash);
        return;
      }
    }

    refreshUser();

    // 2. Listen to Supabase auth state changes and sync with iron-session if needed
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meRes.ok) {
          const email = session.user.email;
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            email?.split("@")[0] ||
            "ব্যবহারকারী";

          const verifyRes = await fetch("/api/auth/google/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          });

          const data = await verifyRes.json();
          if (data.exists && data.user) {
            setUser(data.user);
          } else if (data.isFirstTime && typeof window !== "undefined" && window.location.pathname !== "/auth/callback") {
            window.location.replace("/auth/callback");
          }
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "লগইন ব্যর্থ হয়েছে" };
    } catch (err) {
      return { success: false, error: "সার্ভার এরর" };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


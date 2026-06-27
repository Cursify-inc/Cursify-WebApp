"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchMe();
    setLoading(false);
  };

  const logout = () => {
    setUser(null);

    // اگر backend logout endpoint داری:
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    window.location.href = "/login";
  };

  useEffect(() => {
    (async () => {
      await refreshUser();
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
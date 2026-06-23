"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth-api";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Completing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Authentication failed. No token found.");
        return;
      }

      window.history.replaceState({}, document.title, "/auth/callback");
      localStorage.setItem("access_token", token);

      try {
        const user = await getCurrentUser(token);
        localStorage.setItem("auth_user", JSON.stringify(user));
        window.location.href = "/dashboard";
      } catch (error) {
        console.error("OAuth callback error:", error);

        // Temporary fallback if /auth/me is blocked by CORS
        window.location.href = "/dashboard";
      }
    };

    handleCallback();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="border border-border bg-background-surface p-6 font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">
        {message}
      </div>
    </main>
  );
}
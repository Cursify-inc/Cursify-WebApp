"use client";

import { useEffect } from "react";

export default function OAuthCallbackPage() {
  useEffect(() => {
    async function finishLogin() {
      try {
        // مهم: cookie خودش ارسال میشه
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("auth failed");

        const user = await res.json();

        // optional: store in global state (zustand / context)
        console.log("user:", user);

        window.location.href = "/dashboard";
      } catch (e) {
        console.error(e);
        window.location.href = "/login";
      }
    }

    finishLogin();
  }, []);

  return (
    <div className="flex h-screen items-center justify-center text-sm text-gray-500">
      Logging you in...
    </div>
  );
}
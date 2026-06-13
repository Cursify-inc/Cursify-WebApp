"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { ReactNode } from "react";
import { AuthBrochure } from "./auth-brochure";
import { GeometricBackground } from "./geometric-background";

export function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: ReactNode;
}) {
  return (
    <main className="auth-page-background relative flex min-h-screen items-center justify-center overflow-hidden p-4 md:p-6">
      <GeometricBackground />

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <AuthBrochure />

        <AnimatePresence mode="wait">
          <motion.section
            key={mode}
            initial={{ opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, y: -12, clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full border border-on-primary-fixed-variant bg-surface-container-lowest shadow-none lg:max-w-[420px]"
          >
            <header className="relative overflow-hidden border-b border-on-primary-fixed-variant bg-surface p-6 text-center">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-container opacity-60" />

              <motion.div
                className="absolute right-4 top-4 h-10 w-10 border border-primary-container/20"
                animate={{ rotate: [0, 45, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="flex items-center justify-center gap-2 text-3xl font-bold tracking-[-0.04em] text-primary">
                <Terminal
                  className="h-8 w-8 text-primary-container"
                  strokeWidth={2.4}
                />
                Cursify
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                {mode === "login" ? "Authentication Array" : "Account Provisioning"}
              </p>
            </header>

            {children}
          </motion.section>
        </AnimatePresence>
      </div>
    </main>
  );
}
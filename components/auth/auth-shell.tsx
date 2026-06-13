"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { ReactNode } from "react";
import { GeometricBackground } from "./geometric-background";

export function AuthShell({ mode, children }: { mode: "login" | "signup"; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 md:p-6">
      <GeometricBackground />
      <AnimatePresence mode="wait">
        <motion.section
          key={mode}
          initial={{ opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, y: -12, clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] border border-on-primary-fixed-variant bg-surface-container-lowest shadow-none"
        >
          <header className="relative overflow-hidden border-b border-on-primary-fixed-variant bg-surface p-6 text-center">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary-container opacity-60" />
            <motion.div
              className="absolute right-4 top-4 h-10 w-10 border border-primary-container/20"
              animate={{ rotate: [0, 45, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex items-center justify-center gap-2 text-3xl font-bold tracking-[-0.04em] text-primary">
              <Terminal className="h-8 w-8 text-primary-container" strokeWidth={2.4} />
              Cursify
            </div>
            <p className=" text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
              {mode === "login" ? "Authentication Array" : "Account Provisioning"}
            </p>
          </header>
          {children}
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

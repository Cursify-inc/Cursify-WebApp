"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  mode: "login" | "signup";
};

export function AuthShell({ children, before, after, mode }: AuthShellProps) {
  const hasSideContent = Boolean(before || after);

  return (
    <main
      className={
        hasSideContent
          ? "auth-page-background grid min-h-screen w-full grid-cols-1 overflow-hidden lg:grid-cols-[42%_58%]"
          : "auth-page-background flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-8"
      }
    >
      {before && (
        <section className="order-1 overflow-hidden border-b border-border bg-transparent lg:min-h-screen lg:border-b-0 lg:border-r">
          {before}
        </section>
      )}

      <section
        className={
          hasSideContent
            ? "order-2 flex w-full bg-transparent lg:order-1 lg:min-h-screen"
            : "flex w-full items-center justify-center"
        }
      >
        <AnimatePresence mode="wait">
          <motion.section
            key={mode}
            initial={{ opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, y: -12, clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={
              hasSideContent
                ? "flex min-h-screen w-full flex-col border-r border-border bg-background-surface shadow-none"
                : "w-full max-w-[430px] border border-border bg-background-surface shadow-none"
            }
          >
            <header className="relative overflow-hidden border-b border-border bg-background-surface p-5 text-center">
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-text-primary opacity-60" />

              <motion.div
                className="absolute right-4 top-4 h-10 w-10 border border-border"
                animate={{ rotate: [0, 45, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="flex items-center justify-center gap-2 text-3xl font-bold tracking-[-0.04em] text-text-primary">
                <Terminal
                  className="h-8 w-8 text-text-primary"
                  strokeWidth={2.4}
                />
                Cursify
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-text-tertiary">
                {mode === "login"
                  ? "Sign in to access your AI-powered IDE"
                  : "Create your Cursify account"}
              </p>
            </header>

            <div
              className={
                hasSideContent ? "flex flex-1 items-center justify-center" : ""
              }
            >
              <div className={hasSideContent ? "w-full max-w-[430px]" : "w-full"}>
                {children}
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
      </section>

      {after && (
        <section className="order-1 overflow-hidden border-b border-border bg-transparent lg:order-2 lg:min-h-screen lg:border-b-0 lg:border-l">
          {after}
        </section>
      )}
    </main>
  );
}
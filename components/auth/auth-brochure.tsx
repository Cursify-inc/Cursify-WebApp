"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, Cpu, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Elevate your workspace with AI",
    description:
      "Unlock the potential of your daily tasks with intelligent automation. Cursify streamlines your workflow so you can focus on what truly matters.",
    label: "Cursify Premium",
    code: "8492",
    member: "Alex Chen",
    icon: Sparkles,
    primary: "from-violet-600 via-fuchsia-500 to-indigo-600",
    backOne: "bg-emerald-300",
    backTwo: "bg-orange-300",
  },
  {
    title: "Build smarter learning paths",
    description:
      "Personalized AI recommendations help users discover the right lessons, track progress, and improve skills faster.",
    label: "AI Learning",
    code: "2048",
    member: "Mina AI",
    icon: BrainCircuit,
    primary: "from-blue-600 via-cyan-500 to-violet-600",
    backOne: "bg-pink-300",
    backTwo: "bg-teal-300",
  },
  {
    title: "Automate your workflow",
    description:
      "Let intelligent systems organize content, analyze behavior, and suggest the next best action inside your workspace.",
    label: "Smart Flow",
    code: "7310",
    member: "Cursify Bot",
    icon: Cpu,
    primary: "from-slate-900 via-indigo-600 to-purple-600",
    backOne: "bg-sky-300",
    backTwo: "bg-rose-300",
  },
];

function MiniCardContent({
  title,
  code,
  type,
}: {
  title: string;
  code: string;
  type: "insight" | "automation";
}) {
  return (
    <div className="flex h-full flex-col justify-between p-5 text-left text-slate-900">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
          {type === "insight" ? "AI Insight" : "Auto Flow"}
        </p>
        <p className="mt-2 max-w-[180px] truncate text-base font-black">
          {title}
        </p>
      </div>

      <div>
        <div className="mb-2 h-2 w-32 rounded-full bg-black/15" />
        <div className="h-2 w-20 rounded-full bg-black/10" />

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-2xl font-black tracking-[0.08em]">
            {code}
          </span>
          <span className="rounded-full bg-white/55 px-3 py-1 text-[10px] font-bold uppercase">
            AI
          </span>
        </div>
      </div>
    </div>
  );
}

export function AuthBrochure() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[activeIndex];
  const Icon = activeSlide.icon;

  return (
    <section className="flex min-h-[420px] h-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-[720px] text-center">
        <div className="relative mx-auto h-[360px] max-w-[560px] md:h-[420px]">
          <motion.div
            className={`absolute left-4 top-24 h-52 w-72 cursor-pointer overflow-hidden rounded-3xl ${activeSlide.backTwo} opacity-95 shadow-2xl md:left-10 md:top-32 md:h-56 md:w-80`}
            initial={{ y: 0, rotate: -8, scale: 1, zIndex: 1 }}
            animate={{
              y: [0, 10, 0],
              rotate: [-8, -5, -8],
              scale: 1,
              zIndex: 1,
            }}
            whileHover={{
              y: -12,
              rotate: -3,
              scale: 1.06,
              zIndex: 30,
              opacity: 1,
              boxShadow: "0 32px 70px rgba(251, 146, 60, 0.35)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <MiniCardContent
              title={activeSlide.label}
              code={activeSlide.code}
              type="automation"
            />
          </motion.div>

          <motion.div
            className={`absolute right-4 top-14 h-52 w-72 cursor-pointer overflow-hidden rounded-3xl ${activeSlide.backOne} opacity-95 shadow-2xl md:right-6 md:top-20 md:h-56 md:w-80`}
            initial={{ y: 0, rotate: 10, scale: 1, zIndex: 2 }}
            animate={{
              y: [0, -9, 0],
              rotate: [10, 7, 10],
              scale: 1,
              zIndex: 2,
            }}
            whileHover={{
              y: -12,
              rotate: 3,
              scale: 1.06,
              zIndex: 30,
              opacity: 1,
              boxShadow: "0 32px 70px rgba(45, 212, 191, 0.35)",
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <MiniCardContent
              title={activeSlide.title}
              code={activeSlide.code}
              type="insight"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.title}
              initial={{ opacity: 0, y: 20, rotate: -2, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotate: -8, scale: 1 }}
              exit={{ opacity: 0, y: -16, rotate: -12, scale: 0.96 }}
              whileHover={{
                y: -12,
                rotate: -4,
                scale: 1.04,
                zIndex: 40,
                boxShadow: "0 36px 80px rgba(79, 70, 229, 0.34)",
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`absolute left-1/2 top-8 z-10 h-60 w-[22rem] -translate-x-1/2 cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br ${activeSlide.primary} p-6 text-left text-white shadow-2xl md:h-64 md:w-[26rem] md:p-7`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-lg font-black leading-none">
                    {activeSlide.label}
                  </p>
                  <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
                    Workspace Access
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xl tracking-[0.3em] text-white/90">
                <span>****</span>
                <span>****</span>
                <span>****</span>
              </div>

              <p className="mt-3 text-center font-mono text-3xl tracking-[0.08em]">
                {activeSlide.code}
              </p>

              <div className="mt-7 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase text-white/50">
                    Member
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {activeSlide.member}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-bold uppercase text-white/50">
                    Expires
                  </p>
                  <p className="text-sm font-semibold">12/28</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-[460px] border border-border bg-background-surface/85 p-5 text-center shadow-xl backdrop-blur-md"
          >
            <h2 className="mx-auto max-w-[390px] text-2xl font-black tracking-[-0.03em] text-text-primary">
              {activeSlide.title}
            </h2>

            <p className="mx-auto mt-4 max-w-[410px] text-sm leading-7 text-text-secondary">
              {activeSlide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show brochure slide ${index + 1}`}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
  activeIndex === index
    ? "w-10 bg-indigo-600"
    : "w-8 border hover:w-10 hover:bg-slate-300"
}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
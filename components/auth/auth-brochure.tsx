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
    <div className="flex h-full flex-col justify-between p-4 text-left text-slate-900">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-60">
          {type === "insight" ? "AI Insight" : "Auto Flow"}
        </p>
        <p className="mt-1 max-w-[140px] truncate text-sm font-black">
          {title}
        </p>
      </div>

      <div>
        <div className="mb-2 h-1.5 w-24 rounded-full bg-black/15" />
        <div className="h-1.5 w-16 rounded-full bg-black/10" />

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-lg font-black tracking-[0.08em]">
            {code}
          </span>
          <span className="rounded-full bg-white/55 px-2 py-1 text-[9px] font-bold uppercase">
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
    <section className="p-6">
      <div className="overflow-hidden rounded-[2rem]  bg-[#f7f8ff] p-10 text-center">
        <div className="relative mx-auto h-[220px] max-w-[310px]">
          <motion.div
            className={`absolute left-5 top-16 h-36 w-52 cursor-pointer overflow-hidden rounded-2xl ${activeSlide.backTwo} opacity-90 shadow-xl`}
            initial={{ y: 0, rotate: -8, scale: 1, zIndex: 1 }}
            animate={{
              y: [0, 8, 0],
              rotate: [-8, -5, -8],
              scale: 1,
              zIndex: 1,
            }}
            whileHover={{
              y: -10,
              rotate: -3,
              scale: 1.08,
              zIndex: 30,
              opacity: 1,
              boxShadow: "0 28px 60px rgba(251, 146, 60, 0.35)",
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
            className={`absolute right-1 top-10 h-36 w-52 cursor-pointer overflow-hidden rounded-2xl ${activeSlide.backOne} opacity-90 shadow-xl`}
            initial={{ y: 0, rotate: 10, scale: 1, zIndex: 2 }}
            animate={{
              y: [0, -7, 0],
              rotate: [10, 7, 10],
              scale: 1,
              zIndex: 2,
            }}
            whileHover={{
              y: -10,
              rotate: 3,
              scale: 1.08,
              zIndex: 30,
              opacity: 1,
              boxShadow: "0 28px 60px rgba(45, 212, 191, 0.35)",
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
                y: -10,
                rotate: -4,
                scale: 1.04,
                zIndex: 40,
                boxShadow: "0 30px 70px rgba(79, 70, 229, 0.32)",
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`absolute left-1/2 top-8 z-10 h-40 w-64 -translate-x-1/2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${activeSlide.primary} p-4 text-left text-white shadow-2xl`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black leading-none">
                    {activeSlide.label}
                  </p>
                  <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">
                    Workspace Access
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 font-mono text-base tracking-[0.3em] text-white/90">
                <span>****</span>
                <span>****</span>
                <span>****</span>
              </div>

              <p className="mt-1 text-center font-mono text-xl tracking-[0.08em]">
                {activeSlide.code}
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase text-white/50">
                    Member
                  </p>
                  <p className="truncate text-xs font-semibold">
                    {activeSlide.member}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[8px] font-bold uppercase text-white/50">
                    Expires
                  </p>
                  <p className="text-xs font-semibold">12/28</p>
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
          >
            <h2 className="mx-auto max-w-[320px] text-xl font-black tracking-[-0.03em] text-[#111827]">
              {activeSlide.title}
            </h2>

            <p className="mx-auto mt-4 max-w-[330px] text-sm leading-7 text-[#6b7280]">
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
                  : "w-8 bg-slate-200 hover:w-10 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
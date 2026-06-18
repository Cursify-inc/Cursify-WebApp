"use client";

import { motion } from "framer-motion";

export function GeometricBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <motion.svg
        className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 text-primary opacity-[0.08] dark:text-text-secondary dark:opacity-[0.38]"
        fill="currentColor"
        viewBox="0 0 100 100"
        animate={{ rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <polygon points="0,0 100,0 0,100" />
      </motion.svg>

      <motion.svg
        className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 text-primary-container opacity-[0.1] dark:text-text-secondary dark:opacity-[0.42]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 100 100"
        animate={{ rotate: [0, -6, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect
          height="80"
          transform="rotate(45 50 50)"
          width="80"
          x="10"
          y="10"
        />
        <line x1="0" x2="100" y1="50" y2="50" />
        <line x1="50" x2="50" y1="0" y2="100" />
      </motion.svg>

      <motion.div
        className="absolute left-[10%] top-[18%] h-24 w-24 border border-primary-container/15 dark:border-text-secondary/60"
        animate={{ y: [0, 14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[18%] left-[18%] h-16 w-40 -skew-x-12 border border-primary-container/15 dark:border-text-secondary/60"
        animate={{ x: [0, 16, 0], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute right-[14%] top-[20%] h-20 w-20 rotate-45 border border-surface-tint/15 dark:border-text-secondary/60"
        animate={{ y: [0, -18, 0], rotate: [45, 65, 45] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[28%] right-[12%] h-px w-52 bg-primary-container/20 dark:bg-text-secondary/60"
        animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
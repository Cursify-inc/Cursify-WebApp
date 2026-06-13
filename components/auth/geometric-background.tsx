"use client";

import { motion } from "framer-motion";

export function GeometricBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.svg
        className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 text-primary opacity-[0.06]"
        fill="currentColor"
        viewBox="0 0 100 100"
        animate={{ rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <polygon points="0,0 100,0 0,100" />
      </motion.svg>
      <motion.svg
        className="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/3 text-primary-container opacity-[0.08]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 100 100"
        animate={{ rotate: [0, -6, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect height="80" transform="rotate(45 50 50)" width="80" x="10" y="10" />
        <line x1="0" x2="100" y1="50" y2="50" />
        <line x1="50" x2="50" y1="0" y2="100" />
      </motion.svg>
      <div className="absolute left-[10%] top-[18%] h-24 w-24 border border-primary-container/10" />
      <div className="absolute bottom-[18%] left-[18%] h-16 w-40 -skew-x-12 border border-primary-container/10" />
    </div>
  );
}

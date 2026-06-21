"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

type BadgeProps = {
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
    animated?: boolean;
};

export function Badge({
                          children,
                          className,
                          icon = <Sparkles className="h-3.5 w-3.5" />,
                          animated = true,
                      }: BadgeProps) {
    const reducedMotion = useReducedMotion();

    return (
        <motion.span
            animate={
                animated && !reducedMotion
                    ? { y: [0, -6, 0] }
                    : {}
            }
            transition={{ duration: 5, repeat: Infinity }}
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                "border border-white/10",
                "backdrop-blur-md",
                "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
                "text-white/90",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_14px_rgba(0,0,0,0.45)]",
                "hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]",
                "transition-shadow duration-300",
                className
            )}
        >
            {icon}
            {children}
        </motion.span>
    );
}

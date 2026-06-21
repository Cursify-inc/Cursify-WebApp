import * as React from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "pill" | "card" | "inline";
type SurfaceSize = "sm" | "md" | "lg";

type SurfaceProps = {
    children: React.ReactNode;
    className?: string;
    variant?: SurfaceVariant;
    size?: SurfaceSize;
};

const variantStyles: Record<SurfaceVariant, string> = {
    pill: "inline-flex w-fit max-w-full items-center rounded-full",
    inline: "inline-flex w-fit max-w-full items-center rounded-xl",
    card: "w-fit max-w-full rounded-3xl",
};

const sizeStyles: Record<SurfaceSize, string> = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "p-6",
};

export function Surface({
                            children,
                            className,
                            variant = "card",
                            size = "md",
                        }: SurfaceProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden border backdrop-blur-xl",
                "border-white/10",
                "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]",
                "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_40%)] opacity-40"
            />

            <div className="relative z-10">{children}</div>
        </div>
    );
}

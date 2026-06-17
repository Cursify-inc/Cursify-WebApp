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
                "theme-color-fade box-border h-fit min-w-0 border shadow-[var(--trusted-strip-shadow)] backdrop-blur-xl",
                "bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
        </div>
    );
}

import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
    children: React.ReactNode;
    className?: string;
};

export function Badge({ children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "theme-color-fade inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                "border shadow-sm backdrop-blur",
                "bg-[var(--badge-bg)] text-[var(--badge-text)] border-[var(--badge-border)]",
                className
            )}
        >
            {children}
        </span>
    );
}

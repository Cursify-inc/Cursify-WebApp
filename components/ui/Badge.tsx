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
                // Base layout & typography
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur",
                // Theme-aware colors via CSS variables
                "bg-[rgb(var(--badge-bg)/var(--badge-bg-opacity))]",
                "text-[hsl(var(--badge-text))]", /* Use rgb() or hsl() depending on how your brand variable is formatted */
                "border border-[rgb(var(--badge-border)/var(--badge-border-opacity))]",
                className
            )}
        >
            {children}
        </span>

    );
}

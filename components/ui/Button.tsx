import Link from "next/link"
import { cn } from "@/lib/utils"

type ButtonProps = {
    children: React.ReactNode
    href?: string
    variant?: "primary" | "secondary" | "ghost"
    size?: "sm" | "md" | "lg"
    className?: string
}

export function Button({
                           children,
                           href,
                           variant = "primary",
                           size = "md",
                           className
                       }: ButtonProps) {
    const classes = cn(
        "focus-ring inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
        "bg-brand text-text-inverse shadow-soft hover:-translate-y-0.5 hover:bg-brand-hover",
        variant === "secondary" &&
        "border border-border bg-background-surface text-text-primary hover:-translate-y-0.5 hover:border-brand-light hover:shadow-soft",
        variant === "ghost" &&
        "text-text-secondary hover:bg-black/5 hover:text-text-primary dark:hover:bg-white/10",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-13 px-7 py-4 text-base",
        className
    )

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        )
    }

    return <button className={classes}>{children}</button>
}

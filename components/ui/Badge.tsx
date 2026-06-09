import { cn } from "@/lib/utils"

type BadgeProps = {
    children: React.ReactNode
    className?: string
}

export function Badge({ children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border border-brand/15 " +
                "bg-white/70 px-3 py-1 text-xs font-semibold text-brand shadow-sm backdrop-blur " +
                "dark:bg-white/5 dark:text-brand-light",
                className
            )}
        >
      {children}
    </span>
    )
}

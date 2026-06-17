"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useThemeFx } from "@/components/providers/theme-fx-provider"

const subscribe = () => () => {}

function useIsClient() {
    return React.useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, resolvedTheme } = useTheme()
    const { burst } = useThemeFx()
    const buttonRef = React.useRef<HTMLButtonElement | null>(null)

    const mounted = useIsClient()
    const [busy, setBusy] = React.useState(false)

    const isDark = resolvedTheme === "dark"

    const toggleTheme = async (
        event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
    ) => {
        if (!mounted || busy) return

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const button = buttonRef.current
        const nextTheme = (isDark ? "light" : "dark") as "light" | "dark"

        if (!button || reduceMotion) {
            setTheme(nextTheme)
            return
        }

        setBusy(true)

        const rect = button.getBoundingClientRect()

        let x = rect.left + rect.width / 2
        let y = rect.top + rect.height / 2

        if ("clientX" in event && event.clientX !== 0) {
            x = event.clientX
            y = event.clientY
        }

        document.documentElement.classList.add("theme-transition")

        void document.documentElement.offsetWidth

        setTheme(nextTheme)

        await burst({ x, y, nextTheme })

        document.documentElement.classList.remove("theme-transition")
        setBusy(false)
    }

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={toggleTheme}
            onKeyDown={(evt) => {
                if (evt.key === "Enter" || evt.key === " ") {
                    evt.preventDefault()
                }
            }}
            aria-label="Toggle theme"
            disabled={busy}
            className={cn(
                "group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border",
                "bg-background-surface/80 text-text-primary backdrop-blur-md",
                "transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]",
                busy && "pointer-events-none opacity-80",
                className
            )}
        >
            {!mounted ? (
                <span className="h-4 w-4" />
            ) : isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            )}
        </button>
    )
}

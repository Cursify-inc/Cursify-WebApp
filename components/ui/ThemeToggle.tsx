"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

type ViewTransition = {
    ready: Promise<void>
    finished: Promise<void>
    updateCallbackDone: Promise<void>
}

type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
}

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, resolvedTheme } = useTheme()
    const buttonRef = React.useRef<HTMLButtonElement | null>(null)

    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = resolvedTheme === "dark"

    const toggleTheme = async () => {
        if (!mounted) return

        const nextTheme = isDark ? "light" : "dark"
        const doc = document as ViewTransitionDocument
        const button = buttonRef.current
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        if (!button || !doc.startViewTransition || reduceMotion) {
            setTheme(nextTheme)
            return
        }

        const rect = button.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2

        document.documentElement.style.setProperty("--theme-x", `${x}px`)
        document.documentElement.style.setProperty("--theme-y", `${y}px`)

        const transition = doc.startViewTransition(() => {
            setTheme(nextTheme)
        })

        await transition.finished
    }

    return (
        <button
            ref={buttonRef}
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
                "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border",
                "bg-background-surface/80 text-text-primary backdrop-blur-md",
                "transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]",
                className
            )}
        >
            <span className="sr-only">Toggle theme</span>

            {!mounted ? (
                <span className="h-4 w-4" aria-hidden="true" />
            ) : isDark ? (
                <Sun className="h-4 w-4 transition-transform duration-300" aria-hidden="true" />
            ) : (
                <Moon className="h-4 w-4 transition-transform duration-300" aria-hidden="true" />
            )}
        </button>
    )
}

"use client"

import * as React from "react"
import { createPortal } from "react-dom"
type ThemeName = "light" | "dark"

type FxPayload = {
    x: number
    y: number
    nextTheme: ThemeName
}

type ThemeFxContextValue = {
    burst: (payload: FxPayload) => Promise<void>
}

const ThemeFxContext = React.createContext<ThemeFxContextValue | null>(null)

const subscribe = () => () => {}

export function useIsClient() {
    return React.useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}

export function useThemeFx() {
    const ctx = React.useContext(ThemeFxContext)
    if (!ctx) throw new Error("useThemeFx must be used inside ThemeFxProvider")
    return ctx
}

type FxState = {
    id: number
    x: number
    y: number
    fill: string
    neon: string
    fillScale: number
    ringScale: number
} | null

type FxVars = React.CSSProperties & {
    "--fx-fill"?: string
    "--fx-neon"?: string
    "--fx-fill-scale"?: string
    "--fx-ring-scale"?: string
}

export function ThemeFxProvider({ children }: { children: React.ReactNode }) {
    const mounted = useIsClient()
    const [fx, setFx] = React.useState<FxState>(null)

    const resolveRef = React.useRef<null | (() => void)>(null)

    const burst = React.useCallback(({ x, y, nextTheme }: FxPayload) => {
        return new Promise<void>((resolve) => {
            resolveRef.current?.()
            resolveRef.current = resolve

            const maxX = Math.max(x, window.innerWidth - x)
            const maxY = Math.max(y, window.innerHeight - y)
            const endRadius = Math.hypot(maxX, maxY)

            setFx({
                id: Date.now(),
                x,
                y,
                fill:
                    nextTheme === "dark"
                        ? "hsl(226 55% 5%)"
                        : "hsl(210 35% 96%)",
                neon: nextTheme === "dark" ? "hsl(195 100% 62%)" : "hsl(258 95% 60%)",
                fillScale: endRadius / 12,
                ringScale: endRadius / 18,
            })
        })
    }, [])

    const style: FxVars | undefined = fx
        ? {
            left: `${fx.x}px`,
            top: `${fx.y}px`,
            "--fx-fill": fx.fill,
            "--fx-neon": fx.neon,
            "--fx-fill-scale": `${fx.fillScale}`,
            "--fx-ring-scale": `${fx.ringScale}`,
        }
        : undefined

    return (
        <ThemeFxContext.Provider value={{ burst }}>
            {children}

            {mounted &&
                fx &&
                createPortal(
                    <div
                        key={fx.id}
                        className="theme-fx-wrap"
                        style={style}
                        aria-hidden="true"
                    >
                        <span
                            className="theme-fx-fill"
                            onAnimationEnd={() => {
                                resolveRef.current?.()
                                resolveRef.current = null
                                setFx(null)
                            }}
                        />

                        <span className="theme-fx-ring" />
                    </div>,
                    document.body
                )}
        </ThemeFxContext.Provider>
    )
}

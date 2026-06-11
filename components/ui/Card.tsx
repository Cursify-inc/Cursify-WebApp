"use client"

import * as React from "react"
import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type UseInViewOptions,
} from "framer-motion"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

const AutoEdgeLight = dynamic(
    () => import("@/components/ui/AutoEdgeLight").then((mod) => mod.AutoEdgeLight),
    { ssr: false }
)
import type { AutoEdgeLightProProps } from "@/components/ui/AutoEdgeLight"

type ViewportMargin = UseInViewOptions["margin"]

const DEFAULT_VIEWPORT_MARGIN = "0px 0px -160px 0px" satisfies NonNullable<UseInViewOptions["margin"]>

export type CardProps = {
    children: React.ReactNode
    className?: string
    contentClassName?: string
    interactive?: boolean
    glow?: boolean
    animateIn?: boolean
    delay?: number
    edgeLightProps?: Omit<
        AutoEdgeLightProProps,
        "active" | "reducedMotion" | "parentRef"
    >
    activateGlowOnReveal?: boolean
    revealGlowDurationMs?: number
    revealGlowDelayMs?: number
    revealViewportMargin?: ViewportMargin
}

export function Card({
                         children,
                         className,
                         contentClassName,
                         interactive = false,
                         glow = false,
                         animateIn = false,
                         delay = 0,
                         edgeLightProps,
                         activateGlowOnReveal = false,
                         revealGlowDurationMs = 1200,
                         revealGlowDelayMs = 0,
                         revealViewportMargin = DEFAULT_VIEWPORT_MARGIN,
                     }: CardProps) {
    const reducedMotion = useReducedMotion()
    const cardRef = React.useRef<HTMLDivElement>(null)
    const [active, setActive] = React.useState(false)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateXRaw = useTransform(mouseY, (y) => {
        const el = cardRef.current
        if (!el) return 0
        const h = el.clientHeight || 1
        const py = y / h - 0.5
        return -(py * 8)
    })

    const rotateYRaw = useTransform(mouseX, (x) => {
        const el = cardRef.current
        if (!el) return 0
        const w = el.clientWidth || 1
        const px = x / w - 0.5
        return px * 8
    })

    const rotateX = useSpring(rotateXRaw, { stiffness: 240, damping: 26, mass: 0.7 })
    const rotateY = useSpring(rotateYRaw, { stiffness: 240, damping: 26, mass: 0.7 })

    const showInteractive = interactive && !reducedMotion
    const pointerGlowActive = glow && active

    const inView = useInView(cardRef, {
        once: true,
        margin: revealViewportMargin,
    })

    const [revealActive, setRevealActive] = React.useState(false)
    const hasRevealedRef = React.useRef(false)
    const startTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const endTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearTimers = React.useCallback(() => {
        if (startTimeoutRef.current) {
            clearTimeout(startTimeoutRef.current)
            startTimeoutRef.current = null
        }
        if (endTimeoutRef.current) {
            clearTimeout(endTimeoutRef.current)
            endTimeoutRef.current = null
        }
    }, [])

    React.useEffect(() => {
        if (!activateGlowOnReveal || !inView || hasRevealedRef.current) return

        hasRevealedRef.current = true

        startTimeoutRef.current = setTimeout(() => {
            setRevealActive(true)
            endTimeoutRef.current = setTimeout(() => {
                setRevealActive(false)
            }, Math.max(0, revealGlowDurationMs))
        }, Math.max(0, revealGlowDelayMs))

        return clearTimers
    }, [
        activateGlowOnReveal,
        inView,
        revealGlowDelayMs,
        revealGlowDurationMs,
        clearTimers,
    ])

    React.useEffect(() => clearTimers, [clearTimers])

    const glowActive = pointerGlowActive || revealActive

    const updateMouseFromEvent = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            const rect = cardRef.current?.getBoundingClientRect()
            if (!rect) return
            mouseX.set(e.clientX - rect.left)
            mouseY.set(e.clientY - rect.top)
        },
        [mouseX, mouseY]
    )

    const handlePointerMove = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!showInteractive) return
            updateMouseFromEvent(e)
        },
        [showInteractive, updateMouseFromEvent]
    )

    const handlePointerEnter = React.useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!showInteractive) return
            setActive(true)
            updateMouseFromEvent(e)
        },
        [showInteractive, updateMouseFromEvent]
    )

    const handlePointerLeave = React.useCallback(() => {
        setActive(false)
        const el = cardRef.current
        if (!el) {
            mouseX.set(0)
            mouseY.set(0)
            return
        }
        mouseX.set(el.clientWidth / 2)
        mouseY.set(el.clientHeight / 2)
    }, [mouseX, mouseY])

    return (
        <motion.div
            ref={cardRef}
            className={cn("relative h-full w-full transform-gpu will-change-transform", className)}
            style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                rotateX: showInteractive ? rotateX : 0,
                rotateY: showInteractive ? rotateY : 0,
            }}
            onPointerEnter={handlePointerEnter}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            whileHover={
                showInteractive
                    ? { y: -3, scale: 1.01, transition: { duration: 0.18, ease: "easeOut" } }
                    : undefined
            }
            initial={animateIn ? { opacity: 0, y: 10 } : undefined}
            animate={animateIn ? { opacity: 1, y: 0 } : undefined}
            transition={
                animateIn
                    ? { duration: 0.35, ease: "easeOut", delay: delay * 0.06 }
                    : undefined
            }
        >
            {glow ? (
                <AutoEdgeLight
                    active={glowActive}
                    reducedMotion={!!reducedMotion}
                    parentRef={cardRef}
                    className="rounded-[inherit]"
                    {...edgeLightProps}
                />
            ) : null}

            <div
                className={cn(
                    "card-surface relative h-full overflow-hidden rounded-[inherit] shadow-(--card-shadow)",
                    contentClassName
                )}
            >
                {glowActive ? (
                    <div className="pointer-events-none absolute inset-0 z-1 rounded-[inherit]" />
                ) : null}

                <div className="relative z-2 h-full">{children}</div>
            </div>
        </motion.div>
    )
}

export default Card

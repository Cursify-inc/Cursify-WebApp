"use client"

import * as React from "react"
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
} from "framer-motion"
import { cn } from "@/lib/utils"
import { AutoEdgeLight } from "@/components/ui/AutoEdgeLight"

type AutoEdgeLightProps = React.ComponentProps<typeof AutoEdgeLight>

type CardProps = {
    children: React.ReactNode
    className?: string
    contentClassName?: string
    interactive?: boolean
    glow?: boolean
    animateIn?: boolean
    delay?: number
    edgeLightProps?: Omit<AutoEdgeLightProps, "active" | "reducedMotion" | "parentRef">
}

function getCssVar(el: HTMLElement, name: string, fallback: string) {
    const v = getComputedStyle(el).getPropertyValue(name).trim()
    return v || fallback
}

export function Card({
                         children,
                         className,
                         contentClassName,
                         interactive = true,
                         glow = true,
                         animateIn = false,
                         delay = 0,
                         edgeLightProps,
                     }: CardProps) {
    const reducedMotion = useReducedMotion() ?? false
    const [active, setActive] = React.useState(false)
    const cardRef = React.useRef<HTMLDivElement>(null)

    const [spotlightColor, setSpotlightColor] = React.useState("rgba(56,189,248,0.12)")
    const [spotlightStop, setSpotlightStop] = React.useState("34%")

    React.useEffect(() => {
        const read = () => {
            const host = cardRef.current ?? document.documentElement
            setSpotlightColor(getCssVar(host, "--card-spotlight-color", "rgba(56,189,248,0.12)"))
            setSpotlightStop(getCssVar(host, "--card-spotlight-stop", "34%"))
        }

        read()

        const mo = new MutationObserver(read)
        mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"],
        })

        return () => mo.disconnect()
    }, [])

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
        stiffness: 140,
        damping: 18,
    })

    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
        stiffness: 140,
        damping: 18,
    })

    const glowX = useTransform(mouseX, [-0.5, 0.5], ["35%", "65%"])
    const glowY = useTransform(mouseY, [-0.5, 0.5], ["30%", "70%"])

    const spotlight = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, ${spotlightColor}, transparent ${spotlightStop})`

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || reducedMotion || !interactive) return

        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5

        mouseX.set(x)
        mouseY.set(y)
    }

    const resetMouse = () => {
        mouseX.set(0)
        mouseY.set(0)
        setActive(false)
    }

    const showInteractiveGlow = active && glow && interactive && !reducedMotion

    return (
        <motion.div
            ref={cardRef}
            initial={
                animateIn
                    ? reducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 22 }
                    : undefined
            }
            whileInView={
                animateIn
                    ? reducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0 }
                    : undefined
            }
            viewport={animateIn ? { once: true, amount: 0.2 } : undefined}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMouse}
            onPointerEnter={() => {
                if (interactive) setActive(true)
            }}
            style={{
                rotateX: reducedMotion || !interactive ? 0 : rotateX,
                rotateY: reducedMotion || !interactive ? 0 : rotateY,
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
            }}
            whileHover={reducedMotion || !interactive ? undefined : { y: -4, scale: 1.01 }}
            transition={
                animateIn
                    ? { duration: 0.45, delay, ease: "easeOut" }
                    : { type: "spring", stiffness: 220, damping: 18 }
            }
            className={cn(
                "group relative isolate overflow-hidden rounded-[28px] will-change-transform transform-[translateZ(0)]",
                className
            )}
        >
            <AutoEdgeLight
                active={showInteractiveGlow}
                reducedMotion={reducedMotion}
                parentRef={cardRef}
                className="rounded-[inherit]"
                {...edgeLightProps}
            />

            <div
                className={cn(
                    "card-surface relative overflow-hidden rounded-[27px] shadow-(--card-shadow)",
                    contentClassName
                )}
            >
                {showInteractiveGlow && (
                    <>
                        <div aria-hidden="true" className="card-overlay pointer-events-none absolute inset-px rounded-[27px]" />

                        <motion.div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-px rounded-[26px]"
                            style={{ background: spotlight }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                        />

                        <div aria-hidden="true" className="card-top-line pointer-events-none absolute inset-x-6 top-0 h-px" />

                        <div aria-hidden="true" className="card-bottom-line pointer-events-none absolute inset-x-8 bottom-0 h-px" />
                    </>
                )}

                <div className="relative z-10">{children}</div>
            </div>
        </motion.div>
    )
}

"use client";

import { RefObject, useCallback, useEffect, useState } from "react";

type Options = {
    closeOnOutsideTap?: boolean;
};

export function useUnifiedCardInteraction(
    ref: RefObject<HTMLElement | null>,
    options: Options = { closeOnOutsideTap: true }
) {
    const [active, setActive] = useState(false);

    const onPointerEnter = useCallback((e: React.PointerEvent) => {
        // Hover-like activation for mouse
        if (e.pointerType === "mouse") setActive(true);
    }, []);

    const onPointerLeave = useCallback((e: React.PointerEvent) => {
        // Hover-like deactivation for mouse
        if (e.pointerType === "mouse") setActive(false);
    }, []);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        // Touch/pen tap toggles state (mobile fix)
        if (e.pointerType === "touch" || e.pointerType === "pen") {
            setActive((prev) => !prev);
        }
        // Mouse press activates immediately for parity of "press feel"
        if (e.pointerType === "mouse") {
            setActive(true);
        }
    }, []);

    // Optional: outside tap/click closes it (prevents "stuck active" on mobile)
    useEffect(() => {
        if (!options.closeOnOutsideTap) return;

        const handleOutside = (ev: PointerEvent) => {
            const node = ref.current;
            if (!node) return;
            if (!node.contains(ev.target as Node)) {
                setActive(false);
            }
        };

        document.addEventListener("pointerdown", handleOutside, { passive: true });
        return () => document.removeEventListener("pointerdown", handleOutside);
    }, [ref, options.closeOnOutsideTap]);

    return {
        active,
        setActive,
        bind: {
            onPointerEnter,
            onPointerLeave,
            onPointerDown,
        },
    };
}

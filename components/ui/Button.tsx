"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type CommonButtonProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    disabled?: boolean;
    "aria-label"?: string;
};

type LinkButtonProps = CommonButtonProps & {
    href: string;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
};

type NativeButtonProps = CommonButtonProps & {
    type?: "button" | "submit" | "reset";
};

type ButtonProps = LinkButtonProps | NativeButtonProps;

const SIZE_CLASSES = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 py-4 text-base",
};

export function Button(props: ButtonProps) {
    const {
        children,
        size = "md",
        className,
        disabled,
    } = props;

    const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        e.currentTarget.style.setProperty("--x", `${x}px`);
        e.currentTarget.style.setProperty("--y", `${y}px`);
    };

    const root = cn(
        "group/button relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
        "transition-all duration-200",
        "focus-ring",
        SIZE_CLASSES[size],
        className
    );

    const content = (
        <>
      <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"
          style={{
              background:
                  "radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(99,102,241,0.25), transparent 40%)",
          }}
      />

            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </>
    );

    if ("href" in props) {
        return (
            <Link
                href={props.href}
                className={root}
                onPointerMove={handlePointerMove}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={props.type ?? "button"}
            className={root}
            onPointerMove={handlePointerMove}
            disabled={disabled}
        >
            {content}
        </button>
    );
}

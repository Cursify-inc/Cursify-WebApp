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
    type?: never;
};

type NativeButtonProps = CommonButtonProps & {
    href?: never;
    type?: "button" | "submit" | "reset";
    target?: never;
    rel?: never;
};

type ButtonProps = LinkButtonProps | NativeButtonProps;

const SIZE_CLASSES: Record<ButtonSize, string> = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 py-4 text-base",
};

const ROOT_VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary: cn(
        "text-[var(--button-primary-text)]",
        "shadow-[var(--button-primary-shadow)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--button-primary-shadow-hover)]",
        "active:translate-y-0 active:scale-[0.99]"
    ),
    secondary: cn(
        "text-[var(--button-secondary-text)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--button-secondary-shadow-hover)]",
        "active:translate-y-0 active:scale-[0.99]"
    ),
    ghost: cn(
        "text-[var(--button-ghost-text)]",
        "hover:text-[var(--button-ghost-text-hover)]",
        "active:scale-[0.99]"
    ),
};

const SURFACE_CLASSES: Record<ButtonVariant, string> = {
    primary: cn(
        "bg-linear-to-b",
        "from-[var(--button-primary-bg-from)]",
        "to-[var(--button-primary-bg-to)]",
        "group-hover/button:from-[var(--button-primary-bg-hover-from)]",
        "group-hover/button:to-[var(--button-primary-bg-hover-to)]"
    ),
    secondary: cn(
        "border border-[var(--button-secondary-border)]",
        "bg-[var(--button-secondary-bg)]",
        "group-hover/button:border-[var(--button-secondary-border-hover)]",
        "group-hover/button:bg-[var(--button-secondary-bg-hover)]"
    ),
    ghost: cn(
        "bg-transparent",
        "group-hover/button:bg-[var(--button-ghost-bg-hover)]"
    ),
};

export function Button(props: ButtonProps) {
    const {
        children,
        variant = "primary",
        size = "md",
        className,
        disabled = false,
        "aria-label": ariaLabel,
    } = props;

    const rootClasses = cn(
        "focus-ring theme-color-fade group/button relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-semibold",
        "outline-none select-none",
        "transition-[transform,box-shadow,color,background-color,border-color] duration-200 ease-out",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "disabled:pointer-events-none disabled:opacity-50",
        disabled && "pointer-events-none opacity-50",
        SIZE_CLASSES[size],
        ROOT_VARIANT_CLASSES[variant],
        className
    );

    const content = (
        <>
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
                    "transition-[background-color,border-color,background-image] duration-200 ease-out",
                    SURFACE_CLASSES[variant]
                )}
            />

            <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {children}
            </span>
        </>
    );

    if (props.href !== undefined) {
        const safeRel =
            props.target === "_blank"
                ? props.rel ?? "noopener noreferrer"
                : props.rel;

        return (
            <Link
                href={props.href}
                className={rootClasses}
                target={props.target}
                rel={safeRel}
                aria-label={ariaLabel}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type={props.type ?? "button"}
            className={rootClasses}
            disabled={disabled}
            aria-label={ariaLabel}
        >
            {content}
        </button>
    );
}

export default Button;

import * as React from "react";
import { cn } from "@/lib/utils";

type ContainerVariant =
    | "section"
    | "hero"
    | "reading"
    | "bleed"
    | "shell"
    | "fit"
    | "transparent";

type ContainerWidth = "narrow" | "default" | "wide" | "full";
type ContainerGutter = "none" | "sm" | "md" | "lg";
type ContainerTag = "div" | "section" | "main" | "article" | "header" | "footer";

type ContainerProps = Omit<
    React.HTMLAttributes<HTMLElement>,
    "className" | "children"
> & {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    as?: ContainerTag;
    variant?: ContainerVariant;
    width?: ContainerWidth;
    gutter?: ContainerGutter;

    /**
     * Controls the whole container visibility.
     * 1 = fully visible, 0 = invisible.
     */
    opacity?: number;

    /**
     * Alternative to opacity.
     * 0 = fully visible, 1 = invisible.
     */
    transparency?: number;
};

const widths: Record<ContainerWidth, string> = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-none",
};

const gutters: Record<ContainerGutter, string> = {
    none: "px-0",
    sm: "px-4 sm:px-5 lg:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-5 sm:px-8 lg:px-10",
};

const variants: Record<
    ContainerVariant,
    {
        className: string;
        width: ContainerWidth;
        gutter: ContainerGutter;
    }
> = {
    section: {
        className: "py-20 sm:py-24 lg:py-28",
        width: "default",
        gutter: "md",
    },
    hero: {
        className: "py-24 sm:py-32 lg:py-40",
        width: "wide",
        gutter: "md",
    },
    reading: {
        className: "py-16 sm:py-20 lg:py-24",
        width: "narrow",
        gutter: "md",
    },
    bleed: {
        className: "py-0",
        width: "full",
        gutter: "none",
    },
    shell: {
        className: "py-8 sm:py-10 lg:py-12",
        width: "default",
        gutter: "md",
    },
    fit: {
        className: "py-0",
        width: "default",
        gutter: "md",
    },
    transparent: {
        className: "py-0",
        width: "wide",
        gutter: "md",
    },
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function Container({
                              children,
                              className,
                              contentClassName,
                              as: Component = "div",
                              variant = "section",
                              width,
                              gutter,
                              opacity,
                              transparency,
                              style,
                              ...props
                          }: ContainerProps) {
    const config = variants[variant] ?? variants.section;

    const resolvedOpacity =
        opacity ?? (transparency === undefined ? 1 : 1 - clamp(transparency));

    return React.createElement(
        Component,
        {
            ...props,
            className: cn(
                "mx-auto h-fit w-full bg-transparent",
                widths[width ?? config.width],
                gutters[gutter ?? config.gutter],
                config.className,
                className
            ),
            style: {
                ...style,
                opacity: clamp(resolvedOpacity),
            },
        },
        <div className={cn("w-full", contentClassName)}>{children}</div>
    );
}

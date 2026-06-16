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

type BaseContainerProps = {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    variant?: ContainerVariant;
    width?: ContainerWidth;
    gutter?: ContainerGutter;
};

type ContainerProps = BaseContainerProps &
    Omit<React.HTMLAttributes<HTMLElement>, "className" | "children"> & {
    as?: React.ElementType;
};

const WIDTH_STYLES: Record<ContainerWidth, string> = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-none",
};

const GUTTER_STYLES: Record<ContainerGutter, string> = {
    none: "px-0",
    sm: "px-4 sm:px-5 lg:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-5 sm:px-8 lg:px-10",
};

const VARIANT_STYLES: Record<ContainerVariant, string> = {
    section: "py-20 sm:py-24 lg:py-28",
    hero: "py-24 sm:py-32 lg:py-40",
    reading: "py-16 sm:py-20 lg:py-24",
    bleed: "py-0",
    shell: "py-8 sm:py-10 lg:py-12",
    fit: "py-0",
    transparent: "py-0 bg-transparent",
};

const VARIANT_DEFAULT_WIDTH: Record<ContainerVariant, ContainerWidth> = {
    section: "default",
    hero: "wide",
    reading: "narrow",
    bleed: "full",
    shell: "default",
    fit: "default",
    transparent: "wide",
};

const VARIANT_DEFAULT_GUTTER: Record<ContainerVariant, ContainerGutter> = {
    section: "md",
    hero: "md",
    reading: "md",
    bleed: "none",
    shell: "md",
    fit: "md",
    transparent: "md",
};

export const Container = React.forwardRef<HTMLElement, ContainerProps>(
    (
        {
            children,
            className,
            contentClassName,
            as: Component = "div",
            variant = "section",
            width,
            gutter,
            ...props
        },
        ref
    ) => {
        const resolvedWidth = width ?? VARIANT_DEFAULT_WIDTH[variant];
        const resolvedGutter = gutter ?? VARIANT_DEFAULT_GUTTER[variant];

        return (
            <Component
                ref={ref}
                className={cn(
                    "mx-auto h-fit w-full",
                    WIDTH_STYLES[resolvedWidth],
                    GUTTER_STYLES[resolvedGutter],
                    VARIANT_STYLES[variant],
                    className
                )}
                {...props}
            >
                <div className={cn("w-full", contentClassName)}>{children}</div>
            </Component>
        );
    }
);

Container.displayName = "Container";

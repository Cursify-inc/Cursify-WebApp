import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
    eyebrow: string;
    title: string;
    description: string;
    align?: "left" | "center";
    className?: string;
};

export function SectionHeading({
                                   eyebrow,
                                   title,
                                   description,
                                   align = "center",
                                   className,
                               }: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "mx-auto max-w-3xl",
                align === "center" ? "text-center" : "text-left",
                className
            )}
        >
            <div
                className={cn(
                    "flex",
                    align === "center" ? "justify-center" : "justify-start"
                )}
            >
                <Badge>{eyebrow}</Badge>
            </div>

            <h2 className="theme-color-fade mt-5 text-3xl font-bold tracking-tight text-[var(--section-heading-title)] sm:text-5xl">
                {title}
            </h2>

            <p className="theme-color-fade mt-5 text-base leading-8 text-[var(--section-heading-description)] sm:text-lg">
                {description}
            </p>
        </div>
    );
}

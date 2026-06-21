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

            <h2 className="relative mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {title}
        </span>

                <span className="absolute inset-x-0 -bottom-3 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
            </h2>

            <p className="theme-color-fade mt-6 text-base leading-8 text-[var(--section-heading-description)] sm:text-lg opacity-90">
                {description}
            </p>
        </div>
    );
}

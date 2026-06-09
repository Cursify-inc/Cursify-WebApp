import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
    eyebrow: string
    title: string
    description: string
    align?: "left" | "center"
    className?: string
}

export function SectionHeading({
                                   eyebrow,
                                   title,
                                   description,
                                   align = "center",
                                   className
                               }: SectionHeadingProps) {
    return (
        <div
            className={cn(
                "mx-auto max-w-3xl",
                align === "center" ? "text-center" : "text-left",
                className
            )}
        >
            <Badge>{eyebrow}</Badge>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
                {title}
            </h2>
            <p className="mt-5 text-base leading-8 text-text-secondary sm:text-lg">
                {description}
            </p>
        </div>
    )
}

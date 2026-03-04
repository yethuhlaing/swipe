import Link from "next/link"
import { Logo } from "./logo"
import { cn } from "@/lib/utils"

interface LogoImageProps {
    /**
     * Size of the logo icon
     * @default 24
     */
    logoSize?: number
    /**
     * Whether to show the text "ShadcnStore"
     * @default true
     */
    showText?: boolean
    /**
     * Text to display next to logo (overrides default "ShadcnStore")
     */
    text?: string
    /**
     * Subtitle text to display below the main text
     */
    subtitle?: string
    /**
     * Link href (if provided, wraps in Link component)
     */
    href?: string
    /**
     * External link URL (if provided, uses anchor tag)
     */
    externalHref?: string
    /**
     * Variant style
     * - "default": Logo with text, no background
     * - "boxed": Logo in a primary-colored box with text outside
     * - "boxed-light": Logo in a light primary background box
     * - "icon-only": Just the logo, no text
     * @default "default"
     */
    variant?: "default" | "boxed" | "boxed-light" | "icon-only"
    /**
     * Text size variant
     * @default "base"
     */
    textSize?: "sm" | "base" | "lg" | "xl"
    /**
     * Additional className for the container
     */
    className?: string
    /**
     * Additional className for the text
     */
    textClassName?: string
    /**
     * Whether to show as a link (clickable)
     * @default true if href or externalHref is provided
     */
    asLink?: boolean
}

export function LogoImage({
    logoSize = 24,
    showText = true,
    text = "ShadcnStore",
    subtitle,
    href,
    externalHref,
    variant = "default",
    textSize = "base",
    className,
    textClassName,
    asLink,
}: LogoImageProps) {
    const isLink = asLink ?? (href !== undefined || externalHref !== undefined)
    const linkHref = href || externalHref || "/"

    const textSizeClasses = {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
    }

    const logoBox = (
        <div
            className={cn(
                variant === "boxed" &&
                    "bg-primary text-primary-foreground flex items-center justify-center rounded-lg",
                variant === "boxed" && !subtitle && "size-8 rounded-md",
                variant === "boxed" && subtitle && "aspect-square size-8",
                variant === "boxed-light" &&
                    "p-2 bg-primary/10 rounded-lg"
            )}
        >
            <Logo
                size={logoSize}
                className={cn(
                    variant === "boxed" || variant === "boxed-light"
                        ? ""
                        : "text-current"
                )}
            />
        </div>
    )

    const logoWithText = (
        <>
            {variant === "boxed" || variant === "boxed-light" ? (
                logoBox
            ) : (
                <Logo size={logoSize} className="text-current" />
            )}
            {showText && variant !== "icon-only" && (
                <div className="flex flex-col">
                    <span
                        className={cn(
                            "font-bold",
                            textSizeClasses[textSize],
                            textClassName
                        )}
                    >
                        {text}
                    </span>
                    {subtitle && (
                        <span className="truncate text-xs text-muted-foreground">
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </>
    )

    const content = (
        <div className={cn("flex items-center gap-2", className)}>
            {logoWithText}
        </div>
    )

    if (!isLink) {
        return content
    }

    const linkClassName = cn(
        "flex items-center gap-2 cursor-pointer",
        variant === "boxed" || variant === "boxed-light" ? "" : "font-medium",
        className
    )

    if (externalHref) {
        return (
            <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
            >
                {logoWithText}
            </a>
        )
    }

    return (
        <Link href={linkHref} className={linkClassName}>
            {logoWithText}
        </Link>
    )
}


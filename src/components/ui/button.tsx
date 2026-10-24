import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "secondary" | "outline" | "ghost" | "link" | "destructive"
type Size = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: boolean
  href?: string
  target?: string
  rel?: string
}

const variantClasses: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-primary to-primary/80 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-8px_hsl(var(--primary)/0.65)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_10px_28px_-6px_hsl(var(--primary)/0.75)] hover:-translate-y-0.5",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
  outline: "border border-border/70 bg-transparent hover:bg-text-primary/[0.05] hover:border-primary/50",
  ghost: "hover:bg-text-primary/[0.07]",
  link: "text-primary underline-offset-4 hover:underline",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
}

const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs sm:h-8",
  lg: "h-12 px-7 text-base",
  icon: "h-9 w-9 p-0",
}

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, href, target, rel, ...props }, ref) => {
    const isLink = asChild || typeof href === "string"
    const Component: any = isLink ? "a" : "button"

    return (
      <Component
        ref={ref as any}
        href={isLink ? href : undefined}
        target={isLink ? target : undefined}
        rel={isLink ? rel : undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

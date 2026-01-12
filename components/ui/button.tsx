import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-[-0.01em] transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)] hover:brightness-105 hover:shadow-[0_20px_40px_-22px_rgba(15,23,42,0.4)] active:translate-y-0.5 active:shadow-[0_8px_18px_-16px_rgba(15,23,42,0.35)]",
        accent:
          "bg-accent text-accent-foreground shadow-[0_14px_30px_-20px_rgba(15,23,42,0.35)] hover:brightness-105 hover:shadow-[0_20px_40px_-22px_rgba(15,23,42,0.4)] active:translate-y-0.5 active:shadow-[0_8px_18px_-16px_rgba(15,23,42,0.35)]",
        destructive:
          "bg-destructive text-white shadow-[0_10px_22px_-18px_rgba(127,29,29,0.4)] hover:brightness-105 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70",
        outline:
          "border border-foreground/15 bg-white/70 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.2)] hover:border-foreground/30 hover:bg-white",
        secondary:
          "bg-foreground/5 text-foreground shadow-[0_10px_24px_-20px_rgba(15,23,42,0.2)] hover:bg-foreground/10",
        ghost:
          "text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-7 has-[>svg]:px-5",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

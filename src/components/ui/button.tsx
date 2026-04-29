import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-medium tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-paper hover:bg-accent active:translate-y-px shadow-[0_1px_0_0_#000]",
        accent:
          "bg-accent text-paper hover:bg-accent-deep active:translate-y-px shadow-[0_1px_0_0_#8E1B22]",
        outline:
          "border border-ink text-ink bg-transparent hover:bg-ink hover:text-paper",
        ghost:
          "text-ink hover:bg-paper-deep",
        link:
          "text-ink underline-offset-4 hover:text-accent underline decoration-1",
        secondary:
          "bg-paper-deep text-ink hover:bg-paper-line border border-paper-line",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

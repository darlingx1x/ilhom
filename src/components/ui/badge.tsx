import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center small-caps text-[0.7rem] font-sans font-semibold px-2 py-0.5 border",
  {
    variants: {
      variant: {
        default: "border-ink text-ink bg-transparent",
        accent: "border-accent text-accent bg-transparent",
        solid: "border-ink bg-ink text-paper",
        muted: "border-paper-line text-ink-mute bg-paper-deep",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

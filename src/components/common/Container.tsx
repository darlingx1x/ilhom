import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...props} />
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string
  title: string
  lead?: string
}) {
  return (
    <div className="container py-12 md:py-16">
      {eyebrow && (
        <div className="small-caps text-[0.78rem] font-sans font-semibold text-accent tracking-[0.22em]">
          {eyebrow}
        </div>
      )}
      <h1 className="mt-3 font-display text-hero font-black leading-[1.02] text-balance max-w-3xl">
        {title}
      </h1>
      {lead && (
        <p className="mt-5 max-w-2xl font-editorial text-deck text-ink-soft text-pretty">
          {lead}
        </p>
      )}
      <div className="mt-8 rule-thick" />
    </div>
  )
}

import { cn } from "@/lib/utils"

interface Props {
  title: string
  variant?: "newspaper" | "magazine"
  accent?: string
  className?: string
}

const palettes = [
  { bg: "#1A1A1A", fg: "#FAF8F4", line: "#B8252C" },
  { bg: "#FAF8F4", fg: "#1A1A1A", line: "#B8252C" },
  { bg: "#B8252C", fg: "#FAF8F4", line: "#1A1A1A" },
  { bg: "#F2EDE3", fg: "#1A1A1A", line: "#1A1A1A" },
  { bg: "#1A1A1A", fg: "#F2EDE3", line: "#E14B53" },
  { bg: "#FAF8F4", fg: "#B8252C", line: "#1A1A1A" },
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

export function PublicationCover({ title, variant = "newspaper", className }: Props) {
  const p = palettes[hash(title) % palettes.length]
  const issueNo = String((hash(title) % 999) + 1).padStart(3, "0")
  const isMagazine = variant === "magazine"

  return (
    <div
      className={cn("relative aspect-[3/4] overflow-hidden grain", className)}
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      {/* corner */}
      <div
        className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between text-[0.62rem] tracking-[0.18em] font-sans uppercase"
        style={{ borderBottom: `1px solid ${p.fg}` }}
      >
        <span>№ {issueNo}</span>
        <span>{isMagazine ? "Magazine" : "Daily"}</span>
      </div>

      {/* title */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
        <div
          className="font-display font-black leading-[0.92] tracking-tight"
          style={{ fontSize: "clamp(1.25rem, 2.4vw, 2rem)" }}
        >
          {title}
        </div>
        <div
          className="mt-3 mx-auto h-px w-12"
          style={{ backgroundColor: p.line }}
        />
        <div className="mt-3 text-[0.6rem] tracking-[0.24em] uppercase font-sans opacity-80">
          {isMagazine ? "Quarterly Edition" : "Tashkent · O'zbekiston"}
        </div>
      </div>

      {/* footer rule */}
      <div className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-center justify-between text-[0.6rem] tracking-[0.18em] font-sans uppercase"
        style={{ borderTop: `1px solid ${p.fg}` }}>
        <span>EST. 1991</span>
        <span style={{ color: p.line }}>●</span>
        <span>VOL. XXXV</span>
      </div>
    </div>
  )
}

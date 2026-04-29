import type { VercelRequest, VercelResponse } from "@vercel/node"
import { ZodError } from "zod"

export function methodNotAllowed(res: VercelResponse, allowed: string[]) {
  res.setHeader("Allow", allowed.join(", "))
  res.status(405).json({ error: `Method not allowed. Allowed: ${allowed.join(", ")}` })
}

export function ensureMethod(
  req: VercelRequest,
  res: VercelResponse,
  allowed: string[],
): boolean {
  if (!allowed.includes(req.method ?? "GET")) {
    methodNotAllowed(res, allowed)
    return false
  }
  return true
}

export function mapError(err: unknown, res: VercelResponse) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.issues })
    return
  }
  if (err instanceof Error) {
    console.error("[api] error:", err.message, err.stack)
    res.status(500).json({ error: err.message })
    return
  }
  console.error("[api] unknown error:", err)
  res.status(500).json({ error: "Internal server error" })
}

export function pickQuery(req: VercelRequest, key: string): string | undefined {
  const v = req.query[key]
  if (Array.isArray(v)) return v[0]
  return v
}

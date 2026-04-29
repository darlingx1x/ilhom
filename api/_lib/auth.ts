import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { VercelRequest, VercelResponse } from "@vercel/node"

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error("JWT_SECRET is not configured (Vercel → Settings → Environment Variables)")
  return s
}

export interface JwtPayload {
  user_id: number
  role: "reader" | "admin"
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

type Handler = (
  req: VercelRequest,
  res: VercelResponse,
  ctx: { user: JwtPayload },
) => Promise<unknown> | unknown

export function withAuth(handler: Handler, opts: { role?: "admin" } = {}) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const auth = req.headers.authorization || ""
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
    if (!token) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    let user: JwtPayload
    try {
      user = verifyToken(token)
    } catch {
      res.status(401).json({ error: "Invalid token" })
      return
    }
    if (opts.role && user.role !== opts.role) {
      res.status(403).json({ error: "Forbidden" })
      return
    }
    return handler(req, res, { user })
  }
}

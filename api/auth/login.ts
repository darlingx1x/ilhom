import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db"
import { comparePassword, signToken } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError } from "../_lib/http"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["POST"])) return
  try {
    const data = schemas.login.parse(req.body)
    const rows = await sql`
      SELECT id, email, password_hash, full_name, phone, role, created_at
      FROM users WHERE email = ${data.email} LIMIT 1
    `
    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }
    const u = rows[0]
    const ok = await comparePassword(data.password, u.password_hash)
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }
    const token = signToken({ user_id: u.id, role: u.role })
    const { password_hash: _ignore, ...user } = u
    void _ignore
    res.status(200).json({ token, user })
  } catch (err) {
    mapError(err, res)
  }
}

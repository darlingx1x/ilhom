import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db"
import { hashPassword, signToken } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError } from "../_lib/http"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["POST"])) return
  try {
    const data = schemas.register.parse(req.body)

    const exists = await sql`SELECT id FROM users WHERE email = ${data.email} LIMIT 1`
    if (exists.length > 0) {
      res.status(409).json({ error: "Email already registered" })
      return
    }

    const password_hash = await hashPassword(data.password)
    const inserted = await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (${data.email}, ${password_hash}, ${data.full_name}, ${data.phone ?? null}, 'reader')
      RETURNING id, email, full_name, phone, role, created_at
    `
    const user = inserted[0]
    const token = signToken({ user_id: user.id, role: user.role })
    res.status(201).json({ token, user })
  } catch (err) {
    mapError(err, res)
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db.js"
import { comparePassword, hashPassword, signToken, withAuth } from "../_lib/auth.js"
import { schemas } from "../_lib/validate.js"
import { ensureMethod, mapError, pickQuery } from "../_lib/http.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = pickQuery(req, "action")
  try {
    if (action === "register") return await handleRegister(req, res)
    if (action === "login") return await handleLogin(req, res)
    if (action === "me") return await handleMe(req, res)
    res.status(404).json({ error: `Unknown auth action: ${action ?? ""}` })
  } catch (err) {
    mapError(err, res)
  }
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["POST"])) return
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
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["POST"])) return
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
}

const meHandler = withAuth(async (_req, res, { user }) => {
  const rows = await sql`
    SELECT id, email, full_name, phone, role, created_at
    FROM users WHERE id = ${user.user_id} LIMIT 1
  `
  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" })
    return
  }
  res.status(200).json({ user: rows[0] })
})

async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  await meHandler(req, res)
}

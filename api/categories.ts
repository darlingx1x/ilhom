import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "./_lib/db.js"
import { ensureMethod, mapError } from "./_lib/http.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const rows = await sql`SELECT id, slug, name_ru, name_uz FROM categories ORDER BY id`
    res.status(200).json({ categories: rows })
  } catch (err) {
    mapError(err, res)
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "./_lib/db"

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
  }

  let db: { ok: boolean; error?: string; counts?: Record<string, number> } = { ok: false }
  if (env.DATABASE_URL) {
    try {
      const rows = await sql`
        SELECT
          (SELECT count(*)::int FROM publications)  AS publications,
          (SELECT count(*)::int FROM issues)        AS issues,
          (SELECT count(*)::int FROM users)         AS users,
          (SELECT count(*)::int FROM subscriptions) AS subscriptions
      `
      db = { ok: true, counts: rows[0] as Record<string, number> }
    } catch (err) {
      db = { ok: false, error: (err as Error).message }
    }
  } else {
    db = { ok: false, error: "DATABASE_URL is not set" }
  }

  res.status(200).json({
    ok: env.DATABASE_URL && env.JWT_SECRET && db.ok,
    service: "vatan-press",
    timestamp: new Date().toISOString(),
    env,
    db,
  })
}

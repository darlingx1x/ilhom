import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { ensureMethod, mapError } from "../_lib/http"

export default withAuth(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const rows = await sql`
      SELECT
        u.id, u.email, u.full_name, u.phone, u.role, u.created_at,
        (SELECT count(*)::int FROM subscriptions s WHERE s.user_id = u.id) AS subscriptions_count
      FROM users u
      ORDER BY u.created_at DESC
    `
    res.status(200).json({ users: rows })
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })

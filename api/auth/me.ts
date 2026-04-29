import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { mapError } from "../_lib/http"

export default withAuth(async (_req, res, { user }) => {
  try {
    const rows = await sql`
      SELECT id, email, full_name, phone, role, created_at
      FROM users WHERE id = ${user.user_id} LIMIT 1
    `
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" })
      return
    }
    res.status(200).json({ user: rows[0] })
  } catch (err) {
    mapError(err, res)
  }
})

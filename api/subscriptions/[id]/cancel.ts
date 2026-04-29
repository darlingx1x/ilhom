import { sql } from "../../_lib/db"
import { withAuth } from "../../_lib/auth"
import { ensureMethod, mapError, pickQuery } from "../../_lib/http"

export default withAuth(async (req, res, { user }) => {
  if (!ensureMethod(req, res, ["POST"])) return
  try {
    const id = parseInt(pickQuery(req, "id") ?? "0", 10)
    if (!id) {
      res.status(400).json({ error: "Invalid subscription id" })
      return
    }
    const rows = await sql`
      UPDATE subscriptions
      SET status = 'cancelled'
      WHERE id = ${id} AND user_id = ${user.user_id}
      RETURNING id, user_id, publication_id, period_months, start_date, end_date, status, total_amount, created_at
    `
    if (rows.length === 0) {
      res.status(404).json({ error: "Subscription not found" })
      return
    }
    res.status(200).json({ subscription: rows[0] })
  } catch (err) {
    mapError(err, res)
  }
})

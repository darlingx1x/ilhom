import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { ensureMethod, mapError } from "../_lib/http"

export default withAuth(async (req, res, { user }) => {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const rows = await sql`
      SELECT
        pm.id, pm.subscription_id, pm.amount, pm.card_last4, pm.status, pm.paid_at,
        pub.title_ru AS pub_title_ru, pub.title_uz AS pub_title_uz, pub.slug AS pub_slug
      FROM payments pm
      JOIN subscriptions s ON s.id = pm.subscription_id
      JOIN publications pub ON pub.id = s.publication_id
      WHERE s.user_id = ${user.user_id}
      ORDER BY pm.paid_at DESC
    `
    res.status(200).json({ payments: rows })
  } catch (err) {
    mapError(err, res)
  }
})

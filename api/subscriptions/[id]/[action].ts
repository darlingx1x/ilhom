import { sql } from "../../_lib/db"
import { withAuth } from "../../_lib/auth"
import { ensureMethod, mapError, pickQuery } from "../../_lib/http"

export default withAuth(async (req, res, { user }) => {
  if (!ensureMethod(req, res, ["POST"])) return
  try {
    const id = parseInt(pickQuery(req, "id") ?? "0", 10)
    const action = pickQuery(req, "action")
    if (!id) {
      res.status(400).json({ error: "Invalid subscription id" })
      return
    }
    if (action === "renew") return await handleRenew(id, user.user_id, res)
    if (action === "cancel") return await handleCancel(id, user.user_id, res)
    res.status(404).json({ error: `Unknown action: ${action ?? ""}` })
  } catch (err) {
    mapError(err, res)
  }
})

async function handleRenew(id: number, userId: number, res: import("@vercel/node").VercelResponse) {
  const rows = await sql`
    SELECT s.id, s.publication_id, s.period_months, s.end_date, s.status,
           p.price_per_month
    FROM subscriptions s
    JOIN publications p ON p.id = s.publication_id
    WHERE s.id = ${id} AND s.user_id = ${userId}
    LIMIT 1
  `
  if (rows.length === 0) {
    res.status(404).json({ error: "Subscription not found" })
    return
  }
  const s = rows[0]

  const base = new Date(s.end_date)
  if (base < new Date()) base.setTime(Date.now())
  const newEnd = new Date(base)
  newEnd.setMonth(newEnd.getMonth() + s.period_months)
  const newEndISO = newEnd.toISOString().slice(0, 10)
  const total = s.price_per_month * s.period_months

  const updated = await sql`
    UPDATE subscriptions
    SET end_date = ${newEndISO}, status = 'active', total_amount = total_amount + ${total}
    WHERE id = ${id}
    RETURNING id, user_id, publication_id, period_months, start_date, end_date, status, total_amount, created_at
  `
  const payRows = await sql`
    INSERT INTO payments (subscription_id, amount, card_last4, status)
    VALUES (${id}, ${total}, '0000', 'success')
    RETURNING id, subscription_id, amount, card_last4, status, paid_at
  `
  res.status(200).json({ subscription: updated[0], payment: payRows[0] })
}

async function handleCancel(id: number, userId: number, res: import("@vercel/node").VercelResponse) {
  const rows = await sql`
    UPDATE subscriptions
    SET status = 'cancelled'
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id, user_id, publication_id, period_months, start_date, end_date, status, total_amount, created_at
  `
  if (rows.length === 0) {
    res.status(404).json({ error: "Subscription not found" })
    return
  }
  res.status(200).json({ subscription: rows[0] })
}

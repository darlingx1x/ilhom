import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError } from "../_lib/http"

export default withAuth(async (req, res, { user }) => {
  if (!ensureMethod(req, res, ["GET", "POST"])) return
  try {
    if (req.method === "GET") {
      const rows = await sql`
        SELECT
          s.id, s.user_id, s.publication_id, s.period_months,
          s.start_date, s.end_date, s.status, s.total_amount, s.created_at,
          p.slug AS pub_slug, p.title_ru AS pub_title_ru, p.title_uz AS pub_title_uz,
          p.cover_url AS pub_cover, p.type AS pub_type
        FROM subscriptions s
        JOIN publications p ON p.id = s.publication_id
        WHERE s.user_id = ${user.user_id}
        ORDER BY s.created_at DESC
      `
      const items = rows.map((s) => ({
        id: s.id,
        user_id: s.user_id,
        publication_id: s.publication_id,
        period_months: s.period_months,
        start_date: s.start_date,
        end_date: s.end_date,
        status: s.status,
        total_amount: s.total_amount,
        created_at: s.created_at,
        publication: {
          id: s.publication_id,
          slug: s.pub_slug,
          title_ru: s.pub_title_ru,
          title_uz: s.pub_title_uz,
          cover_url: s.pub_cover,
          type: s.pub_type,
        },
      }))
      res.status(200).json({ subscriptions: items })
      return
    }

    const data = schemas.createSubscription.parse(req.body)
    if (!luhn(data.card_number.replace(/\s+/g, ""))) {
      res.status(400).json({ error: "Invalid card number" })
      return
    }

    const pubRows = await sql`
      SELECT id, price_per_month, is_published
      FROM publications WHERE id = ${data.publication_id} LIMIT 1
    `
    if (pubRows.length === 0 || !pubRows[0].is_published) {
      res.status(404).json({ error: "Publication not found" })
      return
    }

    const total = pubRows[0].price_per_month * data.period_months
    const start = new Date()
    const end = new Date(start)
    end.setMonth(end.getMonth() + data.period_months)
    const startISO = start.toISOString().slice(0, 10)
    const endISO = end.toISOString().slice(0, 10)

    const subRows = await sql`
      INSERT INTO subscriptions (user_id, publication_id, period_months, start_date, end_date, status, total_amount)
      VALUES (${user.user_id}, ${data.publication_id}, ${data.period_months}, ${startISO}, ${endISO}, 'active', ${total})
      RETURNING id, user_id, publication_id, period_months, start_date, end_date, status, total_amount, created_at
    `
    const subscription = subRows[0]
    const last4 = data.card_number.slice(-4)

    const payRows = await sql`
      INSERT INTO payments (subscription_id, amount, card_last4, status)
      VALUES (${subscription.id}, ${total}, ${last4}, 'success')
      RETURNING id, subscription_id, amount, card_last4, status, paid_at
    `

    res.status(201).json({ subscription, payment: payRows[0] })
  } catch (err) {
    mapError(err, res)
  }
})

function luhn(num: string): boolean {
  if (!/^\d+$/.test(num)) return false
  let sum = 0
  let alt = false
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

import { sql } from "../../_lib/db"
import { withAuth } from "../../_lib/auth"
import { ensureMethod, mapError, pickQuery } from "../../_lib/http"

export default withAuth(async (req, res, { user }) => {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const id = parseInt(pickQuery(req, "id") ?? "0", 10)
    if (!id) {
      res.status(400).json({ error: "Invalid subscription id" })
      return
    }

    const subRows = await sql`
      SELECT
        s.id, s.user_id, s.publication_id, s.period_months,
        s.start_date, s.end_date, s.status, s.total_amount, s.created_at,
        p.slug AS pub_slug, p.title_ru AS pub_title_ru, p.title_uz AS pub_title_uz,
        p.cover_url AS pub_cover, p.type AS pub_type
      FROM subscriptions s
      JOIN publications p ON p.id = s.publication_id
      WHERE s.id = ${id} AND s.user_id = ${user.user_id}
      LIMIT 1
    `
    if (subRows.length === 0) {
      res.status(404).json({ error: "Subscription not found" })
      return
    }
    const s = subRows[0]
    const accessGranted = s.status === "active" && new Date(s.end_date) >= new Date()

    const issues = await sql`
      SELECT id, publication_id, issue_number, title_ru, title_uz, published_at, pdf_url, cover_url
      FROM issues
      WHERE publication_id = ${s.publication_id}
        AND published_at BETWEEN ${s.start_date} AND ${s.end_date}
      ORDER BY published_at DESC
    `

    const safeIssues = issues.map((i) => ({
      ...i,
      pdf_url: accessGranted ? i.pdf_url : null,
    }))

    res.status(200).json({
      subscription: {
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
      },
      issues: safeIssues,
      access_granted: accessGranted,
    })
  } catch (err) {
    mapError(err, res)
  }
})

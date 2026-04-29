import { neon } from "@neondatabase/serverless"
import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })

const SAMPLE_PDF =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)

  const pubs = await sql`SELECT id, slug, title_ru FROM publications ORDER BY id`
  console.log(`→ adding issues for ${pubs.length} publications`)

  let total = 0
  for (const p of pubs) {
    const datesISO = [
      "2026-04-25",
      "2026-04-18",
      "2026-04-11",
      "2026-04-04",
    ]
    for (let i = 0; i < datesISO.length; i++) {
      const issueNumber = 18 - i
      await sql`
        INSERT INTO issues (publication_id, issue_number, title_ru, title_uz, published_at, pdf_url)
        VALUES (${p.id}, ${issueNumber}, ${"№ " + issueNumber}, ${"№ " + issueNumber}, ${datesISO[i]}, ${SAMPLE_PDF})
        ON CONFLICT (publication_id, issue_number) DO NOTHING
      `
      total++
    }
  }
  console.log(`✓ inserted/skipped ${total} issues`)

  // Демо-подписка для reader1@example.uz на первое издание
  const reader = await sql`SELECT id FROM users WHERE email = 'reader1@example.uz' LIMIT 1`
  if (reader.length > 0 && pubs.length > 0) {
    const userId = reader[0].id
    const pubId = pubs[0].id
    const exists = await sql`
      SELECT id FROM subscriptions
      WHERE user_id = ${userId} AND publication_id = ${pubId} AND status = 'active'
    `
    if (exists.length === 0) {
      const sub = await sql`
        INSERT INTO subscriptions (user_id, publication_id, period_months, start_date, end_date, status, total_amount)
        VALUES (${userId}, ${pubId}, 3, '2026-01-01', '2026-12-31', 'active', 84000)
        RETURNING id
      `
      await sql`
        INSERT INTO payments (subscription_id, amount, card_last4, status)
        VALUES (${sub[0].id}, 84000, '4421', 'success')
      `
      console.log(`✓ demo subscription created for reader1 → publication ${pubs[0].slug}`)
    } else {
      console.log(`✓ demo subscription for reader1 already exists`)
    }
  } else {
    console.log("(skip subscription seed: reader1 not found)")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

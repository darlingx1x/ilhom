import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db.js"
import { withAuth } from "../_lib/auth.js"
import { schemas } from "../_lib/validate.js"
import { ensureMethod, mapError, pickQuery } from "../_lib/http.js"

export default withAuth(async (req, res) => {
  const resource = pickQuery(req, "resource")
  try {
    switch (resource) {
      case "stats":
        return await handleStats(req, res)
      case "users":
        return await handleUsers(req, res)
      case "publications":
        return await handlePublications(req, res)
      case "issues":
        return await handleIssues(req, res)
      case "blob":
        return await handleBlob(req, res)
      default:
        res.status(404).json({ error: `Unknown admin resource: ${resource ?? ""}` })
    }
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })

async function handleStats(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  const [usersR, subsR, revenueR, issuesR, recentR] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM users`,
    sql`SELECT count(*)::int AS n FROM subscriptions WHERE status = 'active'`,
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS sum
      FROM payments
      WHERE status = 'success' AND paid_at >= date_trunc('month', NOW())
    `,
    sql`SELECT count(*)::int AS n FROM issues`,
    sql`
      SELECT s.id, s.created_at, s.total_amount, s.status,
             u.email,
             p.title_ru, p.title_uz
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      JOIN publications p ON p.id = s.publication_id
      ORDER BY s.created_at DESC
      LIMIT 8
    `,
  ])
  res.status(200).json({
    stats: {
      users_count: usersR[0].n,
      active_subscriptions: subsR[0].n,
      monthly_revenue: revenueR[0].sum,
      issues_count: issuesR[0].n,
    },
    recent_subscriptions: recentR,
  })
}

async function handleUsers(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  const rows = await sql`
    SELECT
      u.id, u.email, u.full_name, u.phone, u.role, u.created_at,
      (SELECT count(*)::int FROM subscriptions s WHERE s.user_id = u.id) AS subscriptions_count
    FROM users u
    ORDER BY u.created_at DESC
  `
  res.status(200).json({ users: rows })
}

async function handlePublications(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET", "POST", "PATCH", "DELETE"])) return

  if (req.method === "GET") {
    const rows = await sql`
      SELECT
        p.id, p.slug, p.title_ru, p.title_uz, p.description_ru, p.description_uz,
        p.cover_url, p.category_id, p.type, p.price_per_month, p.is_published,
        p.created_at, p.updated_at,
        (SELECT count(*)::int FROM issues i WHERE i.publication_id = p.id) AS issues_count
      FROM publications p
      ORDER BY p.created_at DESC
    `
    res.status(200).json({ publications: rows })
    return
  }

  if (req.method === "POST") {
    const data = schemas.publication.parse(req.body)
    const inserted = await sql`
      INSERT INTO publications (slug, title_ru, title_uz, description_ru, description_uz, cover_url, category_id, type, price_per_month, is_published)
      VALUES (
        ${data.slug}, ${data.title_ru}, ${data.title_uz},
        ${data.description_ru}, ${data.description_uz},
        ${data.cover_url}, ${data.category_id}, ${data.type},
        ${data.price_per_month}, ${data.is_published ?? true}
      )
      RETURNING *
    `
    res.status(201).json({ publication: inserted[0] })
    return
  }

  const id = parseInt(pickQuery(req, "id") ?? "0", 10)
  if (!id) {
    res.status(400).json({ error: "id is required" })
    return
  }

  if (req.method === "PATCH") {
    const data = schemas.publicationPatch.parse(req.body)
    const updated = await sql`
      UPDATE publications SET
        slug             = COALESCE(${data.slug ?? null}, slug),
        title_ru         = COALESCE(${data.title_ru ?? null}, title_ru),
        title_uz         = COALESCE(${data.title_uz ?? null}, title_uz),
        description_ru   = COALESCE(${data.description_ru ?? null}, description_ru),
        description_uz   = COALESCE(${data.description_uz ?? null}, description_uz),
        cover_url        = COALESCE(${data.cover_url ?? null}, cover_url),
        category_id      = COALESCE(${data.category_id ?? null}::int, category_id),
        type             = COALESCE(${data.type ?? null}, type),
        price_per_month  = COALESCE(${data.price_per_month ?? null}::int, price_per_month),
        is_published     = COALESCE(${data.is_published ?? null}::boolean, is_published),
        updated_at       = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (updated.length === 0) {
      res.status(404).json({ error: "Publication not found" })
      return
    }
    res.status(200).json({ publication: updated[0] })
    return
  }

  // DELETE
  const r = await sql`DELETE FROM publications WHERE id = ${id} RETURNING id`
  if (r.length === 0) {
    res.status(404).json({ error: "Publication not found" })
    return
  }
  res.status(200).json({ ok: true })
}

async function handleIssues(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET", "POST", "DELETE"])) return

  if (req.method === "GET") {
    const pubId = parseInt(pickQuery(req, "publication_id") ?? "0", 10)
    if (!pubId) {
      res.status(400).json({ error: "publication_id is required" })
      return
    }
    const rows = await sql`
      SELECT id, publication_id, issue_number, title_ru, title_uz, published_at, pdf_url, cover_url, created_at
      FROM issues
      WHERE publication_id = ${pubId}
      ORDER BY published_at DESC
    `
    res.status(200).json({ issues: rows })
    return
  }

  if (req.method === "POST") {
    const data = schemas.issue.parse(req.body)
    const inserted = await sql`
      INSERT INTO issues (publication_id, issue_number, title_ru, title_uz, published_at, pdf_url, cover_url)
      VALUES (
        ${data.publication_id}, ${data.issue_number},
        ${data.title_ru ?? null}, ${data.title_uz ?? null},
        ${data.published_at}, ${data.pdf_url}, ${data.cover_url ?? null}
      )
      RETURNING *
    `
    res.status(201).json({ issue: inserted[0] })
    return
  }

  // DELETE
  const id = parseInt(pickQuery(req, "id") ?? "0", 10)
  if (!id) {
    res.status(400).json({ error: "id is required" })
    return
  }
  const r = await sql`DELETE FROM issues WHERE id = ${id} RETURNING id`
  if (r.length === 0) {
    res.status(404).json({ error: "Issue not found" })
    return
  }
  res.status(200).json({ ok: true })
}

async function handleBlob(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["POST"])) return
  const data = schemas.blobUpload.parse(req.body)
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is not configured" })
    return
  }
  const ts = Date.now()
  const safe = data.pathname.replace(/[^a-zA-Z0-9._-]/g, "-")
  const pathname = `pdf/${ts}-${safe}`
  res.status(200).json({
    pathname,
    client_payload: {
      token,
      content_type: data.content_type ?? "application/pdf",
    },
    hint: "POST file body to https://blob.vercel-storage.com/<pathname> with Authorization: Bearer <token>",
  })
}

import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError, pickQuery } from "../_lib/http"

export default withAuth(async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST", "DELETE"])) return
  try {
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

    if (req.method === "DELETE") {
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
      return
    }
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })

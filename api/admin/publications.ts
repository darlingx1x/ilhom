import { sql } from "../_lib/db"
import { withAuth } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError, pickQuery } from "../_lib/http"

export default withAuth(async (req, res) => {
  if (!ensureMethod(req, res, ["GET", "POST", "PATCH", "DELETE"])) return
  try {
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

    if (req.method === "DELETE") {
      const r = await sql`DELETE FROM publications WHERE id = ${id} RETURNING id`
      if (r.length === 0) {
        res.status(404).json({ error: "Publication not found" })
        return
      }
      res.status(200).json({ ok: true })
      return
    }
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })

import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db.js"
import { ensureMethod, mapError, pickQuery } from "../_lib/http.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const slug = pickQuery(req, "slug")
    if (!slug) {
      res.status(400).json({ error: "Slug is required" })
      return
    }

    const rows = await sql`
      SELECT
        p.id, p.slug, p.title_ru, p.title_uz, p.description_ru, p.description_uz,
        p.cover_url, p.category_id, p.type, p.price_per_month, p.is_published,
        p.created_at, p.updated_at,
        c.slug AS cat_slug, c.name_ru AS cat_name_ru, c.name_uz AS cat_name_uz
      FROM publications p
      JOIN categories c ON c.id = p.category_id
      WHERE p.slug = ${slug} AND p.is_published = TRUE
      LIMIT 1
    `
    if (rows.length === 0) {
      res.status(404).json({ error: "Publication not found" })
      return
    }
    const r = rows[0]
    const issues = await sql`
      SELECT id, publication_id, issue_number, title_ru, title_uz, published_at, cover_url, created_at
      FROM issues
      WHERE publication_id = ${r.id}
      ORDER BY published_at DESC
      LIMIT 12
    `

    res.status(200).json({
      publication: {
        id: r.id,
        slug: r.slug,
        title_ru: r.title_ru,
        title_uz: r.title_uz,
        description_ru: r.description_ru,
        description_uz: r.description_uz,
        cover_url: r.cover_url,
        category_id: r.category_id,
        category: { id: r.category_id, slug: r.cat_slug, name_ru: r.cat_name_ru, name_uz: r.cat_name_uz },
        type: r.type,
        price_per_month: r.price_per_month,
        is_published: r.is_published,
        created_at: r.created_at,
        updated_at: r.updated_at,
      },
      issues,
    })
  } catch (err) {
    mapError(err, res)
  }
}

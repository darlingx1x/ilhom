import type { VercelRequest, VercelResponse } from "@vercel/node"
import { sql } from "../_lib/db.js"
import { ensureMethod, mapError, pickQuery } from "../_lib/http.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureMethod(req, res, ["GET"])) return
  try {
    const category = pickQuery(req, "category") ?? null
    const type = pickQuery(req, "type") ?? null
    const q = pickQuery(req, "q") ?? null
    const sort = pickQuery(req, "sort") ?? "default"
    const page = Math.max(1, parseInt(pickQuery(req, "page") ?? "1", 10) || 1)
    const limit = 24
    const offset = (page - 1) * limit

    const orderClause =
      sort === "price_asc" ? sql`p.price_per_month ASC`
      : sort === "price_desc" ? sql`p.price_per_month DESC`
      : sql`p.id ASC`

    const rows = await sql`
      SELECT
        p.id, p.slug, p.title_ru, p.title_uz, p.description_ru, p.description_uz,
        p.cover_url, p.category_id, p.type, p.price_per_month, p.is_published,
        p.created_at, p.updated_at,
        c.slug AS cat_slug, c.name_ru AS cat_name_ru, c.name_uz AS cat_name_uz
      FROM publications p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
        AND (${category}::text IS NULL OR c.slug = ${category})
        AND (${type}::text IS NULL OR p.type = ${type})
        AND (
          ${q}::text IS NULL
          OR p.title_ru ILIKE '%' || ${q} || '%'
          OR p.title_uz ILIKE '%' || ${q} || '%'
        )
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalRows = await sql`
      SELECT count(*)::int AS n
      FROM publications p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_published = TRUE
        AND (${category}::text IS NULL OR c.slug = ${category})
        AND (${type}::text IS NULL OR p.type = ${type})
        AND (
          ${q}::text IS NULL
          OR p.title_ru ILIKE '%' || ${q} || '%'
          OR p.title_uz ILIKE '%' || ${q} || '%'
        )
    `

    const items = rows.map((r) => ({
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
    }))

    res.status(200).json({
      publications: items,
      total: totalRows[0].n,
      page,
      page_size: limit,
    })
  } catch (err) {
    mapError(err, res)
  }
}

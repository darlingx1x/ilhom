import type { VercelResponse } from "@vercel/node"
import { z, ZodError, type ZodSchema } from "zod"

export function parseBody<T>(res: VercelResponse, schema: ZodSchema<T>, body: unknown): T | null {
  try {
    return schema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues })
    } else {
      res.status(400).json({ error: "Invalid body" })
    }
    return null
  }
}

export const schemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    phone: z.string().optional(),
  }),
  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  createSubscription: z.object({
    publication_id: z.number().int().positive(),
    period_months: z.union([z.literal(1), z.literal(3), z.literal(12)]),
    card_number: z.string().regex(/^[\d\s]{13,23}$/),
    card_holder: z.string().min(2),
    card_expiry: z.string().regex(/^\d{2}\s*\/\s*\d{2}$/),
    card_cvc: z.string().regex(/^\d{3,4}$/),
  }),
  publication: z.object({
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
    title_ru: z.string().min(2).max(255),
    title_uz: z.string().min(2).max(255),
    description_ru: z.string().min(2),
    description_uz: z.string().min(2),
    cover_url: z.string().url().or(z.literal("")),
    category_id: z.number().int().positive(),
    type: z.enum(["newspaper", "magazine"]),
    price_per_month: z.number().int().nonnegative(),
    is_published: z.boolean().optional(),
  }),
  publicationPatch: z.object({
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    title_ru: z.string().min(2).max(255).optional(),
    title_uz: z.string().min(2).max(255).optional(),
    description_ru: z.string().min(2).optional(),
    description_uz: z.string().min(2).optional(),
    cover_url: z.string().url().or(z.literal("")).optional(),
    category_id: z.number().int().positive().optional(),
    type: z.enum(["newspaper", "magazine"]).optional(),
    price_per_month: z.number().int().nonnegative().optional(),
    is_published: z.boolean().optional(),
  }),
  issue: z.object({
    publication_id: z.number().int().positive(),
    issue_number: z.number().int().positive(),
    title_ru: z.string().max(255).optional(),
    title_uz: z.string().max(255).optional(),
    published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pdf_url: z.string().url(),
    cover_url: z.string().url().optional(),
  }),
  blobUpload: z.object({
    pathname: z.string().min(1),
    content_type: z.string().min(1).optional(),
  }),
}

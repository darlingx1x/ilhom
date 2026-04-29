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
    card_number: z.string().regex(/^\d{13,19}$/),
    card_holder: z.string().min(2),
    card_expiry: z.string().regex(/^\d{2}\s*\/\s*\d{2}$/),
    card_cvc: z.string().regex(/^\d{3,4}$/),
  }),
}

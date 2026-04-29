import type { VercelRequest, VercelResponse } from "@vercel/node"
// TODO: Этап 3 — список изданий с фильтрами category, type, q, sort, page

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(501).json({ error: "Not implemented yet" })
}

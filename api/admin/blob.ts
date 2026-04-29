import type { VercelRequest, VercelResponse } from "@vercel/node"
// TODO: Этап 3 — выдача подписанных URL для прямой загрузки в Vercel Blob

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(501).json({ error: "Not implemented yet" })
}

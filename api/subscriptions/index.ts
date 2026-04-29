import type { VercelRequest, VercelResponse } from "@vercel/node"
// TODO: Этап 3 — GET (мои подписки), POST (создать подписку + платёж)

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(501).json({ error: "Not implemented yet" })
}

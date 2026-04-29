import type { VercelRequest, VercelResponse } from "@vercel/node"
// TODO: Этап 3 — admin метрики (users_count, active_subscriptions, monthly_revenue, issues_count)

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(501).json({ error: "Not implemented yet" })
}

import type { VercelRequest, VercelResponse } from "@vercel/node"
// TODO: Этап 3 — register handler
// import { sql } from "../_lib/db"
// import { hashPassword, signToken } from "../_lib/auth"
// import { parseBody, schemas } from "../_lib/validate"

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(501).json({ error: "Not implemented yet" })
}

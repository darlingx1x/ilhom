import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let cached: NeonQueryFunction<false, false> | null = null

function getClient(): NeonQueryFunction<false, false> {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured")
  }
  cached = neon(url)
  return cached
}

/** Tagged-template SQL: `sql\`SELECT * FROM x WHERE id = ${id}\``. Lazy-init клиента. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sql<T = any>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const client = getClient() as unknown as (
    s: TemplateStringsArray,
    ...v: unknown[]
  ) => Promise<T[]>
  return client(strings, ...values)
}

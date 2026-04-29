import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let cached: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (cached) return cached
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured (Vercel → Settings → Environment Variables)")
  }
  cached = neon(url)
  return cached
}

/** Прокси над neon-клиентом: тот же tagged-template API, но lazy-init. */
export const sql = new Proxy(function () {} as unknown as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    const fn = getSql() as unknown as (...a: unknown[]) => unknown
    return fn(...args)
  },
  get(_target, prop) {
    const fn = getSql() as unknown as Record<string | symbol, unknown>
    return fn[prop]
  },
}) as NeonQueryFunction<false, false>

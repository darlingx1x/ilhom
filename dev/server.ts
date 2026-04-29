/* Локальный dev API-сервер. Маршрутизирует /api/* в Vercel-handlers по файлам. */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { readdir, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_DIR = resolve(__dirname, "..", "api")
const PORT = Number(process.env.DEV_API_PORT ?? 3001)

interface Route {
  /** segments вида ["auth", "login"] или ["subscriptions", "[id]", "renew"] */
  segments: string[]
  filePath: string
}

let routes: Route[] = []

async function discoverRoutes(): Promise<Route[]> {
  const out: Route[] = []
  async function walk(dir: string, parentSegments: string[]) {
    const entries = await readdir(dir)
    for (const name of entries) {
      const full = join(dir, name)
      const s = await stat(full)
      if (s.isDirectory()) {
        if (name === "_lib") continue
        await walk(full, [...parentSegments, name])
      } else if (s.isFile() && /\.ts$/.test(name)) {
        const base = name.replace(/\.ts$/, "")
        const segments = base === "index" ? parentSegments : [...parentSegments, base]
        out.push({ segments, filePath: full })
      }
    }
  }
  await walk(API_DIR, [])
  return out
}

interface Match {
  route: Route
  params: Record<string, string>
}

function matchRoute(urlSegments: string[]): Match | null {
  // exact match first
  const exact = routes.find(
    (r) =>
      r.segments.length === urlSegments.length &&
      r.segments.every((s, i) => s === urlSegments[i]),
  )
  if (exact) return { route: exact, params: {} }

  // dynamic match
  for (const r of routes) {
    if (r.segments.length !== urlSegments.length) continue
    const params: Record<string, string> = {}
    let ok = true
    for (let i = 0; i < r.segments.length; i++) {
      const seg = r.segments[i]
      const url = urlSegments[i]
      const dyn = seg.match(/^\[(.+)\]$/)
      if (dyn) {
        params[dyn[1]] = decodeURIComponent(url)
      } else if (seg !== url) {
        ok = false
        break
      }
    }
    if (ok) return { route: r, params }
  }
  return null
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (chunks.length === 0) return undefined
  const raw = Buffer.concat(chunks).toString("utf8")
  if (!raw) return undefined
  const ct = req.headers["content-type"] || ""
  if (ct.includes("application/json")) {
    try { return JSON.parse(raw) } catch { return raw }
  }
  return raw
}

function shimResponse(raw: ServerResponse) {
  const res = raw as ServerResponse & {
    status: (code: number) => typeof res
    json: (body: unknown) => void
    send: (body: string | Buffer) => void
  }
  res.status = (code: number) => {
    res.statusCode = code
    return res
  }
  res.json = (body: unknown) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(body))
  }
  res.send = (body: string | Buffer) => res.end(body)
  return res
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`)
  const path = url.pathname
  if (!path.startsWith("/api/")) {
    res.statusCode = 404
    res.end("not an /api route")
    return
  }
  const urlSegments = path.replace(/^\/api\//, "").split("/").filter(Boolean)
  const match = matchRoute(urlSegments)
  if (!match) {
    res.statusCode = 404
    res.end(JSON.stringify({ error: `Route ${path} not found` }))
    return
  }

  const queryFromUrl: Record<string, string> = {}
  url.searchParams.forEach((v, k) => { queryFromUrl[k] = v })
  const query = { ...queryFromUrl, ...match.params }

  const body = await readBody(req)
  const vercelReq = Object.assign(req, { query, body }) as IncomingMessage & {
    query: Record<string, string>
    body: unknown
  }
  const vercelRes = shimResponse(res)

  try {
    const mod = await import(pathToFileURL(match.route.filePath).href)
    const handler = mod.default
    if (typeof handler !== "function") {
      vercelRes.status(500).json({ error: `Handler in ${match.route.filePath} has no default export` })
      return
    }
    await handler(vercelReq, vercelRes)
  } catch (err) {
    console.error("[dev:api]", err)
    if (!res.headersSent) vercelRes.status(500).json({ error: (err as Error).message })
  }
}

async function main() {
  if (!existsSync(API_DIR)) {
    console.error(`API directory not found at ${API_DIR}`)
    process.exit(1)
  }
  routes = await discoverRoutes()
  console.log(`[dev:api] discovered ${routes.length} routes:`)
  for (const r of routes.sort((a, b) => a.segments.join("/").localeCompare(b.segments.join("/")))) {
    console.log(`   /api/${r.segments.join("/")}`)
  }

  const server = createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error("[dev:api] uncaught", err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: "Internal server error" }))
      }
    })
  })
  server.listen(PORT, () => {
    console.log(`[dev:api] listening on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { neon } from "@neondatabase/serverless"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set. Add it to .env.local.")
    process.exit(1)
  }

  const sql = neon(url)
  const schema = await readFile(join(__dirname, "schema.sql"), "utf8")
  const seed = await readFile(join(__dirname, "seed.sql"), "utf8")

  console.log("→ applying schema.sql")
  for (const stmt of splitSql(schema)) {
    await sql(stmt)
  }
  console.log("✓ schema applied")

  console.log("→ applying seed.sql")
  for (const stmt of splitSql(seed)) {
    await sql(stmt)
  }
  console.log("✓ seed applied")
}

function splitSql(source: string): string[] {
  const stripped = source
    .split("\n")
    .map((line) => (line.trim().startsWith("--") ? "" : line))
    .join("\n")
  return stripped
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)

  const email = "admin@news.uz"
  const password = "admin123"
  const full_name = "Администратор"

  const exists = await sql`SELECT id FROM users WHERE email = ${email}`
  if (exists.length > 0) {
    console.log(`✓ admin ${email} already exists`)
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const r = await sql`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES (${email}, ${hash}, ${full_name}, 'admin')
    RETURNING id, email, role
  `
  console.log(`✓ admin created: id=${r[0].id} email=${r[0].email} password=${password}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

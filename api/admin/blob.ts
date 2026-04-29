import { withAuth } from "../_lib/auth"
import { schemas } from "../_lib/validate"
import { ensureMethod, mapError } from "../_lib/http"

export default withAuth(async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) return
  try {
    const data = schemas.blobUpload.parse(req.body)
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is not configured" })
      return
    }
    const ts = Date.now()
    const safe = data.pathname.replace(/[^a-zA-Z0-9._-]/g, "-")
    const pathname = `pdf/${ts}-${safe}`

    res.status(200).json({
      pathname,
      client_payload: {
        token,
        content_type: data.content_type ?? "application/pdf",
      },
      hint: "POST file body to https://blob.vercel-storage.com/<pathname> with Authorization: Bearer <token>",
    })
  } catch (err) {
    mapError(err, res)
  }
}, { role: "admin" })

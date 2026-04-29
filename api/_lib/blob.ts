import { put, type PutBlobResult } from "@vercel/blob"

const token = process.env.BLOB_READ_WRITE_TOKEN

type PutBody = Parameters<typeof put>[1]

export async function uploadBlob(
  pathname: string,
  body: PutBody,
  contentType?: string,
): Promise<PutBlobResult> {
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN is not configured")
  return put(pathname, body, {
    access: "public",
    token,
    contentType,
    addRandomSuffix: true,
  })
}

import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFetch } from "@/hooks/useFetch"
import { api, ApiError } from "@/lib/api"
import { formatIssueDate } from "@/lib/format"
import type { Issue, Publication } from "@/types"

interface IssuesResp {
  issues: Issue[]
}
interface PubsResp {
  publications: Publication[]
}

export function AdminIssuesPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data: pubsData } = useFetch<PubsResp>("/admin/publications")
  const pub = pubsData?.publications.find((p) => String(p.id) === id)
  const title = pub ? (lang === "uz" ? pub.title_uz : pub.title_ru) : ""

  const { data, loading, refetch } = useFetch<IssuesResp>(id ? `/admin/issues?publication_id=${id}` : null)
  const issues = data?.issues ?? []

  const [form, setForm] = useState({ issue_number: "", published_at: "", pdf_url: "" })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    setSaving(true)
    try {
      await api.post("/admin/issues", {
        publication_id: Number(id),
        issue_number: Number(form.issue_number),
        published_at: form.published_at,
        pdf_url: form.pdf_url,
      })
      setForm({ issue_number: "", published_at: "", pdf_url: "" })
      refetch()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Не удалось добавить")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(issueId: number) {
    if (!window.confirm("Удалить?")) return
    await api.delete(`/admin/issues?id=${issueId}`)
    refetch()
  }

  return (
    <div>
      <Link to="/admin/publications" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("admin.publications")}
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="mt-4 rule-thick" />

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="issue_number">Номер</Label>
          <Input id="issue_number" type="number" required value={form.issue_number} onChange={(e) => setForm({ ...form, issue_number: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="published_at">Дата</Label>
          <Input id="published_at" type="date" required value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pdf_url">PDF URL</Label>
          <Input id="pdf_url" type="url" required value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} placeholder="https://..." />
        </div>
        {error && <div className="sm:col-span-4 text-sm font-editorial text-accent">{error}</div>}
        <div className="sm:col-span-4">
          <Button type="submit" variant="accent" disabled={saving}>
            {saving ? t("common.loading") : `+ ${t("admin.upload_pdf")}`}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="mt-8 font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : issues.length === 0 ? (
        <div className="mt-8 font-editorial text-ink-mute">Пока нет номеров</div>
      ) : (
        <ul className="mt-8 divide-y divide-paper-line">
          {issues.map((iss) => (
            <li key={iss.id} className="py-5 flex items-center justify-between">
              <div>
                <div className="font-display text-xl font-bold">№ {String(iss.issue_number).padStart(3, "0")}</div>
                <div className="text-sm font-editorial text-ink-mute">{formatIssueDate(iss.published_at, lang)}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={iss.pdf_url} target="_blank" rel="noreferrer">PDF</a>
                </Button>
                <Button onClick={() => onDelete(iss.id)} variant="ghost" size="sm">{t("common.delete")}</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

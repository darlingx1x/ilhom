import { Link, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFetch } from "@/hooks/useFetch"
import { api, ApiError } from "@/lib/api"
import type { Category, Publication } from "@/types"

interface CategoriesResp {
  categories: Category[]
}

interface PublicationsResp {
  publications: Publication[]
}

interface Form {
  slug: string
  title_ru: string
  title_uz: string
  description_ru: string
  description_uz: string
  cover_url: string
  category_id: number
  type: "newspaper" | "magazine"
  price_per_month: number
  is_published: boolean
}

const empty: Form = {
  slug: "",
  title_ru: "",
  title_uz: "",
  description_ru: "",
  description_uz: "",
  cover_url: "",
  category_id: 1,
  type: "newspaper",
  price_per_month: 0,
  is_published: true,
}

export function AdminPublicationFormPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: catsData } = useFetch<CategoriesResp>("/categories")
  const { data: pubsData } = useFetch<PublicationsResp>(isEdit ? "/admin/publications" : null)

  const [form, setForm] = useState<Form>(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    const pub = pubsData?.publications.find((p) => String(p.id) === id)
    if (pub) {
      setForm({
        slug: pub.slug,
        title_ru: pub.title_ru,
        title_uz: pub.title_uz,
        description_ru: pub.description_ru,
        description_uz: pub.description_uz,
        cover_url: pub.cover_url || "",
        category_id: pub.category_id,
        type: pub.type,
        price_per_month: pub.price_per_month,
        is_published: pub.is_published,
      })
    }
  }, [isEdit, pubsData, id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (isEdit) {
        await api.patch(`/admin/publications?id=${id}`, form)
      } else {
        await api.post("/admin/publications", form)
      }
      navigate("/admin/publications", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Не удалось сохранить")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/admin/publications" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("admin.publications")}
      </Link>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? t("common.edit") : t("admin.add_publication")}
      </h2>
      <div className="mt-4 rule-thick" />

      <form className="mt-10 space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title_ru">Название (ru)</Label>
            <Input id="title_ru" value={form.title_ru} onChange={(e) => setForm({ ...form, title_ru: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_uz">Sarlavha (uz)</Label>
            <Input id="title_uz" value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">{t("common.per_month").replace(/^\//, "")}</Label>
            <Input id="price" type="number" value={form.price_per_month} onChange={(e) => setForm({ ...form, price_per_month: Number(e.target.value) })} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">{t("catalog.filter_type")}</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "newspaper" | "magazine" })}
              className="w-full h-11 bg-transparent border-0 border-b border-paper-line font-editorial focus:outline-none focus:border-ink"
            >
              <option value="newspaper">{t("catalog.type_newspaper")}</option>
              <option value="magazine">{t("catalog.type_magazine")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("catalog.filter_category")}</Label>
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
              className="w-full h-11 bg-transparent border-0 border-b border-paper-line font-editorial focus:outline-none focus:border-ink"
            >
              {(catsData?.categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name_ru}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_url">Cover URL</Label>
          <Input id="cover_url" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc_ru">Описание (ru)</Label>
          <textarea
            id="desc_ru"
            value={form.description_ru}
            onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
            rows={3}
            className="w-full bg-transparent border-0 border-b border-paper-line font-editorial py-2 focus:outline-none focus:border-ink resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc_uz">Tavsif (uz)</Label>
          <textarea
            id="desc_uz"
            value={form.description_uz}
            onChange={(e) => setForm({ ...form, description_uz: e.target.value })}
            rows={3}
            className="w-full bg-transparent border-0 border-b border-paper-line font-editorial py-2 focus:outline-none focus:border-ink resize-none"
            required
          />
        </div>

        <label className="flex items-center gap-2 small-caps font-sans text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          опубликовано
        </label>

        {error && <div className="text-sm font-editorial text-accent">{error}</div>}

        <div className="flex items-center gap-3 pt-4">
          <Button variant="accent" type="submit" disabled={saving}>{saving ? t("common.loading") : t("common.save")}</Button>
          <Button asChild variant="ghost" type="button">
            <Link to="/admin/publications">{t("common.cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}

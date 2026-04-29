import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockCategories, mockPublications } from "@/lib/mockData"

export function AdminPublicationFormPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const isEdit = !!id
  const pub = isEdit ? mockPublications.find((p) => String(p.id) === id) : null

  return (
    <div className="max-w-2xl">
      <Link to="/admin/publications" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("admin.publications")}
      </Link>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
        {isEdit ? t("common.edit") : t("admin.add_publication")}
      </h2>
      <div className="mt-4 rule-thick" />

      <form className="mt-10 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title_ru">Название (ru)</Label>
            <Input id="title_ru" defaultValue={pub?.title_ru} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title_uz">Sarlavha (uz)</Label>
            <Input id="title_uz" defaultValue={pub?.title_uz} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" defaultValue={pub?.slug} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">{t("common.per_month").replace(/^\//, "")}</Label>
            <Input id="price" type="number" defaultValue={pub?.price_per_month} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">{t("catalog.filter_type")}</Label>
            <select
              id="type"
              defaultValue={pub?.type}
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
              defaultValue={pub?.category_id}
              className="w-full h-11 bg-transparent border-0 border-b border-paper-line font-editorial focus:outline-none focus:border-ink"
            >
              {mockCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === "uz" ? c.name_uz : c.name_ru}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc_ru">Описание (ru)</Label>
          <textarea
            id="desc_ru"
            defaultValue={pub?.description_ru}
            rows={3}
            className="w-full bg-transparent border-0 border-b border-paper-line font-editorial py-2 focus:outline-none focus:border-ink resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc_uz">Tavsif (uz)</Label>
          <textarea
            id="desc_uz"
            defaultValue={pub?.description_uz}
            rows={3}
            className="w-full bg-transparent border-0 border-b border-paper-line font-editorial py-2 focus:outline-none focus:border-ink resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button variant="accent">{t("common.save")}</Button>
          <Button asChild variant="ghost">
            <Link to="/admin/publications">{t("common.cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}

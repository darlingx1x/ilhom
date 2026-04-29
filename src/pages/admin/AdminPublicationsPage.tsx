import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import type { Publication } from "@/types"

interface Resp {
  publications: (Publication & { issues_count: number })[]
}

export function AdminPublicationsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading, refetch } = useFetch<Resp>("/admin/publications")
  const items = data?.publications ?? []

  async function onDelete(id: number) {
    if (!window.confirm(lang === "uz" ? "O'chirilsinmi?" : "Удалить?")) return
    await api.delete(`/admin/publications?id=${id}`)
    refetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold tracking-tight">{t("admin.publications")}</h2>
        <Button asChild variant="accent">
          <Link to="/admin/publications/new">+ {t("admin.add_publication")}</Link>
        </Button>
      </div>
      <div className="mt-4 rule-thick" />

      {loading ? (
        <div className="mt-8 font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : (
        <table className="mt-8 w-full font-editorial">
          <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
            <tr className="border-b border-paper-line">
              <th className="py-3">Название</th>
              <th className="py-3">Тип</th>
              <th className="py-3">Цена / мес</th>
              <th className="py-3">Номеров</th>
              <th className="py-3">Статус</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const title = lang === "uz" ? p.title_uz : p.title_ru
              return (
                <tr key={p.id} className="border-b border-paper-line hover:bg-paper-deep/30">
                  <td className="py-4 font-display font-bold">{title}</td>
                  <td className="py-4">{p.type === "newspaper" ? t("catalog.type_newspaper") : t("catalog.type_magazine")}</td>
                  <td className="py-4">{formatPrice(p.price_per_month, lang)} {t("common.currency")}</td>
                  <td className="py-4">{p.issues_count}</td>
                  <td className="py-4">
                    <Badge variant={p.is_published ? "accent" : "muted"}>
                      {p.is_published ? "live" : "draft"}
                    </Badge>
                  </td>
                  <td className="py-4 text-right">
                    <Link to={`/admin/publications/${p.id}/issues`} className="text-sm small-caps font-sans underline-grow mr-4">
                      {t("admin.issues")}
                    </Link>
                    <Link to={`/admin/publications/${p.id}/edit`} className="text-sm small-caps font-sans underline-grow mr-4">
                      {t("common.edit")}
                    </Link>
                    <button onClick={() => onDelete(p.id)} className="text-sm small-caps font-sans text-accent underline-grow">
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

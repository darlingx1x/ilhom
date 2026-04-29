import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/Container"
import { PublicationCard } from "@/components/catalog/PublicationCard"
import { Input } from "@/components/ui/input"
import { useFetch } from "@/hooks/useFetch"
import type { Category, Publication } from "@/types"
import { cn } from "@/lib/utils"

interface PublicationsResponse {
  publications: Publication[]
  total: number
}

interface CategoriesResponse {
  categories: Category[]
}

export function CatalogPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const [params, setParams] = useSearchParams()
  const category = params.get("category") || ""
  const type = params.get("type") || ""
  const [q, setQ] = useState("")
  const [sort, setSort] = useState<"default" | "price_asc" | "price_desc">("default")

  const queryString = useMemo(() => {
    const sp = new URLSearchParams()
    if (category) sp.set("category", category)
    if (type) sp.set("type", type)
    if (q) sp.set("q", q)
    if (sort !== "default") sp.set("sort", sort)
    return sp.toString()
  }, [category, type, q, sort])

  const { data, loading } = useFetch<PublicationsResponse>(
    `/publications${queryString ? "?" + queryString : ""}`,
  )
  const { data: catData } = useFetch<CategoriesResponse>("/categories")

  const publications = data?.publications ?? []
  const categories = catData?.categories ?? []

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="Catalog · 2026"
        title={t("catalog.title")}
        lead={t("home.deck_left")}
      />

      <section className="container pb-20">
        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 space-y-8">
              <Input
                placeholder={t("catalog.search_placeholder")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <div>
                <div className="small-caps font-sans text-[0.72rem] font-semibold text-ink-mute mb-3">
                  {t("catalog.filter_category")}
                </div>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setParam("category", "")}
                      className={cn(
                        "font-editorial",
                        !category ? "text-accent font-semibold" : "text-ink hover:text-accent",
                      )}
                    >
                      {lang === "uz" ? "Hammasi" : "Все"}
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setParam("category", c.slug)}
                        className={cn(
                          "font-editorial",
                          category === c.slug ? "text-accent font-semibold" : "text-ink hover:text-accent",
                        )}
                      >
                        {lang === "uz" ? c.name_uz : c.name_ru}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="small-caps font-sans text-[0.72rem] font-semibold text-ink-mute mb-3">
                  {t("catalog.filter_type")}
                </div>
                <div className="flex gap-2">
                  {[
                    { v: "", label: lang === "uz" ? "Hammasi" : "Все" },
                    { v: "newspaper", label: t("catalog.type_newspaper") },
                    { v: "magazine", label: t("catalog.type_magazine") },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setParam("type", opt.v)}
                      className={cn(
                        "px-3 py-1 small-caps text-[0.7rem] font-sans border transition-colors",
                        type === opt.v
                          ? "bg-ink text-paper border-ink"
                          : "border-paper-line text-ink hover:border-ink",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-paper-line">
              <div className="font-editorial text-ink-mute">
                {publications.length} {lang === "uz" ? "ta nashr" : "изданий"}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-transparent border-b border-paper-line text-sm font-sans py-1 focus:outline-none focus:border-ink"
              >
                <option value="default">{t("catalog.sort_default")}</option>
                <option value="price_asc">{t("catalog.sort_price_asc")}</option>
                <option value="price_desc">{t("catalog.sort_price_desc")}</option>
              </select>
            </div>

            {loading ? (
              <div className="py-20 text-center font-editorial text-ink-mute">{t("common.loading")}…</div>
            ) : publications.length === 0 ? (
              <div className="font-editorial text-ink-mute py-20 text-center">
                {t("catalog.empty")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {publications.map((p) => (
                  <PublicationCard key={p.id} publication={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

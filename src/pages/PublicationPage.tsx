import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PublicationCover } from "@/components/catalog/PublicationCover"
import { mockPublications, mockCategories } from "@/lib/mockData"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PublicationPage() {
  const { slug } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const pub = mockPublications.find((p) => p.slug === slug)
  const [period, setPeriod] = useState<1 | 3 | 12>(1)

  if (!pub) {
    return (
      <div className="container py-32 text-center">
        <div className="font-display text-4xl">404</div>
        <p className="mt-2 text-ink-mute">Publication not found</p>
      </div>
    )
  }

  const title = lang === "uz" ? pub.title_uz : pub.title_ru
  const description = lang === "uz" ? pub.description_uz : pub.description_ru
  const category = mockCategories.find((c) => c.id === pub.category_id)
  const total = pub.price_per_month * period

  return (
    <>
      <section className="border-b-2 border-ink">
        <div className="container py-12 md:py-20">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 md:col-span-5">
              <div className="border border-paper-line shadow-clip">
                <PublicationCover title={title} variant={pub.type} />
              </div>
            </div>

            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center gap-3">
                <Badge variant="accent">
                  {pub.type === "newspaper" ? t("catalog.type_newspaper") : t("catalog.type_magazine")}
                </Badge>
                {category && (
                  <Badge variant="muted">{lang === "uz" ? category.name_uz : category.name_ru}</Badge>
                )}
              </div>

              <h1 className="mt-5 font-display text-hero font-black leading-[1.02] tracking-tight text-balance">
                {title}
              </h1>

              <p className="mt-6 font-editorial text-deck text-ink-soft text-pretty max-w-xl">
                {description}
              </p>

              <div className="mt-10 pt-8 border-t-2 border-ink">
                <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
                  Subscription period
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {([1, 3, 12] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPeriod(m)}
                      className={cn(
                        "px-5 py-3 border-2 transition-colors text-left",
                        period === m
                          ? "border-ink bg-ink text-paper"
                          : "border-paper-line text-ink hover:border-ink",
                      )}
                    >
                      <div className="font-display text-xl font-bold">
                        {t(`publication.period_${m}`)}
                      </div>
                      <div className="mt-1 text-[0.72rem] small-caps font-sans opacity-80">
                        {formatPrice(pub.price_per_month * m, lang)} {t("common.currency")}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="small-caps text-[0.7rem] font-sans text-ink-mute">
                      {t("checkout.total")}
                    </div>
                    <div className="font-display text-4xl font-black">
                      {formatPrice(total, lang)} <span className="text-base text-ink-mute">{t("common.currency")}</span>
                    </div>
                  </div>
                  <Button asChild variant="accent" size="lg">
                    <Link to={`/checkout/${pub.id}?period=${period}`}>
                      {t("publication.subscribe")} →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-4">
            <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
              About
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight">{t("publication.about")}</h2>
          </div>
          <div className="col-span-12 md:col-span-8 columns-editorial font-editorial text-ink text-pretty">
            <p className="mb-4">{description}</p>
            <p className="mb-4">
              {lang === "uz"
                ? "Nashr o'z auditoriyasi bilan uzoq yillar davomida chuqur aloqada bo'lib, dolzarb mavzularni yoritadi va malakali tahlil taqdim etadi."
                : "Издание уже много лет ведёт с читателем глубокий разговор, освещая актуальные темы и предлагая профессиональную аналитику."}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

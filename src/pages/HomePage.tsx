import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PublicationCard } from "@/components/catalog/PublicationCard"
import { mockPublications, mockCategories } from "@/lib/mockData"

export function HomePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const tickerWords = t("home.ticker_words", { returnObjects: true }) as string[]

  const featured = mockPublications.slice(0, 8)

  return (
    <>
      {/* Ticker */}
      <div className="border-b border-ink bg-ink text-paper overflow-hidden">
        <div className="ticker-track py-2 small-caps text-[0.78rem] font-sans tracking-[0.18em]">
          {[...tickerWords, ...tickerWords, ...tickerWords].map((w, i) => (
            <span key={i} className="px-6 inline-flex items-center gap-6">
              <span>{w}</span>
              <span className="text-accent-glow">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="border-b-2 border-ink">
        <div className="container py-12 md:py-20">
          <div className="grid grid-cols-12 gap-6 md:gap-10">
            <div className="col-span-12 lg:col-span-8">
              <Badge variant="accent" className="mb-6">
                Vol. XXXV — № 1247
              </Badge>
              <h1 className="font-display text-masthead font-black tracking-tight text-balance leading-[0.92]">
                {t("home.hero_title")}
              </h1>
              <p className="mt-8 font-editorial text-deck text-ink-soft max-w-xl text-pretty">
                {t("home.hero_lead")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild variant="accent" size="lg">
                  <Link to="/catalog">{t("home.cta_subscribe")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/catalog">{t("home.cta_browse")}</Link>
                </Button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <div className="rule-thick" />
              <p className="mt-4 font-editorial text-base text-ink drop-cap text-pretty">
                {t("home.deck_left")}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-paper-line">
                <Stat number="40" label={t("home.stat_pubs")} />
                <Stat number="12K" label={t("home.stat_readers")} />
                <Stat number="3.2K" label={t("home.stat_issues")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES strip */}
      <section className="border-b border-paper-line bg-paper-deep/40">
        <div className="container py-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="small-caps font-sans text-[0.72rem] font-semibold text-ink-mute tracking-[0.22em]">
            {t("home.section_categories")}
          </span>
          {mockCategories.map((c) => (
            <Link
              key={c.id}
              to={`/catalog?category=${c.slug}`}
              className="font-editorial text-base text-ink underline-grow"
            >
              {lang === "uz" ? c.name_uz : c.name_ru}
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-10 border-b-2 border-ink pb-4">
          <div>
            <div className="small-caps text-[0.78rem] font-sans font-semibold text-accent tracking-[0.22em]">
              Editor's pick
            </div>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-black tracking-tight">
              {t("home.section_popular")}
            </h2>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:block small-caps text-[0.78rem] font-sans font-semibold underline-grow"
          >
            {t("nav.catalog")} →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.map((p) => (
            <PublicationCard key={p.id} publication={p} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y-2 border-ink bg-paper-deep">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-12 gap-10 items-start">
            <div className="col-span-12 md:col-span-4">
              <div className="small-caps text-[0.78rem] font-sans font-semibold text-accent tracking-[0.22em]">
                Workflow · 2026
              </div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-black leading-[1.02] tracking-tight">
                {t("home.section_how")}
              </h2>
              <div className="mt-6 rule-thick" />
            </div>

            <div className="col-span-12 md:col-span-8 grid sm:grid-cols-3 gap-8">
              <Step n={1} title={t("home.how_step_1")} desc={t("home.how_step_1_desc")} />
              <Step n={2} title={t("home.how_step_2")} desc={t("home.how_step_2_desc")} />
              <Step n={3} title={t("home.how_step_3")} desc={t("home.how_step_3_desc")} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="container py-20 md:py-28 text-center">
        <div className="small-caps text-[0.78rem] font-sans font-semibold text-accent tracking-[0.22em]">
          Subscribe
        </div>
        <h2 className="mt-3 font-display text-4xl md:text-6xl font-black leading-[1.02] tracking-tight max-w-3xl mx-auto text-balance">
          Откройте архив <span className="italic font-medium">сорока изданий</span> в одном кабинете
        </h2>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/register">{t("nav.register")} →</Link>
          </Button>
        </div>
      </section>
    </>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-black leading-none">{number}</div>
      <div className="mt-1 text-[0.7rem] small-caps font-sans text-ink-mute leading-tight">{label}</div>
    </div>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-5xl font-black text-accent leading-none">
          {String(n).padStart(2, "0")}
        </span>
        <div className="rule flex-1 mb-2" />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight">{title}</h3>
      <p className="mt-2 font-editorial text-ink-soft text-pretty">{desc}</p>
    </div>
  )
}

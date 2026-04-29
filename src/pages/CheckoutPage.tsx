import { Link, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockPublications } from "@/lib/mockData"
import { formatPrice } from "@/lib/format"

export function CheckoutPage() {
  const { publicationId } = useParams()
  const [params] = useSearchParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const period = Number(params.get("period") || 1) as 1 | 3 | 12
  const pub = mockPublications.find((p) => String(p.id) === publicationId)

  if (!pub) {
    return (
      <div className="container py-24 text-center">
        <div className="font-display text-3xl">404</div>
      </div>
    )
  }

  const title = lang === "uz" ? pub.title_uz : pub.title_ru
  const total = pub.price_per_month * period

  return (
    <section className="container py-16 md:py-20">
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-7">
          <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
            Checkout · simulation
          </div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-tight">
            {t("checkout.title")}
          </h1>
          <div className="mt-6 rule-thick" />

          <form className="mt-10 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="card">{t("checkout.card_number")}</Label>
              <Input id="card" required placeholder="0000 0000 0000 0000" maxLength={19} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holder">{t("checkout.card_holder")}</Label>
              <Input id="holder" required placeholder="IVAN IVANOV" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exp">{t("checkout.card_expiry")}</Label>
                <Input id="exp" required placeholder="04 / 28" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">{t("checkout.card_cvc")}</Label>
                <Input id="cvc" required type="password" maxLength={4} placeholder="•••" />
              </div>
            </div>
            <Button type="submit" variant="accent" size="lg" className="w-full">
              {t("checkout.pay")} · {formatPrice(total, lang)} {t("common.currency")}
            </Button>
          </form>
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <div className="border border-ink p-8 bg-paper-deep/40">
            <div className="small-caps font-sans text-[0.72rem] font-semibold text-ink-mute mb-3">
              Order
            </div>
            <h3 className="font-display text-3xl font-bold leading-tight">{title}</h3>
            <div className="mt-4 text-sm font-editorial text-ink-soft">
              {t(`publication.period_${period}`)}
            </div>

            <div className="mt-8 pt-6 border-t border-paper-line space-y-2 font-editorial">
              <Row label={t("common.per_month").replace(/^\//, "")} value={`${formatPrice(pub.price_per_month, lang)} ${t("common.currency")}`} />
              <Row label="×" value={String(period)} />
            </div>
            <div className="mt-6 pt-6 border-t-2 border-ink flex items-baseline justify-between">
              <span className="small-caps font-sans text-[0.78rem] font-semibold">
                {t("checkout.total")}
              </span>
              <span className="font-display text-3xl font-black">
                {formatPrice(total, lang)} <span className="text-sm text-ink-mute">{t("common.currency")}</span>
              </span>
            </div>

            <Link
              to={`/publications/${pub.slug}`}
              className="mt-6 block text-center small-caps text-[0.78rem] font-sans underline-grow"
            >
              ← {t("common.back")}
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}

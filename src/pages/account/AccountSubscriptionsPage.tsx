import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockPublications } from "@/lib/mockData"
import { formatDate, formatPrice } from "@/lib/format"

const demoSubscriptions = [
  { id: 1, publication_id: 1, period_months: 3, start_date: "2026-04-01", end_date: "2026-07-01", status: "active" as const, total_amount: 84000 },
  { id: 2, publication_id: 4, period_months: 12, start_date: "2026-01-15", end_date: "2027-01-15", status: "active" as const, total_amount: 384000 },
  { id: 3, publication_id: 5, period_months: 1, start_date: "2026-02-01", end_date: "2026-03-01", status: "expired" as const, total_amount: 22000 },
]

export function AccountSubscriptionsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("account.subscriptions")}</h2>
      <div className="mt-4 rule-thick" />

      {demoSubscriptions.length === 0 ? (
        <div className="py-20 text-center font-editorial text-ink-mute">{t("account.no_subscriptions")}</div>
      ) : (
        <ul className="mt-6 divide-y divide-paper-line">
          {demoSubscriptions.map((s) => {
            const pub = mockPublications.find((p) => p.id === s.publication_id)!
            const title = lang === "uz" ? pub.title_uz : pub.title_ru
            return (
              <li key={s.id} className="py-6 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold">{title}</h3>
                    <Badge variant={s.status === "active" ? "accent" : "muted"}>
                      {t(`account.status_${s.status}`)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-editorial text-ink-mute">
                    {t("account.until")} {formatDate(s.end_date, lang)} · {formatPrice(s.total_amount, lang)} {t("common.currency")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/account/subscriptions/${s.id}`}>{t("account.details")}</Link>
                  </Button>
                  {s.status === "active" && (
                    <Button variant="ghost" size="sm">{t("account.renew")}</Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

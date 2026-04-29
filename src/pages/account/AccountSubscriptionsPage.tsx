import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFetch } from "@/hooks/useFetch"
import { api } from "@/lib/api"
import { formatDate, formatPrice } from "@/lib/format"
import type { Subscription, SubscriptionStatus } from "@/types"

interface Resp {
  subscriptions: Subscription[]
}

export function AccountSubscriptionsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading, refetch } = useFetch<Resp>("/subscriptions")

  const subs = data?.subscriptions ?? []

  async function renew(id: number) {
    await api.post(`/subscriptions/${id}/renew`)
    refetch()
  }
  async function cancel(id: number) {
    await api.post(`/subscriptions/${id}/cancel`)
    refetch()
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("account.subscriptions")}</h2>
      <div className="mt-4 rule-thick" />

      {loading ? (
        <div className="py-20 text-center font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : subs.length === 0 ? (
        <div className="py-20 text-center font-editorial text-ink-mute">{t("account.no_subscriptions")}</div>
      ) : (
        <ul className="mt-6 divide-y divide-paper-line">
          {subs.map((s) => {
            const title = lang === "uz" ? s.publication?.title_uz : s.publication?.title_ru
            const status = s.status as SubscriptionStatus
            return (
              <li key={s.id} className="py-6 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold">{title}</h3>
                    <Badge variant={status === "active" ? "accent" : "muted"}>
                      {t(`account.status_${status}`)}
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
                  {status === "active" && (
                    <>
                      <Button onClick={() => renew(s.id)} variant="ghost" size="sm">
                        {t("account.renew")}
                      </Button>
                      <Button onClick={() => cancel(s.id)} variant="ghost" size="sm">
                        {t("account.cancel")}
                      </Button>
                    </>
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

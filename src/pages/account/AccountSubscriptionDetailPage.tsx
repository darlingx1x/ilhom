import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/hooks/useFetch"
import { formatDate, formatIssueDate } from "@/lib/format"
import type { Issue, Subscription, SubscriptionStatus } from "@/types"

interface Resp {
  subscription: Subscription
  issues: Issue[]
  access_granted: boolean
}

export function AccountSubscriptionDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading } = useFetch<Resp>(id ? `/subscriptions/${id}` : null)

  if (loading || !data) {
    return <div className="py-20 text-center font-editorial text-ink-mute">{t("common.loading")}…</div>
  }

  const s = data.subscription
  const status = s.status as SubscriptionStatus
  const title = lang === "uz" ? s.publication?.title_uz : s.publication?.title_ru

  return (
    <div>
      <Link to="/account/subscriptions" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("account.subscriptions")}
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
        <Badge variant={status === "active" ? "accent" : "muted"}>{t(`account.status_${status}`)}</Badge>
      </div>
      <p className="mt-1 font-editorial text-ink-mute">#{s.id} · {t("account.until")} {formatDate(s.end_date, lang)}</p>
      <div className="mt-6 rule-thick" />

      <h3 className="mt-10 font-display text-2xl font-bold">{t("account.issues_archive")}</h3>
      {data.issues.length === 0 ? (
        <div className="mt-6 font-editorial text-ink-mute">
          {lang === "uz" ? "Bu obuna davri uchun sonlar yo'q" : "Номеров за период подписки пока нет"}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-paper-line">
          {data.issues.map((iss) => (
            <li key={iss.id} className="py-5 flex items-center justify-between">
              <div>
                <div className="font-display text-lg font-bold">№ {String(iss.issue_number).padStart(3, "0")}</div>
                <div className="text-sm font-editorial text-ink-mute">{formatIssueDate(iss.published_at, lang)}</div>
              </div>
              {data.access_granted && iss.pdf_url ? (
                <Button asChild variant="outline" size="sm">
                  <a href={iss.pdf_url} target="_blank" rel="noreferrer">
                    {t("account.download_pdf")} ↓
                  </a>
                </Button>
              ) : (
                <span className="text-sm font-editorial text-ink-mute">
                  {lang === "uz" ? "obuna talab qilinadi" : "требуется активная подписка"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockPublications } from "@/lib/mockData"
import { formatDate, formatIssueDate } from "@/lib/format"

const demoIssues = [
  { id: 1, issue_number: 18, published_at: "2026-04-25", title_ru: "Выпуск № 18", title_uz: "Soni № 18" },
  { id: 2, issue_number: 17, published_at: "2026-04-18", title_ru: "Выпуск № 17", title_uz: "Soni № 17" },
  { id: 3, issue_number: 16, published_at: "2026-04-11", title_ru: "Выпуск № 16", title_uz: "Soni № 16" },
  { id: 4, issue_number: 15, published_at: "2026-04-04", title_ru: "Выпуск № 15", title_uz: "Soni № 15" },
]

export function AccountSubscriptionDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const pub = mockPublications[0]
  const title = lang === "uz" ? pub.title_uz : pub.title_ru

  return (
    <div>
      <Link to="/account/subscriptions" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("account.subscriptions")}
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
        <Badge variant="accent">{t("account.status_active")}</Badge>
      </div>
      <p className="mt-1 font-editorial text-ink-mute">#{id} · {t("account.until")} {formatDate("2026-07-01", lang)}</p>
      <div className="mt-6 rule-thick" />

      <h3 className="mt-10 font-display text-2xl font-bold">{t("account.issues_archive")}</h3>
      <ul className="mt-4 divide-y divide-paper-line">
        {demoIssues.map((iss) => (
          <li key={iss.id} className="py-5 flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-bold">№ {String(iss.issue_number).padStart(3, "0")}</div>
              <div className="text-sm font-editorial text-ink-mute">{formatIssueDate(iss.published_at, lang)}</div>
            </div>
            <Button variant="outline" size="sm">{t("account.download_pdf")} ↓</Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

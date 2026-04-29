import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { mockPublications } from "@/lib/mockData"
import { formatIssueDate } from "@/lib/format"

const demoIssues = [
  { id: 1, issue_number: 18, published_at: "2026-04-25" },
  { id: 2, issue_number: 17, published_at: "2026-04-18" },
  { id: 3, issue_number: 16, published_at: "2026-04-11" },
]

export function AdminIssuesPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const pub = mockPublications.find((p) => String(p.id) === id)
  const title = pub ? (lang === "uz" ? pub.title_uz : pub.title_ru) : ""

  return (
    <div>
      <Link to="/admin/publications" className="small-caps text-[0.78rem] font-sans underline-grow">
        ← {t("admin.publications")}
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <h2 className="font-display text-3xl font-bold tracking-tight">{title}</h2>
        <Button variant="accent">+ {t("admin.upload_pdf")}</Button>
      </div>
      <div className="mt-4 rule-thick" />

      <ul className="mt-8 divide-y divide-paper-line">
        {demoIssues.map((iss) => (
          <li key={iss.id} className="py-5 flex items-center justify-between">
            <div>
              <div className="font-display text-xl font-bold">№ {String(iss.issue_number).padStart(3, "0")}</div>
              <div className="text-sm font-editorial text-ink-mute">
                {formatIssueDate(iss.published_at, lang)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">PDF</Button>
              <Button variant="ghost" size="sm">{t("common.delete")}</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

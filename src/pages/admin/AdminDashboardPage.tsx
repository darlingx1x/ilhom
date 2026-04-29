import { useTranslation } from "react-i18next"
import { useFetch } from "@/hooks/useFetch"
import { formatDate, formatPrice } from "@/lib/format"
import type { AdminStats } from "@/types"

interface RecentSubscription {
  id: number
  created_at: string
  total_amount: number
  status: string
  email: string
  title_ru: string
  title_uz: string
}

interface Resp {
  stats: AdminStats
  recent_subscriptions: RecentSubscription[]
}

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading } = useFetch<Resp>("/admin/stats")

  const metrics = data
    ? [
        { label: t("admin.metric_users"), value: String(data.stats.users_count) },
        { label: t("admin.metric_subs"), value: String(data.stats.active_subscriptions) },
        {
          label: t("admin.metric_revenue"),
          value: `${formatPrice(data.stats.monthly_revenue, lang)} ${t("common.currency")}`,
        },
        { label: t("admin.metric_issues"), value: String(data.stats.issues_count) },
      ]
    : []

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
      <div className="mt-4 rule-thick" />

      {loading ? (
        <div className="mt-8 font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="border border-paper-line bg-white p-6">
                <div className="small-caps font-sans text-[0.72rem] text-ink-mute">{m.label}</div>
                <div className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <h3 className="mt-12 font-display text-2xl font-bold tracking-tight">
            {lang === "uz" ? "So'nggi obunalar" : "Последние подписки"}
          </h3>
          <div className="mt-3 rule" />
          <table className="mt-6 w-full font-editorial">
            <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
              <tr className="border-b border-paper-line">
                <th className="py-3">Дата</th>
                <th className="py-3">Email</th>
                <th className="py-3">Издание</th>
                <th className="py-3">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_subscriptions ?? []).map((s) => (
                <tr key={s.id} className="border-b border-paper-line">
                  <td className="py-3">{formatDate(s.created_at, lang)}</td>
                  <td className="py-3">{s.email}</td>
                  <td className="py-3 font-display font-bold">{lang === "uz" ? s.title_uz : s.title_ru}</td>
                  <td className="py-3">{formatPrice(s.total_amount, lang)} {t("common.currency")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

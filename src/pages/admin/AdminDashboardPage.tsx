import { useTranslation } from "react-i18next"
import { formatPrice } from "@/lib/format"

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"

  const metrics = [
    { label: t("admin.metric_users"), value: "1 248" },
    { label: t("admin.metric_subs"), value: "412" },
    { label: t("admin.metric_revenue"), value: `${formatPrice(28_400_000, lang)} ${t("common.currency")}` },
    { label: t("admin.metric_issues"), value: "187" },
  ]

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("admin.dashboard")}</h2>
      <div className="mt-4 rule-thick" />

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
    </div>
  )
}

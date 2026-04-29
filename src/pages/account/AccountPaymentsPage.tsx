import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatPrice } from "@/lib/format"

const demoPayments = [
  { id: 1, amount: 84000, card_last4: "4421", status: "success" as const, paid_at: "2026-04-01T10:24:00" },
  { id: 2, amount: 384000, card_last4: "4421", status: "success" as const, paid_at: "2026-01-15T08:11:00" },
  { id: 3, amount: 22000, card_last4: "8830", status: "success" as const, paid_at: "2026-02-01T17:30:00" },
]

export function AccountPaymentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("account.payments")}</h2>
      <div className="mt-4 rule-thick" />

      <table className="mt-8 w-full font-editorial">
        <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
          <tr className="border-b border-paper-line">
            <th className="py-3">Дата</th>
            <th className="py-3">Карта</th>
            <th className="py-3">Сумма</th>
            <th className="py-3">Статус</th>
          </tr>
        </thead>
        <tbody>
          {demoPayments.map((p) => (
            <tr key={p.id} className="border-b border-paper-line">
              <td className="py-4">{formatDate(p.paid_at, lang)}</td>
              <td className="py-4 font-mono">•••• {p.card_last4}</td>
              <td className="py-4 font-display font-bold">{formatPrice(p.amount, lang)} {t("common.currency")}</td>
              <td className="py-4">
                <Badge variant={p.status === "success" ? "accent" : "muted"}>{p.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

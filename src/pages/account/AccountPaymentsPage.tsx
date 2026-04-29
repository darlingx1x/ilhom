import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/hooks/useFetch"
import { formatDate, formatPrice } from "@/lib/format"

interface PaymentRow {
  id: number
  subscription_id: number
  amount: number
  card_last4: string
  status: "success" | "failed"
  paid_at: string
  pub_title_ru: string
  pub_title_uz: string
  pub_slug: string
}

interface Resp {
  payments: PaymentRow[]
}

export function AccountPaymentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading } = useFetch<Resp>("/payments")
  const payments = data?.payments ?? []

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("account.payments")}</h2>
      <div className="mt-4 rule-thick" />

      {loading ? (
        <div className="py-12 text-center font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : payments.length === 0 ? (
        <div className="py-12 text-center font-editorial text-ink-mute">
          {lang === "uz" ? "Hali to'lovlar yo'q" : "Пока нет платежей"}
        </div>
      ) : (
        <table className="mt-8 w-full font-editorial">
          <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
            <tr className="border-b border-paper-line">
              <th className="py-3">Дата</th>
              <th className="py-3">Издание</th>
              <th className="py-3">Карта</th>
              <th className="py-3">Сумма</th>
              <th className="py-3">Статус</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-paper-line">
                <td className="py-4">{formatDate(p.paid_at, lang)}</td>
                <td className="py-4">{lang === "uz" ? p.pub_title_uz : p.pub_title_ru}</td>
                <td className="py-4 font-mono">•••• {p.card_last4}</td>
                <td className="py-4 font-display font-bold">{formatPrice(p.amount, lang)} {t("common.currency")}</td>
                <td className="py-4">
                  <Badge variant={p.status === "success" ? "accent" : "muted"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

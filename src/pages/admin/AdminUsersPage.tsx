import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { useFetch } from "@/hooks/useFetch"
import { formatDate } from "@/lib/format"
import type { User } from "@/types"

interface UserRow extends User {
  subscriptions_count: number
}

interface Resp {
  users: UserRow[]
}

export function AdminUsersPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const { data, loading } = useFetch<Resp>("/admin/users")
  const users = data?.users ?? []

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("admin.users")}</h2>
      <div className="mt-4 rule-thick" />

      {loading ? (
        <div className="mt-8 font-editorial text-ink-mute">{t("common.loading")}…</div>
      ) : (
        <table className="mt-8 w-full font-editorial">
          <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
            <tr className="border-b border-paper-line">
              <th className="py-3">ID</th>
              <th className="py-3">Email</th>
              <th className="py-3">Имя</th>
              <th className="py-3">Роль</th>
              <th className="py-3">Подписок</th>
              <th className="py-3">Создан</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-paper-line">
                <td className="py-4 font-mono text-ink-mute">{u.id}</td>
                <td className="py-4">{u.email}</td>
                <td className="py-4 font-display font-bold">{u.full_name}</td>
                <td className="py-4">
                  <Badge variant={u.role === "admin" ? "accent" : "muted"}>{u.role}</Badge>
                </td>
                <td className="py-4">{u.subscriptions_count}</td>
                <td className="py-4 text-ink-mute">{formatDate(u.created_at, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

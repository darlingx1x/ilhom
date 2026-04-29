import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"

const demoUsers = [
  { id: 1, email: "admin@news.uz", full_name: "Администратор", role: "admin" as const, created_at: "2026-01-01" },
  { id: 2, email: "ivanov@example.uz", full_name: "Иван Иванов", role: "reader" as const, created_at: "2026-02-14" },
  { id: 3, email: "azizov@example.uz", full_name: "Азиз Азизов", role: "reader" as const, created_at: "2026-03-08" },
  { id: 4, email: "karimova@example.uz", full_name: "Дилнора Каримова", role: "reader" as const, created_at: "2026-04-02" },
]

export function AdminUsersPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("admin.users")}</h2>
      <div className="mt-4 rule-thick" />

      <table className="mt-8 w-full font-editorial">
        <thead className="text-left small-caps font-sans text-[0.72rem] text-ink-mute">
          <tr className="border-b border-paper-line">
            <th className="py-3">ID</th>
            <th className="py-3">Email</th>
            <th className="py-3">Имя</th>
            <th className="py-3">Роль</th>
            <th className="py-3">Создан</th>
          </tr>
        </thead>
        <tbody>
          {demoUsers.map((u) => (
            <tr key={u.id} className="border-b border-paper-line">
              <td className="py-4 font-mono text-ink-mute">{u.id}</td>
              <td className="py-4">{u.email}</td>
              <td className="py-4 font-display font-bold">{u.full_name}</td>
              <td className="py-4">
                <Badge variant={u.role === "admin" ? "accent" : "muted"}>{u.role}</Badge>
              </td>
              <td className="py-4 text-ink-mute">{u.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

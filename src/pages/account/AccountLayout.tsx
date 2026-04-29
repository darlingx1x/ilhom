import { NavLink, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/AuthContext"
import { cn } from "@/lib/utils"

export function AccountLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "block py-2 small-caps font-sans text-[0.8rem] font-semibold tracking-[0.18em] transition-colors",
      isActive ? "text-accent border-l-2 border-accent pl-3 -ml-px" : "text-ink hover:text-accent pl-3",
    )

  return (
    <section className="container py-12 md:py-16">
      <div className="border-b-2 border-ink pb-6 mb-10">
        <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
          Reader's desk
        </div>
        <h1 className="mt-2 font-display text-5xl font-black tracking-tight">{t("account.title")}</h1>
        {user && (
          <p className="mt-2 font-editorial text-ink-mute">
            {user.full_name} · {user.email}
          </p>
        )}
      </div>

      <div className="grid grid-cols-12 gap-10">
        <aside className="col-span-12 md:col-span-3">
          <nav className="border-l border-paper-line">
            <NavLink to="/account" end className={link}>{t("account.profile")}</NavLink>
            <NavLink to="/account/subscriptions" className={link}>{t("account.subscriptions")}</NavLink>
            <NavLink to="/account/payments" className={link}>{t("account.payments")}</NavLink>
          </nav>
        </aside>
        <div className="col-span-12 md:col-span-9">
          <Outlet />
        </div>
      </div>
    </section>
  )
}

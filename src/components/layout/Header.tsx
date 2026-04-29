import { Link, NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { todayHeader } from "@/lib/format"
import { useAuth } from "@/hooks/useAuth"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { cn } from "@/lib/utils"

export function Header() {
  const { t, i18n } = useTranslation()
  const { user, logout, isAdmin } = useAuth()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      "small-caps text-[0.78rem] font-sans font-semibold tracking-[0.18em] underline-grow",
      isActive ? "text-accent" : "text-ink hover:text-accent",
    )

  return (
    <header className="border-b border-ink bg-paper">
      {/* Date / edition strip */}
      <div className="border-b border-paper-line">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-2 text-[0.7rem] small-caps text-ink-mute">
          <span className="font-sans">{todayHeader(lang)}</span>
          <span className="hidden sm:inline font-sans">
            {t("home.edition")} № {issueNumber()} · {t("home.since")} 2026
          </span>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Masthead */}
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group block">
            <div className="font-display font-black leading-none tracking-tight text-[2.4rem] sm:text-[3rem] md:text-[3.6rem]">
              <span className="italic font-medium pr-1">Vatan</span>
              <span>Press</span>
            </div>
            <div className="mt-1 text-[0.7rem] small-caps font-sans text-ink-mute">
              {t("brand.tagline")}
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <NavLink to="/login" className="small-caps text-[0.78rem] font-sans font-semibold underline-grow">
                  {t("nav.login")}
                </NavLink>
                <span className="text-paper-line">·</span>
                <NavLink to="/register" className="small-caps text-[0.78rem] font-sans font-semibold underline-grow">
                  {t("nav.register")}
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-3 small-caps text-[0.78rem] font-sans">
                <span className="text-ink-mute">{user.email}</span>
                <button onClick={logout} className="text-accent underline-grow font-semibold">
                  {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rule-double" />

      {/* Primary nav */}
      <nav className="container flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <NavLink to="/" end className={navLink}>{t("nav.home")}</NavLink>
        <NavLink to="/catalog" className={navLink}>{t("nav.catalog")}</NavLink>
        {user && <NavLink to="/account" className={navLink}>{t("nav.account")}</NavLink>}
        {isAdmin && <NavLink to="/admin" className={navLink}>{t("nav.admin")}</NavLink>}
      </nav>
      <div className="rule" />
    </header>
  )
}

function issueNumber(): string {
  const start = new Date("2026-01-01").getTime()
  const now = Date.now()
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return String(days + 1).padStart(4, "0")
}

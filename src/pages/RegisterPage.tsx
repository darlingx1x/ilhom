import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterPage() {
  const { t } = useTranslation()

  return (
    <section className="container max-w-lg py-16 md:py-24">
      <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
        New account · 2026
      </div>
      <h1 className="mt-3 font-display text-5xl font-black tracking-tight">{t("auth.register_title")}</h1>
      <div className="mt-6 rule-thick" />

      <form className="mt-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("auth.full_name")}</Label>
          <Input id="full_name" required placeholder="Иван Иванов" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" required placeholder="reader@example.uz" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input id="phone" type="tel" placeholder="+998 90 000 00 00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" required placeholder="••••••••" />
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          {t("auth.submit_register")}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-paper-line text-sm font-editorial text-ink-mute">
        {t("auth.have_account")}? <Link to="/login" className="text-ink underline-grow">{t("auth.to_login")}</Link>
      </div>
    </section>
  )
}

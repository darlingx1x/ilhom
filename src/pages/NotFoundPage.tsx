import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <section className="container py-32 text-center">
      <div className="font-display text-[8rem] font-black leading-none text-accent">404</div>
      <div className="rule-thick max-w-xs mx-auto" />
      <p className="mt-6 font-editorial text-ink-soft">Страница не найдена</p>
      <div className="mt-8">
        <Button asChild>
          <Link to="/">{t("nav.home")}</Link>
        </Button>
      </div>
    </section>
  )
}

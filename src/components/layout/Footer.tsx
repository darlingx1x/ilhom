import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t-2 border-ink bg-paper-deep">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-black leading-none">
              <span className="italic font-medium pr-1">Vatan</span>
              <span>Press</span>
            </div>
            <p className="mt-4 max-w-md font-editorial text-ink-soft text-pretty">
              {t("footer.about")}
            </p>
          </div>

          <div>
            <div className="small-caps font-sans text-[0.72rem] text-ink-mute mb-3">
              {t("footer.contacts")}
            </div>
            <div className="font-editorial text-ink space-y-1">
              <div>{t("footer.address")}</div>
              <div>+998 71 238 64 00</div>
              <div>hello@vatan-press.uz</div>
            </div>
          </div>

          <div>
            <div className="small-caps font-sans text-[0.72rem] text-ink-mute mb-3">
              {t("footer.legal")}
            </div>
            <ul className="font-editorial space-y-1">
              <li><Link to="/catalog" className="underline-grow">{t("nav.catalog")}</Link></li>
              <li><Link to="/login" className="underline-grow">{t("nav.login")}</Link></li>
              <li><Link to="/register" className="underline-grow">{t("nav.register")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-paper-line flex flex-wrap items-center justify-between gap-4 text-[0.78rem] small-caps font-sans text-ink-mute">
          <div>© {year} Vatan Press. {t("footer.rights")}</div>
          <div>ТУИТ · Конвергенция цифровых технологий</div>
        </div>
      </div>
    </footer>
  )
}

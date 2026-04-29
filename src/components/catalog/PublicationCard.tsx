import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PublicationCover } from "./PublicationCover"
import { formatPrice } from "@/lib/format"
import type { Publication } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  publication: Publication
  className?: string
}

export function PublicationCard({ publication, className }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language.startsWith("uz") ? "uz" : "ru"
  const title = lang === "uz" ? publication.title_uz : publication.title_ru
  const description = lang === "uz" ? publication.description_uz : publication.description_ru

  return (
    <Link
      to={`/publications/${publication.slug}`}
      className={cn("group block", className)}
    >
      <div className="overflow-hidden border border-paper-line shadow-paper transition-all group-hover:shadow-clip group-hover:-translate-y-1">
        <PublicationCover title={title} variant={publication.type} />
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="small-caps text-[0.7rem] font-sans font-semibold text-accent tracking-[0.18em]">
            {publication.type === "newspaper" ? t("catalog.type_newspaper") : t("catalog.type_magazine")}
          </div>
          <h3 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight text-balance">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm font-editorial text-ink-mute line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-bold leading-none">
            {formatPrice(publication.price_per_month, lang)}
          </div>
          <div className="mt-1 text-[0.7rem] small-caps font-sans text-ink-mute">
            {t("common.currency")} {t("common.per_month")}
          </div>
        </div>
      </div>
    </Link>
  )
}

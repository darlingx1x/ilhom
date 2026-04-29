import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith("uz") ? "uz" : "ru"

  return (
    <div className="flex items-center gap-1 font-sans text-[0.7rem] tracking-[0.18em] uppercase">
      {(["ru", "uz"] as const).map((code, idx) => (
        <span key={code} className="flex items-center gap-1">
          <button
            onClick={() => i18n.changeLanguage(code)}
            className={cn(
              "px-1 py-0.5 transition-colors",
              current === code ? "text-ink font-semibold border-b border-ink" : "text-ink-mute hover:text-ink",
            )}
          >
            {code}
          </button>
          {idx === 0 && <span className="text-paper-line">/</span>}
        </span>
      ))}
    </div>
  )
}

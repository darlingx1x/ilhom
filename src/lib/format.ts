export function formatPrice(value: number, locale: string = "ru"): string {
  const formatter = new Intl.NumberFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    maximumFractionDigits: 0,
  })
  return formatter.format(value)
}

export function formatDate(value: string | Date, locale: string = "ru"): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatIssueDate(value: string | Date, locale: string = "ru"): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function todayHeader(locale: string = "ru"): string {
  return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())
}

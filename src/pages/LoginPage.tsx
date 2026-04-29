import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import type { User } from "@/types"

interface LoginResponse {
  token: string
  user: User
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/account"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, password })
      login(res.token, res.user)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Не удалось войти")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container max-w-lg py-16 md:py-24">
      <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
        Sign in · 2026
      </div>
      <h1 className="mt-3 font-display text-5xl font-black tracking-tight">{t("auth.login_title")}</h1>
      <div className="mt-6 rule-thick" />

      <form className="mt-10 space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="reader@example.uz" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && (
          <div className="text-sm font-editorial text-accent">{error}</div>
        )}

        <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading}>
          {loading ? t("common.loading") : t("auth.submit_login")}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-paper-line text-sm font-editorial text-ink-mute">
        {t("auth.no_account")}? <Link to="/register" className="text-ink underline-grow">{t("auth.to_register")}</Link>
      </div>
    </section>
  )
}

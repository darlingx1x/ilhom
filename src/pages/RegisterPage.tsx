import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import type { User } from "@/types"

interface RegisterResponse {
  token: string
  user: User
}

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post<RegisterResponse>("/auth/register", form)
      login(res.token, res.user)
      navigate("/account", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Не удалось зарегистрироваться")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container max-w-lg py-16 md:py-24">
      <div className="small-caps font-sans text-[0.78rem] font-semibold text-accent tracking-[0.22em]">
        New account · 2026
      </div>
      <h1 className="mt-3 font-display text-5xl font-black tracking-tight">{t("auth.register_title")}</h1>
      <div className="mt-6 rule-thick" />

      <form className="mt-10 space-y-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("auth.full_name")}</Label>
          <Input id="full_name" required value={form.full_name} onChange={onChange} placeholder="Иван Иванов" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" required value={form.email} onChange={onChange} placeholder="reader@example.uz" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+998 90 000 00 00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input id="password" type="password" required value={form.password} onChange={onChange} placeholder="••••••••" />
        </div>

        {error && <div className="text-sm font-editorial text-accent">{error}</div>}

        <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
          {loading ? t("common.loading") : t("auth.submit_register")}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-paper-line text-sm font-editorial text-ink-mute">
        {t("auth.have_account")}? <Link to="/login" className="text-ink underline-grow">{t("auth.to_login")}</Link>
      </div>
    </section>
  )
}

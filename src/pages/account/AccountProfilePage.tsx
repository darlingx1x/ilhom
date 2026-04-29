import { useTranslation } from "react-i18next"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function AccountProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl font-bold tracking-tight">{t("account.profile")}</h2>
      <div className="mt-4 rule" />

      <form className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("auth.full_name")}</Label>
          <Input id="full_name" defaultValue={user?.full_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input id="email" type="email" defaultValue={user?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input id="phone" defaultValue={user?.phone} />
        </div>
        <Button>{t("common.save")}</Button>
      </form>
    </div>
  )
}

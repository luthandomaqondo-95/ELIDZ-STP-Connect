"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { AUTH_BUTTON_CLASS, AUTH_STATUS_ICON_CLASS, AuthCard } from "@/components/auth-card"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <AuthCard title="Access Denied" description="You do not have permission to access this area.">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className={AUTH_STATUS_ICON_CLASS}>
          <ShieldAlert className="text-red-400" />
        </div>
        <p className="text-sm text-zinc-300">
          This dashboard is restricted to administrators only. If you believe this is an error, please contact your system administrator.
        </p>
        <AnimatedDashboardButton
          label="Return to Login"
          variant="blue"
          className={AUTH_BUTTON_CLASS}
          onClick={() => router.push("/auth/login")}
        />
      </div>
    </AuthCard>
  )
}

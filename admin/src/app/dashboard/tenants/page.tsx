import Link from "next/link"
import { Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { TenantsList } from "./tenants-list"
import type { TenantRecord } from "@/lib/tenants"

export default async function TenantsPage() {
  const supabase = await createClient()
  const { data: tenants } = await supabase
    .from("tenants")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title="Tenants"
        icon={<Building2 className="h-5 w-5" />}
        action={
          <Link href="/dashboard/tenants/create">
            <AnimatedDashboardButton label="Add Tenant" />
          </Link>
        }
      />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Manage ELIDZ STP tenants and partners shown in the mobile app Tenants directory and
        opportunity publisher.
      </p>
      <TenantsList tenants={(tenants || []) as TenantRecord[]} />
    </div>
  )
}

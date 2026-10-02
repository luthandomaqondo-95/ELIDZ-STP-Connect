import { createClient } from "@/lib/supabase/server"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { createEmptyTenantForm, type TenantFacilityOption } from "@/lib/tenants"
import { TenantForm } from "../tenant-form"

async function getFacilities(): Promise<TenantFacilityOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("facilities")
    .select("service_id, service_name")
    .order("service_name", { ascending: true })

  const seen = new Set<string>()
  return (data || []).filter((row) => {
    if (!row.service_id || seen.has(row.service_id)) return false
    seen.add(row.service_id)
    return true
  }) as TenantFacilityOption[]
}

export default async function CreateTenantPage() {
  const facilities = await getFacilities()

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader title="Add Tenant" backHref="/dashboard/tenants" />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Add a tenant or partner organisation so it appears in the ELIDZ-STP Connect mobile app.
      </p>
      <TenantForm mode="create" initialValues={createEmptyTenantForm()} facilities={facilities} />
    </div>
  )
}

import { notFound } from "next/navigation"
import type { ComponentType } from "react"
import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  tenantToFormValues,
  type TenantFacilityOption,
  type TenantRecord,
} from "@/lib/tenants"
import { TenantForm } from "../tenant-form"
import { DeleteTenantButton } from "./delete-tenant-button"

interface PageProps {
  params: Promise<{ id: string }>
}

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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-slate-800 dark:text-slate-100 break-words">{value}</p>
      </div>
    </div>
  )
}

export default async function TenantDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tenant, error }, facilities] = await Promise.all([
    supabase.from("tenants").select("*").eq("id", id).single(),
    getFacilities(),
  ])

  if (error || !tenant) {
    notFound()
  }

  const record = tenant as TenantRecord
  const initials = (record.name || "T")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const facilityName =
    facilities.find((f) => f.service_id === record.facility_id)?.service_name ||
    record.facility_id

  return (
    <div className="flex flex-1 flex-col gap-6 pt-0">
      <DashboardPageHeader title={record.name} backHref="/dashboard/tenants" />
      <p className="-mt-2 text-sm text-muted-foreground">
        Edit the profile below to update what users see in the mobile app.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border border-border bg-white">
                <AvatarImage
                  src={record.logo_url || undefined}
                  alt={record.name}
                  className="object-contain"
                />
                <AvatarFallback className="rounded-2xl bg-orange-100 text-orange-800 text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{record.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {record.industry || "Uncategorised"}
                  {facilityName ? ` • ${facilityName}` : ""}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-40">
              <DeleteTenantButton tenantId={id} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {record.description || "No description provided."}
            </p>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={MapPin} label="Location" value={record.location} />
              <DetailRow icon={Building2} label="Address" value={record.address} />
              <DetailRow icon={Mail} label="Email" value={record.contact_email} />
              <DetailRow icon={Phone} label="Phone" value={record.contact_phone} />
              <DetailRow icon={Globe} label="Website" value={record.website} />
            </div>
          </CardContent>
        </Card>

        <TenantForm
          mode="edit"
          tenantId={id}
          initialValues={tenantToFormValues(record)}
          facilities={facilities}
        />
      </div>
    </div>
  )
}

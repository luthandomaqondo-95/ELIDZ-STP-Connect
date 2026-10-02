"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
  SelectItem,
} from "@/components/floating-input"
import { UploadButton } from "@/components/upload-button"
import {
  TENANT_LOGO_ACCEPT,
  type TenantFacilityOption,
  type TenantFormValues,
} from "@/lib/tenants"
import { createTenant, updateTenant } from "./actions"

type TenantFormProps = {
  mode: "create" | "edit"
  tenantId?: string
  initialValues: TenantFormValues
  facilities: TenantFacilityOption[]
}

const inputClass =
  "h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
const textareaClass =
  "min-h-[120px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"

export function TenantForm({ mode, tenantId, initialValues, facilities }: TenantFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<TenantFormValues>(initialValues)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const logoPreviewUrl = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile)
    return form.logo_url.trim() || null
  }, [logoFile, form.logo_url])

  useEffect(() => {
    if (!logoFile || !logoPreviewUrl) return
    return () => {
      URL.revokeObjectURL(logoPreviewUrl)
    }
  }, [logoFile, logoPreviewUrl])

  function updateField<K extends keyof TenantFormValues>(key: K, value: TenantFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    if (!form.name.trim()) {
      const message = "Tenant name is required."
      setError(message)
      toast.error(message)
      setSaving(false)
      return
    }

    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      fd.set(key, value)
    })
    if (logoFile) {
      fd.set("logo_file", logoFile)
    }

    const result =
      mode === "create"
        ? await createTenant(fd)
        : await updateTenant(tenantId!, fd)

    setSaving(false)

    if (!result.success) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    toast.success(mode === "create" ? "Tenant added." : "Tenant updated.")
    router.push(`/dashboard/tenants/${result.id}`)
    router.refresh()
  }

  return (
    <Card className="w-full rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === "create" ? "Tenant Details" : "Edit Tenant"}
        </CardTitle>
        <CardDescription className="text-sm">
          These fields power the mobile Tenants list and tenant detail screens.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="name"
              label="Name"
              placeholder="e.g. ECITI"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              required
            />
            <FloatingLabelInput
              id="industry"
              label="Industry"
              placeholder="e.g. ICT Incubator"
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              className={inputClass}
            />
          </div>

          <FloatingLabelTextarea
            id="description"
            label="Description"
            placeholder="Short description shown in the app..."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={textareaClass}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="location"
              label="Location"
              placeholder="e.g. ELIDZ STP, East London"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
            />
            <FloatingLabelSelect
              label="Facility / Centre"
              placeholder="Select facility (optional)"
              value={form.facility_id || "__none__"}
              onValueChange={(value) =>
                updateField("facility_id", value === "__none__" ? "" : value)
              }
              className={inputClass}
            >
              <SelectItem value="__none__">No facility</SelectItem>
              {facilities.map((facility) => (
                <SelectItem key={facility.service_id} value={facility.service_id}>
                  {facility.service_name}
                </SelectItem>
              ))}
            </FloatingLabelSelect>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="building"
              label="Building"
              placeholder="Optional building / unit"
              value={form.building}
              onChange={(e) => updateField("building", e.target.value)}
              className={inputClass}
            />
            <FloatingLabelInput
              id="address"
              label="Address"
              placeholder="Full street address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-3 rounded-3xl border border-orange-100/80 bg-orange-50/40 p-4 dark:border-orange-900/30 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Logo</p>
                <p className="text-xs text-muted-foreground">
                  Paste an image URL or upload a logo (max 5MB).
                </p>
              </div>
              <UploadButton
                accept={TENANT_LOGO_ACCEPT}
                variant="blue"
                onFileSelect={(files) => {
                  const file = files?.[0] ?? null
                  setLogoFile(file)
                }}
              >
                Upload Logo
              </UploadButton>
            </div>
            <FloatingLabelInput
              id="logo_url"
              label="Logo URL"
              placeholder="https://..."
              value={form.logo_url}
              onChange={(e) => {
                setLogoFile(null)
                updateField("logo_url", e.target.value)
              }}
              className={inputClass}
            />
            {logoPreviewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreviewUrl}
                alt="Tenant logo preview"
                className="h-20 w-20 rounded-2xl border border-border object-contain bg-white"
              />
            )}
            {logoFile && (
              <p className="text-xs text-muted-foreground">Selected file: {logoFile.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="website"
              label="Website"
              placeholder="https://..."
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              className={inputClass}
            />
            <FloatingLabelInput
              id="application_url"
              label="Application URL"
              placeholder="Optional apply / programme link"
              value={form.application_url}
              onChange={(e) => updateField("application_url", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="contact_email"
              label="Contact Email"
              type="email"
              placeholder="info@example.com"
              value={form.contact_email}
              onChange={(e) => updateField("contact_email", e.target.value)}
              className={inputClass}
            />
            <FloatingLabelInput
              id="additional_contact_email"
              label="Additional Contact Email"
              type="email"
              placeholder="Optional secondary email"
              value={form.additional_contact_email}
              onChange={(e) => updateField("additional_contact_email", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              id="contact_phone"
              label="Contact Phone"
              placeholder="+27 ..."
              value={form.contact_phone}
              onChange={(e) => updateField("contact_phone", e.target.value)}
              className={inputClass}
            />
            <FloatingLabelInput
              id="opening_hours"
              label="Opening Hours"
              placeholder="e.g. Mon–Fri 08:00–16:30"
              value={form.opening_hours}
              onChange={(e) => updateField("opening_hours", e.target.value)}
              className={inputClass}
            />
          </div>

          <FloatingLabelTextarea
            id="services"
            label="Services"
            placeholder="Services offered by this tenant..."
            value={form.services}
            onChange={(e) => updateField("services", e.target.value)}
            className={textareaClass}
          />
          <FloatingLabelTextarea
            id="capabilities"
            label="Capabilities"
            placeholder="Key capabilities..."
            value={form.capabilities}
            onChange={(e) => updateField("capabilities", e.target.value)}
            className={textareaClass}
          />
          <FloatingLabelTextarea
            id="key_personnel"
            label="Key Personnel"
            placeholder="Names and roles..."
            value={form.key_personnel}
            onChange={(e) => updateField("key_personnel", e.target.value)}
            className={textareaClass}
          />
          <FloatingLabelTextarea
            id="partners"
            label="Partners"
            placeholder="Partner organisations..."
            value={form.partners}
            onChange={(e) => updateField("partners", e.target.value)}
            className={textareaClass}
          />
          <FloatingLabelInput
            id="social_media_links"
            label="Social Media Links"
            placeholder="LinkedIn: https://... | Twitter: https://..."
            value={form.social_media_links}
            onChange={(e) => updateField("social_media_links", e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            Social links format:{" "}
            <code className="rounded bg-muted px-1 py-0.5">Platform: url | Platform: url</code>
          </p>
        </CardContent>
        <CardFooter className="justify-center gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            type="button"
            onClick={() =>
              router.push(mode === "edit" && tenantId ? `/dashboard/tenants/${tenantId}` : "/dashboard/tenants")
            }
            disabled={saving}
          >
            Cancel
          </Button>
          <AnimatedDashboardButton
            type="submit"
            variant="green"
            disabled={saving}
            label={
              saving
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Add Tenant"
                  : "Save Changes"
            }
            className="h-10 rounded-3xl px-5"
          />
        </CardFooter>
      </form>
    </Card>
  )
}

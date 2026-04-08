import { redirect } from "next/navigation"
import { Activity } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireSuperAdmin } from "@/lib/authz"
import { createAdminClient } from "@/lib/supabase/admin"

type NotificationRow = {
  id: string
  title: string
  message: string
  created_by: string | null
  created_at: string
  related_entity_type: string | null
  related_entity_id: string | null
}

type ActorProfile = {
  id: string
  name: string | null
  email: string | null
}

function parseDateStart(dateInput?: string) {
  if (!dateInput) return null
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString()
}

function parseDateEnd(dateInput?: string) {
  if (!dateInput) return null
  return new Date(`${dateInput}T23:59:59.999Z`).toISOString()
}

function formatTimestamp(iso: string) {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return iso
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)
}

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams?: Promise<{ action?: string; admin?: string; from?: string; to?: string }>
}) {
  try {
    await requireSuperAdmin()
  } catch {
    redirect("/dashboard?error=unauthorized")
  }

  const params = await searchParams
  const actionFilter = (params?.action ?? "").trim()
  const adminFilter = (params?.admin ?? "").trim().toLowerCase()
  const fromDate = (params?.from ?? "").trim()
  const toDate = (params?.to ?? "").trim()

  const supabase = createAdminClient()
  let query = supabase
    .from("notifications")
    .select("id, title, message, created_by, created_at, related_entity_type, related_entity_id")
    .eq("type", "system_alert")
    .ilike("title", "Admin action:%")
    .order("created_at", { ascending: false })
    .limit(250)

  if (actionFilter) {
    query = query.or(`title.ilike.%${actionFilter}%,message.ilike.%${actionFilter}%`)
  }

  const fromIso = parseDateStart(fromDate)
  if (fromIso) {
    query = query.gte("created_at", fromIso)
  }

  const toIso = parseDateEnd(toDate)
  if (toIso) {
    query = query.lte("created_at", toIso)
  }

  const { data: notificationsData, error } = await query
  if (error) {
    throw new Error(`Failed to load admin activity: ${error.message}`)
  }

  const notifications = (notificationsData ?? []) as NotificationRow[]
  const actorIds = Array.from(
    new Set(notifications.map((n) => n.created_by).filter((value): value is string => Boolean(value)))
  )

  let actorMap = new Map<string, ActorProfile>()
  if (actorIds.length > 0) {
    const { data: actors, error: actorError } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", actorIds)

    if (!actorError) {
      actorMap = new Map((actors as ActorProfile[]).map((actor) => [actor.id, actor]))
    }
  }

  const filteredByAdmin = adminFilter
    ? notifications.filter((n) => {
        const actor = n.created_by ? actorMap.get(n.created_by) : null
        const text = `${actor?.name ?? ""} ${actor?.email ?? ""} ${n.created_by ?? ""}`.toLowerCase()
        return text.includes(adminFilter)
      })
    : notifications

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader title="Admin Activity" icon={<Activity className="h-5 w-5" />} />
      <p className="max-w-4xl text-sm italic text-muted-foreground">
        Timeline of important admin actions that automatically alert Super Admins.
      </p>

      <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4">
            <Input name="action" placeholder="Action text" defaultValue={actionFilter} />
            <Input name="admin" placeholder="Admin name/email" defaultValue={adminFilter} />
            <Input name="from" type="date" defaultValue={fromDate} />
            <Input name="to" type="date" defaultValue={toDate} />
            <div className="md:col-span-4 flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md bg-[#002147] px-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Apply filters
              </button>
              <a
                href="/dashboard/communication/admin-activity"
                className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium transition hover:bg-muted"
              >
                Clear
              </a>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
        <CardHeader className="pb-2">
          <CardTitle>Recent Activity ({filteredByAdmin.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredByAdmin.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No admin activity found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredByAdmin.map((item) => {
                  const actor = item.created_by ? actorMap.get(item.created_by) : null
                  const actionLabel = item.title.replace(/^Admin action:\s*/i, "") || item.title
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">{formatTimestamp(item.created_at)}</TableCell>
                      <TableCell className="font-medium">{actionLabel}</TableCell>
                      <TableCell>
                        {actor?.name || actor?.email || item.created_by || "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-xl">
                        <p className="truncate" title={item.message}>
                          {item.message}
                        </p>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

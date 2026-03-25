import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ManagePermissionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title="Manage Permissions"
        backHref="/dashboard/users/roles"
        className="pb-2"
      />
      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Configure which capabilities are granted to each role across the platform.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs font-normal">All Access</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs font-normal">Manage Users</Badge>
              <Badge variant="secondary" className="text-xs font-normal">Manage Content</Badge>
              <Badge variant="secondary" className="text-xs font-normal">View Reports</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs font-normal">View Opportunities</Badge>
              <Badge variant="secondary" className="text-xs font-normal">Post Requests</Badge>
              <Badge variant="secondary" className="text-xs font-normal">Edit Profile</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

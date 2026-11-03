import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { PermissionsClient } from "./permissions-client"
import { getAllPermissions, getAllRolePermissions, getCurrentAdminRole } from "../actions"

export default async function ManagePermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const { role } = await searchParams
  const actorRole = await getCurrentAdminRole()

  // Only Super Admin can change permissions (saveRolePermissions enforces this too).
  if (actorRole !== "Super Admin") {
    return (
      <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
        <DashboardPageHeader title="Manage Permissions" backHref="/dashboard/users/roles" className="pb-2" />
        <p className="max-w-3xl text-sm text-muted-foreground">
          Only a Super Admin can manage role permissions.
        </p>
      </div>
    )
  }

  const [allPermissions, initialRolePermissions] = await Promise.all([
    getAllPermissions(),
    getAllRolePermissions(),
  ])

  return (
    <PermissionsClient
      selectedRole={role}
      currentUserRole={actorRole}
      allPermissions={allPermissions}
      initialRolePermissions={initialRolePermissions}
    />
  )
}

import { UsersTable, User } from "./users-table"
import { InviteAdminDialog } from "./invite-admin-dialog"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Users } from "lucide-react"
import { listAdminUsers } from "@/lib/admin/users-list"
import { getAuthedProfile } from "@/lib/authz"

export const dynamic = "force-dynamic"

export default async function AllUsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ role?: string }>;
}) {
    const resolvedSearchParams = await searchParams
    const selectedRole = resolvedSearchParams?.role

    let users: User[] = []
    try {
        users = await listAdminUsers(selectedRole)
    } catch (error) {
        console.error("Error loading users:", error)
        users = []
    }

    const { profile } = await getAuthedProfile()
    const actorRole = (profile?.role as string) ?? ""
    const canInviteSuperAdmin = actorRole === "Super Admin"
    const canInviteAdmin = actorRole === "Super Admin"

    return (
        <div className="flex flex-1 flex-col gap-4 px-0 md:px-0 py-0 pt-0">
            <DashboardPageHeader
                title={selectedRole ? `Users — ${selectedRole}` : "All Users"}
                icon={<Users className="h-5 w-5" />}
                action={
                    canInviteAdmin ? (
                        <InviteAdminDialog canInviteSuperAdmin={canInviteSuperAdmin} />
                    ) : undefined
                }
                backHref={selectedRole ? "/dashboard/users/roles" : undefined}
            />
            <UsersTable users={users} initialRole={selectedRole} />
        </div>
    );
}

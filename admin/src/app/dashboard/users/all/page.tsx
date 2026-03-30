import { UsersTable, User } from "./users-table"
import { InviteUserDialog } from "./invite-user-dialog"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Users } from "lucide-react"

export default async function AllUsersPage({
    searchParams,
}: {
    searchParams?: { role?: string };
}) {
    const selectedRole = searchParams?.role

    // Fetch users via API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = new URL('/api/admin/users', baseUrl)
    
    if (selectedRole && selectedRole !== "All") {
        apiUrl.searchParams.set('role', selectedRole)
    }

    let users = []
    try {
        const response = await fetch(apiUrl.toString(), {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (response.ok) {
            const data = await response.json()
            users = data.users || []
        } else {
            console.error('Failed to fetch users:', response.statusText)
            users = []
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        users = []
    }

    return (
        <div className="flex flex-1 flex-col gap-4 px-0 md:px-0 py-0 pt-0">
            <DashboardPageHeader
                title={selectedRole ? `Users — ${selectedRole}` : "All Users"}
                icon={<Users className="h-5 w-5" />}
                action={<InviteUserDialog />}
                backHref={selectedRole ? "/dashboard/users/roles" : undefined}
            />
            <UsersTable users={users} initialRole={selectedRole} />
        </div>
    );
}

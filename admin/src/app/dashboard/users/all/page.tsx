import { UsersTable, User } from "./users-table"
import { InviteUserDialog } from "./invite-user-dialog"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Users } from "lucide-react"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function AllUsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ role?: string }>;
}) {
    const resolvedSearchParams = await searchParams
    const selectedRole = resolvedSearchParams?.role

    // Fetch users via API route with cache busting
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elidzconnect.vercel.app'
    const apiUrl = new URL('/api/admin/users', baseUrl)
    
    if (selectedRole && selectedRole !== "All") {
        apiUrl.searchParams.set('role', selectedRole)
    }
    // Add timestamp to bust any caching
    apiUrl.searchParams.set('_t', Date.now().toString())

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

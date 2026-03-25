import { createClient } from "@/lib/supabase/server"
import { UsersTable, User } from "./users-table"
import { InviteUserDialog } from "./invite-user-dialog"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Users } from "lucide-react"

export default async function AllUsersPage() {
    const supabase = await createClient()
    const { data: profiles } = await supabase.from('profiles').select('*')

    const users: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name || "Unknown",
        email: profile.email || "",
        role: profile.role || "User",
        status: "Active", // Default as we don't have status in profiles table yet
        company: profile.organization || "-",
        lastActive: new Date(profile.updated_at).toLocaleDateString(),
        avatar: profile.avatar || ""
    }))

    return (
        <div className="flex flex-1 flex-col gap-4 px-0 md:px-0 py-0 pt-0">
            <DashboardPageHeader
                title="All Users"
                icon={<Users className="h-5 w-5" />}
                action={<InviteUserDialog />}
            />
            <UsersTable users={users} />
        </div>
    );
}

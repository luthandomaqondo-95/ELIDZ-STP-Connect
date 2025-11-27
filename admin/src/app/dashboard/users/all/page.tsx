import { createClient } from "@/lib/supabase/server"
import { UsersTable, User } from "./users-table"
import { InviteUserDialog } from "./invite-user-dialog"

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">All Users</h1>
                <InviteUserDialog />
            </div>
            <UsersTable users={users} />
        </div>
    );
}

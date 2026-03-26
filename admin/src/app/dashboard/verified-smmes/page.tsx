import { createClient } from "@/lib/supabase/server"
import { SmmeTable } from "./smme-table"
import { AddSmmeDialog } from "./add-smme-dialog"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { BadgeCheck } from "lucide-react"

export default async function VerifiedSmmePage() {
    const supabase = await createClient()

    const { data: smmes, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['SME', 'SMME', 'Entrepreneur', 'Tenant'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching SMMEs:", error)
        return <div>Error loading SMMEs</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader
                title="Verified SMMEs"
                icon={<BadgeCheck className="h-5 w-5" />}
                action={<AddSmmeDialog />}
            />
            <SmmeTable initialData={smmes || []} />
        </div>
    )
}

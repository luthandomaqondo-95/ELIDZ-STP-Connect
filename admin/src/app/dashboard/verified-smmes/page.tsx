import { createClient } from "@/lib/supabase/server"
import { SmmeTable } from "./smme-table"

export default async function VerifiedSmmePage() {
    const supabase = await createClient()

    const { data: smmes, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['SME', 'SMME', 'Entrepreneur'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching SMMEs:", error)
        return <div>Error loading SMMEs</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Verified SMMEs</h1>
            </div>
            <SmmeTable initialData={smmes || []} />
        </div>
    )
}


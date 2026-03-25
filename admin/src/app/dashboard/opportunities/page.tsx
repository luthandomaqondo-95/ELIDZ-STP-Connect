import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { OpportunitiesList } from "./opportunities-list"

export default async function OpportunitiesPage() {
    const supabase = await createClient()
    const { data: opportunities } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false })

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader
                title="Opportunities"
                icon={<Calendar className="h-5 w-5" />}
                action={
                    <Link href="/dashboard/opportunities/create">
                        <AnimatedDashboardButton label="Post Opportunity" />
                    </Link>
                }
            />
            <OpportunitiesList opportunities={(opportunities || []) as any[]} />
        </div>
    );
}

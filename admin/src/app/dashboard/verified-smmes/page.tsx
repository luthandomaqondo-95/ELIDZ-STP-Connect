"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AnimatedTable } from "@/components/animated-table"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Search, BadgeCheck } from "lucide-react"
import { useSmmes, SMME_FILTER_COLORS, type SmmeLite } from "@/hooks/use-smmes"
import { SmmeDetailsDialog } from "@/components/sme/sme-dialogs"

export default function VerifiedSmmePage() {
    const { smmes, loading, updatingId, toggleStatus } = useSmmes()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    
    // Dialog states
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [selectedSmme, setSelectedSmme] = useState<SmmeLite | null>(null)

    // Filter SMMEs
    const filteredSmmes = smmes.filter((item) => {
        const search = searchQuery.toLowerCase()
        const matchesSearch =
            (item.name || "").toLowerCase().includes(search) ||
            (item.email || "").toLowerCase().includes(search) ||
            (item.organization || "").toLowerCase().includes(search)

        const status = (item.verification_status || "pending").toLowerCase()
        const matchesStatus =
            statusFilter === "All" ||
            (statusFilter === "Verified" && status === "verified") ||
            (statusFilter === "Pending" && status !== "verified")

        return matchesSearch && matchesStatus
    })

    // Open details dialog
    const openDetailsDialog = (smme: SmmeLite) => {
        setSelectedSmme(smme)
        setDetailsDialogOpen(true)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading SMMEs...</div>
    }

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader
                title="Verified SMMEs"
                icon={<BadgeCheck className="h-5 w-5" />}
            />

            {/* Search and Filters */}
            <div className="space-y-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search SMMEs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-3xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
                    />
                </div>
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-orange-200/70 dark:border-orange-800/40" />
                    </div>
                    <div className="relative flex justify-start">
                        <span className="rounded-full bg-background px-3 text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300">
                            Filters
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {["All", "Verified", "Pending"].map((status) => (
                        <Button
                            key={status}
                            variant="ghost"
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                                statusFilter === status
                                    ? "bg-orange-500 text-white hover:bg-orange-500/90"
                                    : SMME_FILTER_COLORS[status]
                            }`}
                        >
                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${statusFilter === status ? "bg-emerald-400" : "bg-zinc-400"}`} />
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* SMMEs Table */}
            <AnimatedTable
                columns={[
                    { header: "Name" },
                    { header: "Email" },
                    { header: "Role" },
                    { header: "Organization" },
                    { header: "Status" },
                    { header: "Actions", align: "right" },
                ]}
                data={filteredSmmes}
                emptyMessage="No SMMEs found."
                theme="orange"
                renderRow={(smme) => (
                    <>
                        <td className="font-medium">{smme.name}</td>
                        <td>{smme.email}</td>
                        <td>{smme.role}</td>
                        <td>{smme.organization || "-"}</td>
                        <td>
                            {(() => {
                                const isVerified = smme.verification_status === "verified"
                                const label = isVerified ? "Verified" : "Unverified"
                                return (
                                    <Badge
                                        variant={isVerified ? "default" : "destructive"}
                                        className={isVerified ? "bg-emerald-600 text-white hover:bg-emerald-600" : "bg-red-600 text-white hover:bg-red-600"}
                                    >
                                        {label}
                                    </Badge>
                                )
                            })()}
                        </td>
                        <td className="text-right">
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDetailsDialog(smme)}
                                    className="rounded-3xl px-4"
                                >
                                    Details
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={updatingId === smme.id}
                                    onClick={() => toggleStatus(smme.id, smme.verification_status || "pending")}
                                    className="rounded-3xl px-4"
                                >
                                    {updatingId === smme.id ? "Updating..." : (smme.verification_status === 'verified' ? "Revoke" : "Verify")}
                                </Button>
                            </div>
                        </td>
                    </>
                )}
            />

            {/* SMME Details Dialog */}
            <SmmeDetailsDialog
                open={detailsDialogOpen}
                onOpenChange={setDetailsDialogOpen}
                smme={selectedSmme}
            />
        </div>
    )
}

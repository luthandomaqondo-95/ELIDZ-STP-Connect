"use client"

import { useState } from "react"
import {
  TableCell,
} from "@/components/ui/table"
import { AnimatedTable } from "@/components/animated-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { updateSmmeStatus } from "./actions"
import { SmmeDetailsDialog } from "./smme-details-dialog"

interface SmmeTableProps {
    initialData: any[]
}

const SMME_FILTER_COLORS: Record<string, string> = {
    All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
    Verified: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
    Pending: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/35 dark:text-amber-200 dark:hover:bg-amber-900/50",
}

export function SmmeTable({ initialData }: SmmeTableProps) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const filteredData = data.filter((item) => {
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

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'verified' ? 'pending' : 'verified'
        setLoading(id)
        
        // Optimistic update
        const originalData = [...data]
        setData(prev => prev.map(item => item.id === id ? { ...item, verification_status: newStatus } : item))
        
        try {
            await updateSmmeStatus(id, newStatus)
        } catch (e) {
            console.error(e)
            // Revert on error
            setData(originalData)
            alert("Failed to update status. Please ensuring 'verification_status' column exists in 'profiles' table.")
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-4">
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

            <AnimatedTable
            columns={[
                { header: "Name" },
                { header: "Email" },
                { header: "Role" },
                { header: "Organization" },
                { header: "Status" },
                { header: "Actions", align: "right" },
            ]}
            data={filteredData}
            emptyMessage="No SMMEs found."
            theme="orange"
            renderRow={(smme) => (
                <>
                    <TableCell className="font-medium">{smme.name}</TableCell>
                    <TableCell>{smme.email}</TableCell>
                    <TableCell>{smme.role}</TableCell>
                    <TableCell>{smme.organization || "-"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <SmmeDetailsDialog
                                smme={{
                                    id: smme.id,
                                    name: smme.name,
                                    email: smme.email,
                                    organization: smme.organization,
                                    verification_status: smme.verification_status,
                                }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={loading === smme.id}
                                onClick={() => handleToggleStatus(smme.id, smme.verification_status)}
                                className="rounded-3xl px-4"
                            >
                                {loading === smme.id ? "Updating..." : (smme.verification_status === 'verified' ? "Revoke" : "Verify")}
                            </Button>
                        </div>
                    </TableCell>
                </>
            )}
        />
        </div>
    )
}


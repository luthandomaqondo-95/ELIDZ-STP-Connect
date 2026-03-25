"use client"

import * as React from "react"
import {
  TableCell,
} from "@/components/ui/table"
import { AnimatedTable } from "@/components/animated-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search, Shield, ShieldAlert, ShieldCheck } from "lucide-react"

const roles = [
    {
        role: "Super Admin",
        users: 3,
        permissions: ["All Access"],
        icon: ShieldAlert
    },
    {
        role: "Admin",
        users: 12,
        permissions: ["Manage Users", "Manage Content", "View Reports"],
        icon: ShieldCheck
    },
    {
        role: "Tenant",
        users: 845,
        permissions: ["View Opportunities", "Post Requests", "Edit Profile"],
        icon: Shield
    },
    {
        role: "Investor",
        users: 42,
        permissions: ["View Opportunities", "View Reports"],
        icon: Shield
    },
]

const ROLE_FILTER_COLORS: Record<string, string> = {
    All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
    "Super Admin": "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/35 dark:text-orange-200 dark:hover:bg-orange-900/50",
    Admin: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/35 dark:text-indigo-200 dark:hover:bg-indigo-900/50",
    Tenant: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/35 dark:text-purple-200 dark:hover:bg-purple-900/50",
    Investor: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50",
}

export default function UserRolesPage() {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [filter, setFilter] = React.useState("All")

    const filteredRoles = roles.filter((role) => {
        const search = searchQuery.toLowerCase()
        const matchesSearch =
            role.role.toLowerCase().includes(search) ||
            role.permissions.some((p) => p.toLowerCase().includes(search))

        const matchesFilter = filter === "All" || role.role === filter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader
                title="User Roles"
                icon={<ShieldCheck className="h-5 w-5" />}
                action={
                    <Link href="/dashboard/users/roles/permissions">
                        <AnimatedDashboardButton label="Manage Permissions" />
                    </Link>
                }
            />
            <div className="space-y-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search roles..."
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
                    {["All", "Super Admin", "Admin", "Tenant", "Investor"].map((roleName) => (
                        <Button
                            key={roleName}
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter(roleName)}
                            className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                                filter === roleName
                                    ? "bg-orange-500 text-white hover:bg-orange-500/90"
                                    : ROLE_FILTER_COLORS[roleName]
                            }`}
                        >
                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${filter === roleName ? "bg-emerald-400" : "bg-zinc-400"}`} />
                            {roleName}
                        </Button>
                    ))}
                </div>
            </div>
            <AnimatedTable
                columns={[
                    { header: "", className: "w-[50px]" },
                    { header: "Role Name" },
                    { header: "Active Users" },
                    { header: "Permissions" },
                    { header: "Actions", align: "right" },
                ]}
                data={filteredRoles}
                emptyMessage="No roles found."
                theme="orange"
                renderRow={(role) => (
                    <>
                        <TableCell>
                            <role.icon className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="font-medium">{role.role}</TableCell>
                        <TableCell>{role.users}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions.map((perm: string) => (
                                    <Badge key={perm} variant="secondary" className="text-xs font-normal">
                                        {perm}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Edit</Button>
                        </TableCell>
                    </>
                )}
            />
        </div>
    );
}

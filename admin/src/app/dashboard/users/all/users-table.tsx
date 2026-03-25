"use client"

import * as React from "react"
import {
  TableCell,
} from "@/components/ui/table"
import { AnimatedTable } from "@/components/animated-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Trash2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteUser, approveUser } from "./actions"

export interface User {
    id: string
    name: string
    email: string
    role: string
    status: string
    company: string
    lastActive: string
    avatar: string
}

const ROLES = ["All", "Entrepreneur", "Researcher", "SME", "Tenant", "Investor", "Admin", "Super Admin"]
const ITEMS_PER_PAGE = 10
const ROLE_FILTER_COLORS: Record<string, string> = {
    All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
    Entrepreneur: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/35 dark:text-amber-200 dark:hover:bg-amber-900/50",
    Researcher: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/35 dark:text-sky-200 dark:hover:bg-sky-900/50",
    SME: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
    Tenant: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/35 dark:text-purple-200 dark:hover:bg-purple-900/50",
    Investor: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50",
    Admin: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/35 dark:text-indigo-200 dark:hover:bg-indigo-900/50",
    "Super Admin": "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/35 dark:text-orange-200 dark:hover:bg-orange-900/50",
}

export function UsersTable({ users }: { users: User[] }) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedRole, setSelectedRole] = React.useState("All")
    const [isPending, setIsPending] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)

    // Filter users based on search query and selected role
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.company.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesRole = selectedRole === "All" || user.role === selectedRole

        return matchesSearch && matchesRole
    })

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Reset to page 1 when filter/search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedRole])

    const handleDelete = async (userId: string) => {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            setIsPending(true)
            const result = await deleteUser(userId)
            setIsPending(false)
            if (!result.success) {
                alert("Failed to delete user: " + result.error)
            }
        }
    }

    const handleApprove = async (userId: string) => {
        setIsPending(true)
        await approveUser(userId)
        setIsPending(false)
        // Ideally show a toast here
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
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
                    {ROLES.map((role) => (
                        <Button
                            key={role}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRole(role)}
                            className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                                selectedRole === role
                                    ? "bg-orange-500 text-white hover:bg-orange-500/90"
                                    : ROLE_FILTER_COLORS[role]
                            }`}
                        >
                            <span
                                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                                    selectedRole === role ? "bg-emerald-400" : "bg-zinc-400"
                                }`}
                            />
                            <span>{role}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <AnimatedTable
                columns={[
                    { header: "Avatar", className: "w-[80px]" },
                    { header: "Name" },
                    { header: "Email" },
                    { header: "Company" },
                    { header: "Role" },
                    { header: "Status" },
                    { header: "Actions", align: "right" },
                ]}
                data={paginatedUsers}
                emptyMessage="No users found."
                theme="orange"
                renderRow={(user: User) => (
                    <>
                                    <TableCell>
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : "UN"}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.company}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                            <Badge
                                variant={user.status === "Active" ? "default" : user.status === "Pending" ? "secondary" : "destructive"}
                                className={user.status === "Active" ? "bg-emerald-600 text-white hover:bg-emerald-600" : undefined}
                            >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                        Copy User ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                        Approve Account
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                    </>
                        )}
            />
            
            {/* Pagination Controls */}
            <div className="flex flex-col items-center gap-2 px-2">
                <div className="text-xs text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-3xl px-4"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages || totalPages === 0}
                        className="rounded-3xl px-4"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

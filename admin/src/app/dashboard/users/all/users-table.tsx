"use client"

import * as React from "react"
import {
  TableCell,
} from "@/components/ui/table"
import { AnimatedTable } from "@/components/animated-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Trash2, Ban, UserCheck, ChevronLeft, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteUser, suspendUser, unsuspendUser } from "./actions"

export interface User {
    id: string
    name: string
    email: string
    role: string
    status: string
    company: string
    lastActive: string
    avatar: string | null
}

/** Matches normalized list status and any legacy casing from the API. */
function isSuspendedStatus(status: string) {
    return status.trim().toLowerCase() === "suspended"
}

function isActiveStatus(status: string) {
    const s = status.trim().toLowerCase()
    return s === "active" || s === "approved"
}

const ROLES = ["All", "Entrepreneur", "SMME", "Tenant", "Admin", "Super Admin"]
const ITEMS_PER_PAGE = 10

export function UsersTable({ users, initialRole }: { users: User[]; initialRole?: string }) {
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedRole, setSelectedRole] = React.useState(initialRole === "SME" ? "SMME" : (initialRole || "All"))
    const [isPending, setIsPending] = React.useState(false)
    const [currentPage, setCurrentPage] = React.useState(1)

    // Filter users based on search query and selected role
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.company.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesRole =
            selectedRole === "All" ||
            (selectedRole === "SMME" ? user.role === "SMME" || user.role === "SME" : user.role === selectedRole)

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
            if (result.success) {
                // Show success message and refresh the page
                window.location.reload()
            } else {
                alert("Failed to delete user: " + result.error)
            }
        }
    }

    const handleSuspend = async (userId: string) => {
        if (confirm("Are you sure you want to suspend this user? They will not be able to access their account.")) {
            setIsPending(true)
            try {
                const result = await suspendUser(userId)
                if (result.success) {
                    window.location.reload()
                } else {
                    alert("Failed to suspend user: " + result.error)
                }
            } catch (error) {
                alert("An unexpected error occurred: " + (error instanceof Error ? error.message : "Unknown error"))
            } finally {
                setIsPending(false)
            }
        }
    }

    const handleUnsuspend = async (userId: string) => {
        if (confirm("Are you sure you want to unsuspend this user? They will be able to access their account again.")) {
            setIsPending(true)
            const result = await unsuspendUser(userId)
            setIsPending(false)
            if (result.success) {
                // Show success message and refresh the page
                window.location.reload()
            } else {
                alert("Failed to unsuspend user: " + result.error)
            }
        }
    }

    return (
        <div className="w-full space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col gap-4">
                {/* Search Input */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-2xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
                    />
                </div>

                {/* Role Filters */}
                <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                        <Button
                            key={role}
                            variant={selectedRole === role ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedRole(role)}
                            className={`h-9 rounded-full px-4 transition-all ${
                                selectedRole === role
                                    ? "bg-orange-500 text-white hover:bg-orange-500/90 border-orange-500"
                                    : "border-orange-200/60 hover:bg-orange-50 dark:border-orange-800/40 dark:hover:bg-orange-900/20"
                            }`}
                        >
                            {role}
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
                                            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : "UN"}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.company}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                            <Badge
                                variant={
                                    isActiveStatus(user.status) ? "default" : 
                                    user.status === "pending" || user.status === "Pending" ? "secondary" : 
                                    isSuspendedStatus(user.status) ? "destructive" : 
                                    "destructive"
                                }
                                className={
                                    isActiveStatus(user.status) ? "bg-emerald-600 text-white hover:bg-emerald-600" : 
                                    isSuspendedStatus(user.status) ? "bg-orange-600 text-white hover:bg-orange-600" : 
                                    undefined
                                }
                            >
                                {isActiveStatus(user.status) ? "Active" : 
                                 isSuspendedStatus(user.status) ? "Suspended" : 
                                 user.status}
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
                                                    {isSuspendedStatus(user.status) ? (
                                                        <DropdownMenuItem onClick={() => handleUnsuspend(user.id)} className="text-green-600 focus:text-green-600" disabled={isPending}>
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            {isPending ? "Unsuspending..." : "Unsuspend Account"}
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleSuspend(user.id)} className="text-orange-600 focus:text-orange-600" disabled={isPending}>
                                                            <Ban className="mr-2 h-4 w-4" />
                                                            {isPending ? "Suspending..." : "Suspend Account"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600" disabled={isPending}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {isPending ? "Deleting..." : "Delete Account"}
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

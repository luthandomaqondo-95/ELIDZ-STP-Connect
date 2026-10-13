"use client"

import * as React from "react"
import {
  TableCell,
} from "@/components/ui/table"
import { AnimatedTable } from "@/components/animated-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Trash2, CheckCircle, Copy, Loader2 } from "lucide-react"
import { DataPagination } from "@/components/data-pagination"
import { cn, FILTER_ROW_CLASS, MODAL_CANCEL_BUTTON_CLASS } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
const MENU_ICON_CLASS =
    "flex size-7 shrink-0 items-center justify-center rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.25)] dark:shadow-[0_3px_10px_rgba(0,0,0,0.7)]"
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

    const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
    const [deleteError, setDeleteError] = React.useState<string | null>(null)

    const openDeleteDialog = (user: User) => {
        setDeleteError(null)
        setUserToDelete(user)
    }

    const handleDelete = async () => {
        if (!userToDelete) return
        setIsPending(true)
        setDeleteError(null)
        const result = await deleteUser(userToDelete.id)
        setIsPending(false)
        if (result.success) {
            setUserToDelete(null)
        } else {
            setDeleteError(result.error ?? "Failed to delete user.")
        }
    }

    const handleApprove = async (userId: string) => {
        setIsPending(true)
        await approveUser(userId)
        setIsPending(false)
        // Ideally show a toast here
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="space-y-3">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-3xl border-0 bg-white/80 pl-10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-slate-900/60 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]"
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
                <div className={FILTER_ROW_CLASS}>
                    {ROLES.map((role) => (
                        <Button
                            key={role}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRole(role)}
                            className={`h-8 max-sm:h-8! shrink-0 rounded-3xl px-3 text-xs sm:h-9 sm:px-4 sm:text-sm border-0 shadow-[0_6px_14px_-4px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-6px_rgba(0,0,0,0.5)] dark:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.85)] dark:hover:shadow-[0_10px_20px_-6px_rgba(0,0,0,0.95)] ${
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
                                        <Avatar className="h-9 w-9 shadow-[0_4px_10px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
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
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm" className="h-8 w-8 rounded-full bg-white/90 p-0 shadow-[0_4px_10px_rgba(0,0,0,0.35)] hover:bg-white dark:bg-slate-800/90 dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)] dark:hover:bg-slate-800">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                        <span className={cn(MENU_ICON_CLASS, "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300")}>
                                                            <Copy className="size-3.5 text-current" />
                                                        </span>
                                                        Copy User ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                                                        <span className={cn(MENU_ICON_CLASS, "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300")}>
                                                            <CheckCircle className="size-3.5 text-current" />
                                                        </span>
                                                        Approve Account
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive" onSelect={() => openDeleteDialog(user)}>
                                                        <span className={cn(MENU_ICON_CLASS, "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300")}>
                                                            <Trash2 className="size-3.5 text-current" />
                                                        </span>
                                                        Delete Account
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                    </>
                        )}
            />
            
            <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                summary={
                    filteredUsers.length === 0
                        ? "No users to show"
                        : `Showing ${startIndex + 1} to ${Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of ${filteredUsers.length} users`
                }
            />

            <Dialog
                open={userToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isPending) setUserToDelete(null)
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="gap-5 p-6 sm:max-w-md sm:p-9"
                >
                    <DialogHeader className="items-center text-center sm:text-center">
                        <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.55)] dark:bg-red-900/40 dark:text-red-300 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]">
                            <Trash2 className="size-7" />
                        </div>
                        <DialogTitle className="text-xl">Delete Account</DialogTitle>
                        <DialogDescription className="text-[15px] leading-relaxed">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">{userToDelete?.name || "this user"}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError && (
                        <p className="rounded-2xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-700 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)] dark:bg-red-950/40 dark:text-red-300">
                            {deleteError}
                        </p>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                disabled={isPending}
                                className={cn(MODAL_CANCEL_BUTTON_CLASS, "h-11 min-w-36 px-6")}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="h-11 min-w-36 rounded-3xl bg-red-600 px-6 text-white shadow-[0_8px_20px_-6px_rgba(220,38,38,0.7)] hover:bg-red-600/90 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]"
                        >
                            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            {isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

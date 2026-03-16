"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Trash2, CheckCircle, Filter, ChevronLeft, ChevronRight } from "lucide-react"
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative flex-1 md:max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                        <Button
                            key={role}
                            variant={selectedRole === role ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedRole(role)}
                            className="h-8"
                        >
                            {role}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{user.name ? user.name.slice(0, 2).toUpperCase() : 'UN'}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.company}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === "Active" ? "default" : user.status === "Pending" ? "secondary" : "destructive"}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Quick Actions */}
                                            {/* Only show Approve if status is not Active (assuming we had a status field that could be Pending) */}
                                            {/* Since we default to Active, we'll just show it in the menu or if we decide to treat some as pending */}
                                            
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
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-xs text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
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
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

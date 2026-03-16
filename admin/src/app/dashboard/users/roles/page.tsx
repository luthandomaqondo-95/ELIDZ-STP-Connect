"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"

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

export default function UserRolesPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">User Roles</h1>
                <Button variant="outline">Manage Permissions</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Active Users</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.role}>
                                <TableCell>
                                    <role.icon className="h-4 w-4 text-muted-foreground" />
                                </TableCell>
                                <TableCell className="font-medium">{role.role}</TableCell>
                                <TableCell>{role.users}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.map(perm => (
                                            <Badge key={perm} variant="secondary" className="text-xs font-normal">
                                                {perm}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

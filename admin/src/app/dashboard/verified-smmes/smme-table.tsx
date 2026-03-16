"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateSmmeStatus } from "./actions"

interface SmmeTableProps {
    initialData: any[]
}

export function SmmeTable({ initialData }: SmmeTableProps) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState<string | null>(null)

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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No SMMEs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((smme) => (
                            <TableRow key={smme.id}>
                                <TableCell className="font-medium">{smme.name}</TableCell>
                                <TableCell>{smme.email}</TableCell>
                                <TableCell>{smme.role}</TableCell>
                                <TableCell>{smme.organization || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={smme.verification_status === 'verified' ? 'default' : 'secondary'}>
                                        {smme.verification_status || 'Unverified'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={loading === smme.id}
                                        onClick={() => handleToggleStatus(smme.id, smme.verification_status)}
                                    >
                                        {loading === smme.id ? "Updating..." : (smme.verification_status === 'verified' ? "Revoke" : "Verify")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}


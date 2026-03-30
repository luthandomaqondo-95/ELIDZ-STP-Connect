'use server'

import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/admin/users/${userId}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error deleting user:", errorData)
            return { success: false, error: errorData.error || "Failed to delete user" }
        }

        revalidatePath('/dashboard/users/all')
        return { success: true }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function approveUser(userId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/admin/users/${userId}/approve`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error approving user:", errorData)
            return { success: false, error: errorData.error || "Failed to approve user" }
        }

        revalidatePath('/dashboard/users/all')
        return { success: true }
    } catch (error) {
        console.error("Error approving user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: newRole }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error updating user role:", errorData)
            return { success: false, error: errorData.error || "Failed to update user role" }
        }

        revalidatePath('/dashboard/users/all')
        revalidatePath('/dashboard/users/roles')
        return { success: true }
    } catch (error) {
        console.error("Error updating user role:", error)
        return { success: false, error: "Internal server error" }
    }
}


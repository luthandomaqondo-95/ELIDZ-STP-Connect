'use server'

import { suspendProfileById, unsuspendProfileById } from "@/lib/admin/profile-suspend"
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

        const result = await response.json()
        revalidatePath('/dashboard/users/all')
        return { success: true, data: result }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function suspendUser(userId: string) {
    try {
        const result = await suspendProfileById(userId)
        if (!result.ok) {
            const msg = result.details
                ? `${result.error}: ${result.details}`
                : result.error
            return { success: false, error: msg }
        }
        revalidatePath('/dashboard/users/all')
        return {
            success: true,
            data: {
                success: true,
                message: "User suspended successfully",
                user: result.user,
            },
        }
    } catch (error) {
        console.error("Error suspending user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function unsuspendUser(userId: string) {
    try {
        const result = await unsuspendProfileById(userId)
        if (!result.ok) {
            const msg = result.details
                ? `${result.error}: ${result.details}`
                : result.error
            return { success: false, error: msg }
        }
        revalidatePath('/dashboard/users/all')
        return {
            success: true,
            data: {
                success: true,
                message: "User unsuspended successfully",
                user: result.user,
            },
        }
    } catch (error) {
        console.error("Error unsuspending user:", error)
        return { success: false, error: "Internal server error" }
    }
}

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

        const result = await response.json()
        revalidatePath('/dashboard/users/all')
        return { success: true, data: result }
    } catch (error) {
        console.error("Error deleting user:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function testApiConnectivity() {
    console.log("🧪 TEST: Testing API connectivity...")
    
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        console.log("🧪 TEST: Using base URL:", baseUrl)
        
        // Test simple GET request first
        const testResponse = await fetch(`${baseUrl}/api/test`)
        console.log("🧪 TEST: GET test response status:", testResponse.status)
        
        if (testResponse.ok) {
            const testData = await testResponse.json()
            console.log("✅ TEST: GET API working:", testData)
        } else {
            console.log("❌ TEST: GET API failed:", testResponse.status)
        }
        
        // Test POST request
        const postResponse = await fetch(`${baseUrl}/api/test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: "data" })
        })
        
        console.log("🧪 TEST: POST test response status:", postResponse.status)
        
        if (postResponse.ok) {
            const postData = await postResponse.json()
            console.log("✅ TEST: POST API working:", postData)
        } else {
            console.log("❌ TEST: POST API failed:", postResponse.status)
        }
        
        return { success: true, message: "API connectivity test completed" }
    } catch (error) {
        console.log("❌ TEST: API connectivity test failed:", error)
        return { success: false, error: "API connectivity failed" }
    }
}

export async function suspendUser(userId: string) {
    console.log("🔍 ACTIONS DEBUG: Starting suspend user action for userId:", userId)
    
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        console.log("🔍 ACTIONS DEBUG: Using base URL:", baseUrl)
        
        const response = await fetch(`${baseUrl}/api/admin/users/${userId}/suspend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        console.log("🔍 ACTIONS DEBUG: Suspend response status:", response.status)
        
        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error suspending user:", errorData)
            return { success: false, error: errorData.error || "Failed to suspend user" }
        }

        const result = await response.json()
        console.log("✅ ACTIONS SUCCESS: User suspended:", result)
        revalidatePath('/dashboard/users/all')
        return { success: true, data: result }
    } catch (error) {
        console.log("❌ ACTIONS FATAL: Unexpected error in suspendUser:", error)
        return { success: false, error: "Internal server error" }
    }
}

export async function unsuspendUser(userId: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/admin/users/${userId}/unsuspend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Error unsuspending user:", errorData)
            return { success: false, error: errorData.error || "Failed to unsuspend user" }
        }

        const result = await response.json()
        revalidatePath('/dashboard/users/all')
        return { success: true, data: result }
    } catch (error) {
        console.error("Error unsuspending user:", error)
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

        const result = await response.json()
        revalidatePath('/dashboard/users/all')
        revalidatePath('/dashboard/users/roles')
        return { success: true, data: result }
    } catch (error) {
        console.error("Error updating user role:", error)
        return { success: false, error: "Internal server error" }
    }
}

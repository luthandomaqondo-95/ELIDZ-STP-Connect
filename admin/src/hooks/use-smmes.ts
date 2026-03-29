import { useState, useEffect } from "react"
import { toast } from "sonner"

// Types
export type VerificationStatus = "pending" | "verified" | "rejected"
export type DocumentType = "Business Registration" | "ID Document" | "Business Profile" | "Tax Clearance" | "Other"

export type SmmeVerificationRow = {
    id: string
    user_id: string
    document_url: string
    document_type: DocumentType
    status: VerificationStatus
    rejection_reason?: string | null
    created_at: string
    updated_at: string
}

export type SmmeServiceProductRow = {
    id: string
    smme_id: string
    type: "Service" | "Product"
    name: string
    description: string
    category: string
    price?: string | null
    image_url?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_url?: string | null
    status: "active" | "inactive" | "pending"
    created_at: string
    updated_at: string
}

export type SmmeLite = {
    id: string
    name?: string | null
    email?: string | null
    organization?: string | null
    verification_status?: string | null
    role?: string | null
}

export function useSmmes() {
    const [smmes, setSmmes] = useState<SmmeLite[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const fetchSmmes = async () => {
        try {
            const response = await fetch('/api/admin/smmes')
            if (!response.ok) throw new Error("Failed to fetch SMMEs")
            const data = await response.json()
            setSmmes(data.smmes || [])
        } catch (error) {
            toast.error("Failed to load SMMEs")
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'verified' ? 'pending' : 'verified'
        setUpdatingId(id)
        
        // Optimistic update
        const originalData = [...smmes]
        setSmmes(prev => prev.map(item => item.id === id ? { ...item, verification_status: newStatus } : item))
        
        try {
            const response = await fetch(`/api/admin/smmes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update status")
            }

            const result = await response.json()
            toast.success(result.message || `SMME status updated to ${newStatus}`)
            
            // Refresh data
            await fetchSmmes()
        } catch (e: any) {
            setSmmes(originalData)
            toast.error(e.message || "Failed to update status")
        } finally {
            setUpdatingId(null)
        }
    }

    const addSmme = async (data: { name: string; email: string; organization: string; role: string }) => {
        try {
            const response = await fetch('/api/admin/smmes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to add SMME")
            }

            const result = await response.json()
            toast.success(result.message || "SMME added successfully")
            
            // Refresh data
            await fetchSmmes()
            return result
        } catch (e: any) {
            throw new Error(e.message || "Failed to add SMME")
        }
    }

    useEffect(() => {
        fetchSmmes()
    }, [])

    return {
        smmes,
        loading,
        updatingId,
        fetchSmmes,
        toggleStatus,
        addSmme,
    }
}

export function useSmmeDetails(smmeId: string | null) {
    const [documents, setDocuments] = useState<SmmeVerificationRow[]>([])
    const [products, setProducts] = useState<SmmeServiceProductRow[]>([])
    const [services, setServices] = useState<SmmeServiceProductRow[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchDetails = async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/admin/smmes/${id}/details`)
            if (!response.ok) throw new Error("Failed to fetch SMME details")
            
            const res = await response.json()
            setDocuments(res.documents || [])
            setProducts(res.products || [])
            setServices(res.services || [])
        } catch (e: any) {
            setError(e?.message || "Failed to load submission details")
            toast.error(e?.message || "Failed to load SMME details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (smmeId) {
            fetchDetails(smmeId)
        }
    }, [smmeId])

    return {
        documents,
        products,
        services,
        loading,
        error,
        fetchDetails,
    }
}

// Helper functions
export const SMME_FILTER_COLORS: Record<string, string> = {
    All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
    Verified: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/35 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
    Pending: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/35 dark:text-amber-200 dark:hover:bg-amber-900/50",
}

export function statusBadge(status: VerificationStatus) {
    if (status === "verified") {
        return "bg-emerald-600 text-white hover:bg-emerald-600"
    }
    if (status === "rejected") {
        return "bg-red-600 text-white hover:bg-red-600"
    }
    return "bg-amber-500 text-white hover:bg-amber-500"
}

export function docLabel(type: DocumentType) {
    switch (type) {
        case "Business Registration":
            return "Business Registration (CIPC)"
        case "ID Document":
            return "ID Document"
        case "Business Profile":
            return "Business Profile"
        case "Tax Clearance":
            return "Tax Clearance"
        case "Other":
            return "Other Document"
        default:
            return type
    }
}

import { useCallback } from "react"

export function useVisitTracker() {
    const trackVisit = useCallback(async (entityType: 'facility' | 'service' | 'product', entityId: string, userId?: string) => {
        try {
            await fetch('/api/admin/analytics/visits/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entityType,
                    entityId,
                    userId: userId || null,
                }),
            })
        } catch (error) {
            // Silently fail - visit tracking shouldn't break the app
            console.warn('Failed to track visit:', error)
        }
    }, [])

    const trackFacilityVisit = useCallback((facilityId: string, userId?: string) => {
        return trackVisit('facility', facilityId, userId)
    }, [trackVisit])

    const trackServiceVisit = useCallback((serviceId: string, userId?: string) => {
        return trackVisit('service', serviceId, userId)
    }, [trackVisit])

    const trackProductVisit = useCallback((productId: string, userId?: string) => {
        return trackVisit('product', productId, userId)
    }, [trackVisit])

    return {
        trackVisit,
        trackFacilityVisit,
        trackServiceVisit,
        trackProductVisit,
    }
}

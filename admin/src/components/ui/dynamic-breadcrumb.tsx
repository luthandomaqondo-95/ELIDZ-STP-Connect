"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import React from "react"

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        // Capitalize and replace hyphens
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        
        return {
            title,
            href,
            isLast
        }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                         <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                             {crumb.isLast ? (
                                 <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                             ) : (
                                 <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
                             )}
                         </BreadcrumbItem>
                         {!crumb.isLast && (
                             <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                         )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}


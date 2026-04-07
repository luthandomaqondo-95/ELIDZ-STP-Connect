"use client"

import * as React from "react"
import Image from "next/image"
import {
	BarChart3,
	Bell,
	Briefcase,
	Car,
	Cpu,
	FlaskConical,
	LayoutDashboard,
	PenTool,
	Users,
	Zap,
	type LucideIcon,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar"

// This is sample data.
const ElidzLogo = ({ className }: { className?: string }) => (
	<div className={`relative ${className}`}>
		<Image src="/logos/elidz-icon.png" alt="ELIDZ" fill className="object-contain" sizes="32px" />
	</div>
)

// Icon mapping for dynamic facilities
type SidebarProject = {
	name: string
	url: string
	icon: LucideIcon
}

type FacilityRecord = {
	service_id: string
	service_name: string
	service_icon: string | null
}

const iconMap: Record<string, LucideIcon> = {
    'droplet': FlaskConical,
    'pen-tool': PenTool,
    'monitor': Cpu,
    'settings': Car,
    'zap': Zap,
    'default': Building2
}

import { Building2 } from "lucide-react"

// Static sidebar entries for specific ELIDZ centers.
// These link to explicit center routes (even if the DB also has them).
const staticCenters = [
	{
		name: "Design Centre",
		url: "/dashboard/projects/design-centre",
		icon: PenTool,
	},
	{
		name: "Digital Hub",
		url: "/dashboard/projects/digital-hub",
		icon: Cpu,
	},
	{
		name: "INNOSPACE",
		url: "/dashboard/projects/innospace",
		icon: Building2,
	},
	{
		name: "Renewable Energy Center",
		url: "/dashboard/projects/renewable-energy-center",
		icon: Zap,
	},
	{
		name: "Automotive & Manufacturing",
		url: "/dashboard/projects/automotive-manufacturing",
		icon: Car,
	},
	{
		name: "Analytics Laboratory",
		url: "/dashboard/projects/analytics-laboratory",
		icon: BarChart3,
	},
]

const baseData = {
	teams: [
		{
			name: "ELIDZ Admin",
			logo: ElidzLogo,
			plan: "Science & Technology Park",
		},
	],
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboard,
			isActive: true,
		},
		{
			title: "User Management",
			url: "/dashboard/users",
			icon: Users,
			items: [
				{
					title: "All Users",
					url: "/dashboard/users/all",
				},
				{
					title: "Verified SMMEs",
					url: "/dashboard/verified-smmes",
				},
				{
					title: "User Roles",
					url: "/dashboard/users/roles",
				},
				{
					title: "Message Reports",
					url: "/dashboard/users/reports",
				},
			],
		},
		{
			title: "Opportunities",
			url: "/dashboard/opportunities",
			icon: Briefcase,
			items: [
				{
					title: "Manage Opportunities",
					url: "/dashboard/opportunities",
				},
			],
		},
		{
			title: "Communication",
			url: "/dashboard/communication/news",
			icon: Bell,
			items: [
				{
					title: "Send Alerts",
					url: "/dashboard/communication/alerts",
				},
				{
					title: "Publish News",
					url: "/dashboard/communication/news",
				},
				{
					title: "Publish Events",
					url: "/dashboard/communication/events",
				},
				{
					title: "Message Center",
					url: "/dashboard/communication/messages",
				},
			],
		},
		{
			title: "Reports",
			url: "/dashboard/reports",
			icon: BarChart3,
			items: [
				{
					title: "User Demographics",
					url: "/dashboard/reports/demographics",
				},
				{
					title: "Platform Engagement",
					url: "/dashboard/reports/engagement",
				},
				{
					title: "Opportunities Pipeline",
					url: "/dashboard/reports/opportunities",
				},
				{
					title: "SMME & Business",
					url: "/dashboard/reports/smme",
				},
				{
					title: "Moderation & Safety",
					url: "/dashboard/reports/moderation",
				},
			],
		}
	],
    // Initial empty projects, will be populated from DB
	projects: [],
    user: {
		name: "Admin User",
		email: "admin@elidz.co.za",
		avatar: "/avatars/admin.jpg",
	},
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
    const [projects, setProjects] = React.useState<SidebarProject[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [mounted, setMounted] = React.useState(false)
    const supabase = createClient()

    React.useEffect(() => {
        setMounted(true)
        async function fetchFacilities() {
            try {
                const { data } = await supabase.from('facilities').select('service_id, service_name, service_icon')
                if (data) {
                    const seen = new Set<string>()
                    const mappedProjects = data
                        .filter((r: FacilityRecord) => {
                            if (seen.has(r.service_id)) return false
                            seen.add(r.service_id)
                            return true
                        })
                        .map((r: FacilityRecord) => ({
                            name: r.service_name,
                            url: `/dashboard/projects/${r.service_id}`,
                            icon: (r.service_icon && iconMap[r.service_icon]) || iconMap.default
                        }))
                    setProjects(mappedProjects)
                }
            } catch (error) {
                console.error("Error fetching facilities:", error)
            } finally {
                setIsLoading(false)
            }
        }
        
        if (mounted) {
            fetchFacilities()
        }
    }, [supabase, mounted])

    const mergedProjects = React.useMemo(() => {
        const normalize = (value: unknown) =>
            value
                ? value
                      .toString()
                      .toLowerCase()
                      .replace(/\s+/g, " ")
                      .trim()
                : ""

        // Treat "Center" and "Centre" as the same for sidebar deduping.
        const normalizeCenterVariant = (value: unknown) =>
            normalize(value).replace(/\bcentre\b/g, "center")

        // Prevent duplicated center entries:
        // - Keep static center links
        // - Remove DB-loaded projects that represent the same centers (by normalized name)
        const staticCenterNameSet = new Set(staticCenters.map((c) => normalizeCenterVariant(c.name)))
        const normalizedAnalyticsLaboratory = normalize("Analytics Laboratory")
        const normalizedAnalyticalLaboratory = normalize("Analytical Laboratory")
        const normalizedAutomotiveManufacturing = normalizeCenterVariant("Automotive & Manufacturing")
        const normalizedAutomotive = normalizeCenterVariant("Automotive")
        const normalizedAutomotiveIncubator = normalizeCenterVariant("Automotive Incubator")

        // If the DB contains an "Analytical Laboratory" entry, hide it from the sidebar
        // (to avoid a duplicate) and reuse its icon for the "Analytics Laboratory" item.
        const dbAnalytical = projects.find((p) => normalize(p?.name) === normalizedAnalyticalLaboratory)
        const dbAnalytics = projects.find((p) => normalize(p?.name) === normalizedAnalyticsLaboratory)

        const pickedAnalyticsIcon = dbAnalytical?.icon ?? dbAnalytics?.icon ?? staticCenters.find((c) => normalize(c.name) === normalizedAnalyticsLaboratory)?.icon

        // If the DB contains an "Automotive" entry, hide it and reuse its icon for
        // the "Automotive & Manufacturing" static page.
        const dbAutomotiveAlias = projects.find((p) => {
            const key = normalizeCenterVariant(p?.name)
            return (
                (key === normalizedAutomotive || key === normalizedAutomotiveIncubator) &&
                key !== normalizedAutomotiveManufacturing
            )
        })

        const staticCentersWithIcons = staticCenters.map((c) => {
            if (normalize(c.name) === normalizedAnalyticsLaboratory) {
                return { ...c, icon: pickedAnalyticsIcon }
            }

            // For Renewable Energy, reuse the DB icon from either spelling ("Center"/"Centre")
            // while keeping only the static sidebar entry URL.
            if (normalizeCenterVariant(c.name) === normalizeCenterVariant("Renewable Energy Center")) {
                const dbRenewableCandidate = projects.find(
                    (p) => normalizeCenterVariant(p?.name) === normalizeCenterVariant("Renewable Energy Center")
                )
                return { ...c, icon: dbRenewableCandidate?.icon ?? c.icon }
            }

            if (normalizeCenterVariant(c.name) === normalizedAutomotiveManufacturing) {
                return { ...c, icon: dbAutomotiveAlias?.icon ?? c.icon }
            }
            return c
        })

        const filteredProjects = projects.filter((p) => {
            const key = normalizeCenterVariant(p?.name ?? p?.url)
            const rawName = normalizeCenterVariant(p?.name)
            const rawUrl = normalizeCenterVariant(p?.url)

            // Drop DB "Analytical Laboratory" entry completely (we'll keep the icon on the analytics item).
            if (normalize(p?.name ?? p?.url) === normalizedAnalyticalLaboratory) return false

            // Drop DB "Automotive" (or "Automotive Incubator") entry to avoid sidebar duplication.
            if (key === normalizedAutomotive || key === normalizedAutomotiveIncubator) return false
            // Extra safety: sometimes the DB name/slug differs slightly.
            if (rawName.includes("automotive incubator")) return false
            if (rawUrl.includes("/dashboard/projects/automotive-incubator")) return false

            // Otherwise, remove DB-loaded duplicates for the static centers.
            return key ? !staticCenterNameSet.has(key) : true
        })

        const merged = [...staticCentersWithIcons, ...filteredProjects]
        const map = new Map<string, any>()
        for (const p of merged) {
            const key = normalizeCenterVariant(p?.name ?? p?.url)
            if (!key) continue
            if (!map.has(key)) map.set(key, p)
        }
        return Array.from(map.values())
    }, [projects])

    const sidebarData = React.useMemo(() => { 
        if (!mounted) {
            // Return static data only during SSR
            return { 
                ...baseData, 
                user: user || baseData.user,
                projects: []
            }
        }
        
        return { 
            ...baseData, 
            user: user || baseData.user,
            projects: mergedProjects
        }
    }, [mounted, user, mergedProjects])

    // Show loading state or prevent hydration mismatch
    if (!mounted || isLoading) {
        return (
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader className="border-b">
                    <TeamSwitcher teams={baseData.teams} />
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={baseData.navMain} />
                    <NavProjects projects={[]} />
                </SidebarContent>
                <SidebarFooter>
                    <SidebarSeparator className="ml-0 mr-4" />
                    <NavUser user={user || baseData.user} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        )
    }

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader className="border-b">
				<TeamSwitcher teams={sidebarData.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={sidebarData.navMain} />
				<NavProjects projects={sidebarData.projects} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarSeparator className="ml-0 mr-4" />
				<NavUser user={sidebarData.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}

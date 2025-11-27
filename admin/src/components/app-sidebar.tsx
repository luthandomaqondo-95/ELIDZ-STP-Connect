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
} from "@/components/ui/sidebar"

// This is sample data.
const ElidzLogo = ({ className }: { className?: string }) => (
	<div className={`relative ${className}`}>
		<Image src="/logos/elidz-icon.png" alt="ELIDZ" fill className="object-contain" />
	</div>
)

// Icon mapping for dynamic facilities
const iconMap: Record<string, any> = {
    'droplet': FlaskConical,
    'pen-tool': PenTool,
    'monitor': Cpu,
    'settings': Car,
    'zap': Zap,
    'default': Building2
}

import { Building2 } from "lucide-react"

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
					title: "Registrations",
					url: "/dashboard/users/registrations",
				},
				{
					title: "Verified SMMEs",
					url: "/dashboard/verified-smmes",
				},
				{
					title: "User Roles",
					url: "/dashboard/users/roles",
				},
			],
		},
		{
			title: "Opportunities",
			url: "/dashboard/opportunities",
			icon: Briefcase,
			items: [
				{
					title: "View Opportunities",
					url: "/dashboard/opportunities",
				},
				{
					title: "Post Opportunity",
					url: "/dashboard/opportunities/create",
				},
				{
					title: "Funding Info",
					url: "/dashboard/opportunities/funding",
				},
			],
		},
		{
			title: "Communication",
			url: "/dashboard/communication",
			icon: Bell,
			items: [
				{
					title: "Send Alerts",
					url: "/dashboard/communication/alerts",
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
					title: "Product Line Visits",
					url: "/dashboard/reports/visits",
				},
				{
					title: "System Usage",
					url: "/dashboard/reports/usage",
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
    const [projects, setProjects] = React.useState<any[]>([])
    const supabase = createClient()

    React.useEffect(() => {
        async function fetchFacilities() {
            try {
                const { data } = await supabase.from('facilities').select('*')
                if (data) {
                    const mappedProjects = data.map(facility => ({
                        name: facility.name,
                        url: `/dashboard/projects/${facility.id}`,
                        icon: iconMap[facility.icon] || iconMap['default']
                    }))
                    setProjects(mappedProjects)
                }
            } catch (error) {
                console.error("Error fetching facilities:", error)
            }
        }
        fetchFacilities()
    }, [supabase])

    const sidebarData = { 
        ...baseData, 
        user: user || baseData.user,
        projects: projects.length > 0 ? projects : baseData.projects
    }

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={sidebarData.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={sidebarData.navMain} />
				<NavProjects projects={sidebarData.projects} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={sidebarData.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}

"use client"

import * as React from "react"
import Image from "next/image"
import {
	BarChart3,
	Bell,
	BookOpen,
	Bot,
	Briefcase,
	Building2,
	Car,
	Cpu,
	FlaskConical,
	LayoutDashboard,
	PenTool,
	Settings2,
	Users,
	Zap,
} from "lucide-react"

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

const data = {
	user: {
		name: "Admin User",
		email: "admin@elidz.co.za",
		avatar: "/avatars/admin.jpg",
	},
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
	projects: [
		{
			name: "Food & Water Lab",
			url: "/dashboard/projects/food-water-lab",
			icon: FlaskConical,
		},
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
			name: "Automotive & Mfg",
			url: "/dashboard/projects/automotive",
			icon: Car,
		},
		{
			name: "Renewable Energy",
			url: "/dashboard/projects/renewable-energy",
			icon: Zap,
		},
	],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
    const sidebarData = { ...data, user: user || data.user }

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

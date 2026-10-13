"use client"

import Link from "next/link"
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { SidebarTabIcon, sidebarTabClass } from "@/components/sidebar-tab-icon"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-orange-600 dark:text-orange-300">Projects</SidebarGroupLabel>
      <SidebarMenu className="gap-2.5">
        {projects.map((item) => {
          const active = pathname === item.url || pathname.startsWith(`${item.url}/`)
          return (
          <SidebarMenuItem key={item.name} className="flex items-center gap-2">
            <SidebarTabIcon icon={item.icon} name={item.name} active={active} href={item.url} />
            <SidebarMenuButton asChild tooltip={item.name} isActive={active} className={sidebarTabClass(item.name)}>
              <Link href={item.url}>
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )})}
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarTabIcon icon={MoreHorizontal} name="More" />
          <SidebarMenuButton tooltip="More" className={sidebarTabClass("More", "text-sidebar-foreground/70")}>
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

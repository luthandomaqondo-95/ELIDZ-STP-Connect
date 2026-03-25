"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  const isItemActive = (item: { url: string }) => {
    if (item.url === "/dashboard") return pathname === "/dashboard"
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-orange-600 dark:text-orange-300">Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
            const active = isItemActive(item)
            // If there are no sub-items, render a simple link
            if (!item.items || item.items.length === 0) {
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title} isActive={active}>
                            <Link href={item.url}>
                                {item.icon && <item.icon className="text-sky-400" />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            }

            // If there are sub-items, render the collapsible
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} isActive={active}>
                      {item.icon && <item.icon className="text-sky-400" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const subActive = pathname === subItem.url || pathname.startsWith(`${subItem.url}/`)
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={subActive}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

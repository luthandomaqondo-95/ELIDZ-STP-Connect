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
import { SidebarTabIcon, sidebarTabClass } from "@/components/sidebar-tab-icon"

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
      <SidebarMenu className="gap-2.5">
        {items.map((item) => {
            const active = isItemActive(item)
            // If there are no sub-items, render a simple link
            if (!item.items || item.items.length === 0) {
                return (
                    <SidebarMenuItem key={item.title} className="flex items-center gap-2">
                        {item.icon && <SidebarTabIcon icon={item.icon} name={item.title} active={active} href={item.url} />}
                        <SidebarMenuButton asChild tooltip={item.title} isActive={active} className={sidebarTabClass(item.title)}>
                            <Link href={item.url}>
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
                  <div className="flex items-center gap-2">
                    {item.icon && (
                      <CollapsibleTrigger asChild>
                        <SidebarTabIcon icon={item.icon} name={item.title} active={active} />
                      </CollapsibleTrigger>
                    )}
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={active} className={sidebarTabClass(item.title)}>
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-[transform,opacity] duration-400 ease-in-out group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:opacity-0" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-[3.375rem] mt-2">
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

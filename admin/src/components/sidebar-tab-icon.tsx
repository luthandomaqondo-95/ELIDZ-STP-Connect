import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"

import { cn } from "@/lib/utils"

// Raised tab: top highlight, darker bottom edge and layered drop shadows. The selected tab looks pressed in.
const SIDEBAR_TAB_CLASS = [
  "border-0 bg-white",
  "shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-3px_6px_-2px_rgba(15,23,42,0.14),0_1px_1px_rgba(15,23,42,0.18),0_3px_5px_-1px_rgba(15,23,42,0.22),0_10px_18px_-8px_rgba(15,23,42,0.5)]",
  "hover:-translate-y-px hover:bg-white hover:text-sidebar-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-3px_6px_-2px_rgba(15,23,42,0.14),0_2px_2px_rgba(15,23,42,0.18),0_6px_10px_-2px_rgba(15,23,42,0.25),0_16px_24px_-10px_rgba(15,23,42,0.55)]",
  "active:translate-y-px active:bg-slate-100 active:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22),inset_0_1px_2px_rgba(15,23,42,0.16),0_1px_0_rgba(255,255,255,0.9)]",
  "data-[active=true]:ring-2 data-[active=true]:ring-orange-400/80 dark:data-[active=true]:ring-orange-400/70",
  "data-[active=true]:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22),inset_0_1px_2px_rgba(15,23,42,0.16),0_1px_0_rgba(255,255,255,0.9)]",
  "data-[active=true]:hover:translate-y-0 data-[active=true]:hover:shadow-[inset_0_2px_5px_rgba(15,23,42,0.22),inset_0_1px_2px_rgba(15,23,42,0.16),0_1px_0_rgba(255,255,255,0.9)]",
  "dark:bg-slate-800 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_12px_14px_-10px_rgba(255,255,255,0.08),inset_0_-3px_6px_-2px_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.6),0_3px_5px_-1px_rgba(0,0,0,0.6),0_10px_20px_-8px_rgba(0,0,0,0.95)]",
  "dark:hover:bg-slate-700 dark:hover:text-sidebar-foreground dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_12px_14px_-10px_rgba(255,255,255,0.1),inset_0_-3px_6px_-2px_rgba(0,0,0,0.5),0_2px_2px_rgba(0,0,0,0.6),0_6px_10px_-2px_rgba(0,0,0,0.7),0_16px_26px_-10px_rgba(0,0,0,1)]",
  "dark:active:bg-slate-900 dark:active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)]",
  "dark:data-[active=true]:shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)]",
  "dark:data-[active=true]:hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(0,0,0,0.7),0_1px_0_rgba(255,255,255,0.06)]",
  "group-data-[collapsible=icon]:-ml-10 group-data-[collapsible=icon]:translate-y-0! group-data-[collapsible=icon]:bg-transparent! group-data-[collapsible=icon]:shadow-none! group-data-[collapsible=icon]:ring-0!",
].join(" ")

type TabPalette = { icon: string; activeTab: string }

// Class names are written out in full so Tailwind can find them. The hover variants keep the tint while hovering.
const palette = (icon: string, activeTab: string): TabPalette => ({ icon, activeTab })

const TAB_PALETTES: Record<string, TabPalette> = {
  "dashboard": palette(
    "text-sky-500 dark:text-sky-400",
    "data-[active=true]:bg-sky-100 data-[active=true]:hover:bg-sky-100 data-[active=true]:text-sky-900 data-[active=true]:hover:text-sky-900 dark:data-[active=true]:bg-sky-400/15 dark:data-[active=true]:hover:bg-sky-400/15 dark:data-[active=true]:text-sky-100 dark:data-[active=true]:hover:text-sky-100"
  ),
  "user management": palette(
    "text-violet-500 dark:text-violet-400",
    "data-[active=true]:bg-violet-100 data-[active=true]:hover:bg-violet-100 data-[active=true]:text-violet-900 data-[active=true]:hover:text-violet-900 dark:data-[active=true]:bg-violet-400/15 dark:data-[active=true]:hover:bg-violet-400/15 dark:data-[active=true]:text-violet-100 dark:data-[active=true]:hover:text-violet-100"
  ),
  "opportunities": palette(
    "text-amber-500 dark:text-amber-400",
    "data-[active=true]:bg-amber-100 data-[active=true]:hover:bg-amber-100 data-[active=true]:text-amber-900 data-[active=true]:hover:text-amber-900 dark:data-[active=true]:bg-amber-400/15 dark:data-[active=true]:hover:bg-amber-400/15 dark:data-[active=true]:text-amber-100 dark:data-[active=true]:hover:text-amber-100"
  ),
  "communication": palette(
    "text-rose-500 dark:text-rose-400",
    "data-[active=true]:bg-rose-100 data-[active=true]:hover:bg-rose-100 data-[active=true]:text-rose-900 data-[active=true]:hover:text-rose-900 dark:data-[active=true]:bg-rose-400/15 dark:data-[active=true]:hover:bg-rose-400/15 dark:data-[active=true]:text-rose-100 dark:data-[active=true]:hover:text-rose-100"
  ),
  "reports": palette(
    "text-emerald-500 dark:text-emerald-400",
    "data-[active=true]:bg-emerald-100 data-[active=true]:hover:bg-emerald-100 data-[active=true]:text-emerald-900 data-[active=true]:hover:text-emerald-900 dark:data-[active=true]:bg-emerald-400/15 dark:data-[active=true]:hover:bg-emerald-400/15 dark:data-[active=true]:text-emerald-100 dark:data-[active=true]:hover:text-emerald-100"
  ),
  "design centre": palette(
    "text-fuchsia-500 dark:text-fuchsia-400",
    "data-[active=true]:bg-fuchsia-100 data-[active=true]:hover:bg-fuchsia-100 data-[active=true]:text-fuchsia-900 data-[active=true]:hover:text-fuchsia-900 dark:data-[active=true]:bg-fuchsia-400/15 dark:data-[active=true]:hover:bg-fuchsia-400/15 dark:data-[active=true]:text-fuchsia-100 dark:data-[active=true]:hover:text-fuchsia-100"
  ),
  "digital hub": palette(
    "text-cyan-500 dark:text-cyan-400",
    "data-[active=true]:bg-cyan-100 data-[active=true]:hover:bg-cyan-100 data-[active=true]:text-cyan-900 data-[active=true]:hover:text-cyan-900 dark:data-[active=true]:bg-cyan-400/15 dark:data-[active=true]:hover:bg-cyan-400/15 dark:data-[active=true]:text-cyan-100 dark:data-[active=true]:hover:text-cyan-100"
  ),
  "innospace": palette(
    "text-indigo-500 dark:text-indigo-400",
    "data-[active=true]:bg-indigo-100 data-[active=true]:hover:bg-indigo-100 data-[active=true]:text-indigo-900 data-[active=true]:hover:text-indigo-900 dark:data-[active=true]:bg-indigo-400/15 dark:data-[active=true]:hover:bg-indigo-400/15 dark:data-[active=true]:text-indigo-100 dark:data-[active=true]:hover:text-indigo-100"
  ),
  "renewable energy center": palette(
    "text-lime-600 dark:text-lime-400",
    "data-[active=true]:bg-lime-100 data-[active=true]:hover:bg-lime-100 data-[active=true]:text-lime-900 data-[active=true]:hover:text-lime-900 dark:data-[active=true]:bg-lime-400/15 dark:data-[active=true]:hover:bg-lime-400/15 dark:data-[active=true]:text-lime-100 dark:data-[active=true]:hover:text-lime-100"
  ),
  "automotive & manufacturing": palette(
    "text-orange-500 dark:text-orange-400",
    "data-[active=true]:bg-orange-100 data-[active=true]:hover:bg-orange-100 data-[active=true]:text-orange-900 data-[active=true]:hover:text-orange-900 dark:data-[active=true]:bg-orange-400/15 dark:data-[active=true]:hover:bg-orange-400/15 dark:data-[active=true]:text-orange-100 dark:data-[active=true]:hover:text-orange-100"
  ),
  "analytics laboratory": palette(
    "text-teal-500 dark:text-teal-400",
    "data-[active=true]:bg-teal-100 data-[active=true]:hover:bg-teal-100 data-[active=true]:text-teal-900 data-[active=true]:hover:text-teal-900 dark:data-[active=true]:bg-teal-400/15 dark:data-[active=true]:hover:bg-teal-400/15 dark:data-[active=true]:text-teal-100 dark:data-[active=true]:hover:text-teal-100"
  ),
  "more": palette(
    "text-slate-500 dark:text-slate-400",
    "data-[active=true]:bg-slate-200 data-[active=true]:hover:bg-slate-200 data-[active=true]:text-slate-900 data-[active=true]:hover:text-slate-900 dark:data-[active=true]:bg-slate-400/15 dark:data-[active=true]:hover:bg-slate-400/15 dark:data-[active=true]:text-slate-100 dark:data-[active=true]:hover:text-slate-100"
  ),
}

const FALLBACK_PALETTES: TabPalette[] = [
  palette(
    "text-pink-500 dark:text-pink-400",
    "data-[active=true]:bg-pink-100 data-[active=true]:hover:bg-pink-100 data-[active=true]:text-pink-900 data-[active=true]:hover:text-pink-900 dark:data-[active=true]:bg-pink-400/15 dark:data-[active=true]:hover:bg-pink-400/15 dark:data-[active=true]:text-pink-100 dark:data-[active=true]:hover:text-pink-100"
  ),
  palette(
    "text-blue-500 dark:text-blue-400",
    "data-[active=true]:bg-blue-100 data-[active=true]:hover:bg-blue-100 data-[active=true]:text-blue-900 data-[active=true]:hover:text-blue-900 dark:data-[active=true]:bg-blue-400/15 dark:data-[active=true]:hover:bg-blue-400/15 dark:data-[active=true]:text-blue-100 dark:data-[active=true]:hover:text-blue-100"
  ),
  palette(
    "text-green-500 dark:text-green-400",
    "data-[active=true]:bg-green-100 data-[active=true]:hover:bg-green-100 data-[active=true]:text-green-900 data-[active=true]:hover:text-green-900 dark:data-[active=true]:bg-green-400/15 dark:data-[active=true]:hover:bg-green-400/15 dark:data-[active=true]:text-green-100 dark:data-[active=true]:hover:text-green-100"
  ),
  palette(
    "text-yellow-500 dark:text-yellow-400",
    "data-[active=true]:bg-yellow-100 data-[active=true]:hover:bg-yellow-100 data-[active=true]:text-yellow-900 data-[active=true]:hover:text-yellow-900 dark:data-[active=true]:bg-yellow-400/15 dark:data-[active=true]:hover:bg-yellow-400/15 dark:data-[active=true]:text-yellow-100 dark:data-[active=true]:hover:text-yellow-100"
  ),
  palette(
    "text-purple-500 dark:text-purple-400",
    "data-[active=true]:bg-purple-100 data-[active=true]:hover:bg-purple-100 data-[active=true]:text-purple-900 data-[active=true]:hover:text-purple-900 dark:data-[active=true]:bg-purple-400/15 dark:data-[active=true]:hover:bg-purple-400/15 dark:data-[active=true]:text-purple-100 dark:data-[active=true]:hover:text-purple-100"
  ),
  palette(
    "text-red-500 dark:text-red-400",
    "data-[active=true]:bg-red-100 data-[active=true]:hover:bg-red-100 data-[active=true]:text-red-900 data-[active=true]:hover:text-red-900 dark:data-[active=true]:bg-red-400/15 dark:data-[active=true]:hover:bg-red-400/15 dark:data-[active=true]:text-red-100 dark:data-[active=true]:hover:text-red-100"
  ),
]

function tabPalette(name: string) {
  const key = name.trim().toLowerCase()
  if (TAB_PALETTES[key]) return TAB_PALETTES[key]
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length]
}

export function sidebarTabIconColor(name: string) {
  return tabPalette(name).icon
}

export function sidebarTabClass(name: string, className?: string) {
  return cn(SIDEBAR_TAB_CLASS, tabPalette(name).activeTab, className)
}

type SidebarTabIconProps = {
  icon: LucideIcon
  name: string
  active?: boolean
  href?: string
} & Omit<React.ComponentProps<"button">, "children">

// Duplicates its tab's action for pointer users only, so it stays out of the tab order and the accessibility tree.
// When collapsed it lets clicks through to the tab underneath, which owns the tooltip.
export function SidebarTabIcon({
  icon: Icon,
  name,
  active = false,
  href,
  className,
  ...props
}: SidebarTabIconProps) {
  const classes = cn(
    "relative z-10 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-hidden transition-[box-shadow,translate] duration-200",
    "bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#f4f6f9_45%,#d5dbe4_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(15,23,42,0.2),0_1px_1px_rgba(15,23,42,0.25),0_3px_6px_-1px_rgba(15,23,42,0.35),0_8px_14px_-6px_rgba(15,23,42,0.5)]",
    "hover:-translate-y-px hover:shadow-[inset_0_1px_1px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(15,23,42,0.2),0_2px_2px_rgba(15,23,42,0.25),0_5px_9px_-1px_rgba(15,23,42,0.35),0_12px_18px_-6px_rgba(15,23,42,0.55)]",
    "active:translate-y-px active:shadow-[inset_0_2px_4px_rgba(15,23,42,0.25),inset_0_-1px_1px_rgba(255,255,255,0.8),0_1px_1px_rgba(15,23,42,0.2)]",
    "dark:bg-[radial-gradient(circle_at_32%_28%,#4b5b70_0%,#1e293b_55%,#0b1220_100%)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),inset_0_-2px_4px_rgba(0,0,0,0.6),0_1px_1px_rgba(0,0,0,0.7),0_3px_6px_-1px_rgba(0,0,0,0.7),0_8px_16px_-6px_rgba(0,0,0,0.95)]",
    "dark:hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-2px_4px_rgba(0,0,0,0.6),0_2px_2px_rgba(0,0,0,0.7),0_5px_9px_-1px_rgba(0,0,0,0.75),0_12px_20px_-6px_rgba(0,0,0,1)]",
    "dark:active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_-1px_1px_rgba(255,255,255,0.08),0_1px_1px_rgba(0,0,0,0.6)]",
    "group-data-[collapsible=icon]:pointer-events-none",
    active && "ring-2 ring-orange-400/80 dark:ring-orange-400/70",
    sidebarTabIconColor(name),
    className
  )
  const glyph = (
    <Icon className="size-4 drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.8)]" strokeWidth={2.25} />
  )

  if (href) {
    return (
      <Link href={href} aria-hidden tabIndex={-1} className={classes}>
        {glyph}
      </Link>
    )
  }

  return (
    <button type="button" aria-hidden tabIndex={-1} className={classes} {...props}>
      {glyph}
    </button>
  )
}

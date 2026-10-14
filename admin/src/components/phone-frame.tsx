"use client"

import * as React from "react"
import {
  BatteryFull,
  Bell,
  Grid2x2,
  Home,
  MessageCircle,
  Search,
  Shield,
  Signal,
  Wifi,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

function useClock() {
  const [time, setTime] = React.useState("9:41")

  React.useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false }))
    update()
    const id = window.setInterval(update, 30_000)
    return () => window.clearInterval(id)
  }, [])

  return time
}

type PhoneFrameProps = {
  children: React.ReactNode
  className?: string
  screenClassName?: string
}

export function PhoneFrame({ children, className, screenClassName }: PhoneFrameProps) {
  const time = useClock()

  return (
    <div className={cn("relative mx-auto w-[272px] select-none", className)}>
      <span aria-hidden className="absolute -left-[3px] top-[96px] h-7 w-[3px] rounded-l-sm bg-gradient-to-b from-[#3a3f47] to-[#1a1d22]" />
      <span aria-hidden className="absolute -left-[3px] top-[140px] h-12 w-[3px] rounded-l-sm bg-gradient-to-b from-[#3a3f47] to-[#1a1d22]" />
      <span aria-hidden className="absolute -left-[3px] top-[200px] h-12 w-[3px] rounded-l-sm bg-gradient-to-b from-[#3a3f47] to-[#1a1d22]" />
      <span aria-hidden className="absolute -right-[3px] top-[160px] h-16 w-[3px] rounded-r-sm bg-gradient-to-b from-[#3a3f47] to-[#1a1d22]" />

      <div className="relative h-[560px] rounded-[3rem] bg-gradient-to-br from-[#4a4f57] via-[#1c1f24] to-[#3a3e45] p-[3px] shadow-[0_45px_80px_-25px_rgba(0,0,0,0.7),0_20px_40px_-15px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.35)] dark:shadow-[0_45px_80px_-20px_rgba(0,0,0,0.95),0_20px_40px_-12px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.3),0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="relative h-full rounded-[2.85rem] bg-black p-[9px]">
          <div
            className={cn(
              "relative h-full overflow-hidden rounded-[2.35rem] bg-[#0a1628] text-white",
              screenClassName,
            )}
          >
            <div className="absolute inset-x-0 top-0 z-30 flex h-11 items-center justify-between px-6 pt-1 text-[11px] font-semibold text-white">
              <span className="tabular-nums">{time}</span>
              <span className="flex items-center gap-1">
                <Signal className="size-3" strokeWidth={2.5} />
                <Wifi className="size-3" strokeWidth={2.5} />
                <BatteryFull className="size-4" strokeWidth={2} />
              </span>
            </div>

            <div className="absolute left-1/2 top-2.5 z-40 flex h-[24px] w-[84px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
              <span className="size-[7px] rounded-full bg-[#0d1b2e] shadow-[inset_0_0_2px_rgba(80,140,255,0.6)]" />
            </div>

            <div className="relative h-full">{children}</div>

            <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-40 h-[4px] w-24 -translate-x-1/2 rounded-full bg-white/80" />
            <div className="pointer-events-none absolute inset-0 z-50 rounded-[2.35rem] bg-gradient-to-br from-white/[0.09] via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

type PhoneAppHeaderProps = {
  title: string
  subtitle: string
  searchPlaceholder: string
}

export function PhoneAppHeader({ title, subtitle, searchPlaceholder }: PhoneAppHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-[#002147] via-[#0a2c57] to-[#003366] px-4 pb-4 pt-12 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.7)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold leading-none tracking-tight">{title}</p>
          <p className="mt-1 text-[9px] text-white/70">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-7 items-center justify-center rounded-full bg-white/10 shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
            <Bell className="size-3.5 text-white/90" />
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#f38c1e]" />
          </span>
          <span className="size-7 rounded-full bg-gradient-to-br from-[#f4b25f] to-[#2a4f89] shadow-[0_3px_8px_rgba(0,0,0,0.5)]" />
        </div>
      </div>
      <div className="flex h-8 items-center rounded-full bg-white/10 px-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.45)]">
        <Search className="size-3.5 text-white/60" />
        <p className="ml-2 text-[10px] text-white/50">{searchPlaceholder}</p>
      </div>
    </div>
  )
}

export function PhoneChips({ chips }: { chips: string[] }) {
  return (
    <div className="flex gap-1.5">
      {chips.map((chip, index) => (
        <span
          key={chip}
          className={cn(
            "whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold shadow-[0_3px_8px_rgba(0,0,0,0.4)]",
            index === 0 ? "bg-[#f38c1e] text-white" : "bg-[#112846] text-[#b8c6dc]",
          )}
        >
          {chip}
        </span>
      ))}
    </div>
  )
}

export function PhoneSkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex gap-2.5 rounded-2xl bg-[#112846]/70 p-2.5 opacity-60 shadow-[0_8px_18px_-8px_rgba(0,0,0,0.7)]"
        >
          <div className="size-14 shrink-0 rounded-xl bg-[#1d3a60]" />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-2 w-1/3 rounded-full bg-[#2d4a70]" />
            <div className="h-2.5 w-full rounded-full bg-[#2d4a70]" />
            <div className="h-2.5 w-3/4 rounded-full bg-[#2d4a70]" />
          </div>
        </div>
      ))}
    </>
  )
}

type PhoneBottomNavProps = {
  activeLabel: string
  activeIcon: LucideIcon
}

export function PhoneBottomNav({ activeLabel, activeIcon }: PhoneBottomNavProps) {
  const items = [
    { label: "Home", icon: Home },
    { label: "Services", icon: Grid2x2 },
    { label: activeLabel, icon: activeIcon },
    { label: "SMME's", icon: Shield },
    { label: "Messages", icon: MessageCircle },
  ]

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-5 bg-[#081326]/90 px-2 pb-5 pt-2 shadow-[0_-8px_18px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md">
      {items.map(({ label, icon: Icon }) => {
        const active = label === activeLabel
        return (
          <div
            key={label}
            className={cn("flex flex-col items-center gap-0.5", active ? "text-[#f38c1e]" : "text-[#8d9bb0]")}
          >
            <span
              className={cn(
                "flex h-6 w-10 items-center justify-center rounded-full",
                active && "bg-[#f38c1e]/15 shadow-[0_3px_8px_rgba(0,0,0,0.4)]",
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span className="text-[8px] font-medium">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

type PreviewModeToggleProps<T extends string> = {
  modes: readonly T[]
  value: T
  onChange: (mode: T) => void
}

export function PreviewModeToggle<T extends string>({ modes, value, onChange }: PreviewModeToggleProps<T>) {
  return (
    <div className="mx-auto flex w-fit gap-1 rounded-full bg-slate-100 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] dark:bg-slate-800 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
            value === mode
              ? "bg-orange-500 text-white shadow-[0_6px_14px_-4px_rgba(234,88,12,0.6)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

import { ReactNode } from "react"
import { AnimatedSeparator } from "@/components/animated-separator"
import { cn } from "@/lib/utils"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"

interface DashboardPageHeaderProps {
  title: ReactNode
  action?: ReactNode
  icon?: ReactNode
  rawIcon?: boolean
  className?: string
  backHref?: string
  backLabel?: string
}

export function DashboardPageHeader({
  title,
  action,
  icon,
  rawIcon = false,
  className,
  backHref,
  backLabel = "Go back",
}: DashboardPageHeaderProps) {
  const resolvedIcon = icon ?? <LayoutDashboard className="h-5 w-5" />

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label={backLabel}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl border-0 bg-orange-100 text-orange-700 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.45)] transition-colors hover:bg-orange-200/80 dark:bg-orange-900/30 dark:text-orange-200 dark:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.85)] dark:hover:bg-orange-900/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : rawIcon ? (
            <>{resolvedIcon}</>
          ) : (
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-3xl border-0 bg-orange-100 text-orange-700 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.45)] dark:bg-orange-900/30 dark:text-orange-200 dark:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.85)]">
              {resolvedIcon}
            </div>
          )}
          <h1 className="min-w-0 text-xl leading-tight font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl dark:text-slate-100">
            {title}
          </h1>
        </div>
        {action ? <div className="shrink-0 self-center sm:self-auto">{action}</div> : null}
      </div>
      <AnimatedSeparator
        className="!my-0"
        fullWidth
        lineClassName="w-full"
        color="#fb923c"
        showCenterDot={false}
      />
    </div>
  )
}


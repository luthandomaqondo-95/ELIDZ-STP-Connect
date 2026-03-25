"use client"

import { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Column {
  header: string
  align?: "left" | "right" | "center"
  className?: string
}

interface AnimatedTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  renderRow: (item: any, index: number) => ReactNode
  theme?: "teal" | "indigo" | "blue" | "purple" | "emerald" | "orange" | "violet"
  animationDelay?: number
}

const themeClasses = {
  teal: {
    border: "border-teal-200/50 dark:border-teal-800/40",
    bg: "from-teal-50/30 via-white to-white dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-teal-100/50 dark:bg-teal-950/30",
    headerBorder: "border-teal-200/50 dark:border-teal-800/40",
    headerText: "text-teal-700 dark:text-teal-300",
    rowBorder: "border-teal-100/50 dark:border-teal-900/30",
    rowHover: "hover:bg-teal-50/50 dark:hover:bg-teal-950/20",
  },
  indigo: {
    border: "border-indigo-200/50 dark:border-indigo-800/40",
    bg: "from-indigo-50/30 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-indigo-100/50 dark:bg-indigo-950/30",
    headerBorder: "border-indigo-200/50 dark:border-indigo-800/40",
    headerText: "text-indigo-700 dark:text-indigo-300",
    rowBorder: "border-indigo-100/50 dark:border-indigo-900/30",
    rowHover: "hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
  },
  blue: {
    border: "border-blue-200/50 dark:border-blue-800/40",
    bg: "from-blue-50/30 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-blue-100/50 dark:bg-blue-950/30",
    headerBorder: "border-blue-200/50 dark:border-blue-800/40",
    headerText: "text-blue-700 dark:text-blue-300",
    rowBorder: "border-blue-100/50 dark:border-blue-900/30",
    rowHover: "hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
  },
  purple: {
    border: "border-purple-200/50 dark:border-purple-800/40",
    bg: "from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-purple-100/50 dark:bg-purple-950/30",
    headerBorder: "border-purple-200/50 dark:border-purple-800/40",
    headerText: "text-purple-700 dark:text-purple-300",
    rowBorder: "border-purple-100/50 dark:border-purple-900/30",
    rowHover: "hover:bg-purple-50/50 dark:hover:bg-purple-950/20",
  },
  emerald: {
    border: "border-emerald-200/50 dark:border-emerald-800/40",
    bg: "from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-emerald-100/50 dark:bg-emerald-950/30",
    headerBorder: "border-emerald-200/50 dark:border-emerald-800/40",
    headerText: "text-emerald-700 dark:text-emerald-300",
    rowBorder: "border-emerald-100/50 dark:border-emerald-900/30",
    rowHover: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
  },
  orange: {
    border: "border-orange-200/50 dark:border-orange-800/40",
    bg: "from-orange-50/30 via-white to-white dark:from-orange-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-orange-100/50 dark:bg-orange-950/30",
    headerBorder: "border-orange-200/50 dark:border-orange-800/40",
    headerText: "text-orange-700 dark:text-orange-300",
    rowBorder: "border-orange-100/50 dark:border-orange-900/30",
    rowHover: "hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
  },
  violet: {
    border: "border-violet-200/50 dark:border-violet-800/40",
    bg: "from-violet-50/30 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900",
    headerBg: "bg-violet-100/50 dark:bg-violet-950/30",
    headerBorder: "border-violet-200/50 dark:border-violet-800/40",
    headerText: "text-violet-700 dark:text-violet-300",
    rowBorder: "border-violet-100/50 dark:border-violet-900/30",
    rowHover: "hover:bg-violet-50/50 dark:hover:bg-violet-950/20",
  },
}

export function AnimatedTable({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  renderRow,
  theme = "indigo",
  animationDelay = 0.05,
}: AnimatedTableProps) {
  const themeClass = themeClasses[theme]

  return (
    <div
      className={cn(
        "rounded-2xl border-2 bg-gradient-to-br overflow-hidden shadow-inner",
        themeClass.border,
        themeClass.bg
      )}
    >
      <div className="w-full overflow-x-auto md:overflow-visible">
        <div className="min-w-[700px] md:min-w-0">
          <Table>
        <TableHeader>
          <TableRow
            className={cn(
              "border-b-2",
              themeClass.headerBg,
              themeClass.headerBorder
            )}
          >
            {columns.map((column, idx) => (
              <TableHead
                key={idx}
                className={cn(
                  "font-semibold text-xs uppercase tracking-wide py-2 md:py-3.5",
                  themeClass.headerText,
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-6 md:py-8 text-center text-sm text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-6 md:py-8 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={index}
                className={cn(
                  "table-row-waterfall-row transition-all duration-200",
                  themeClass.rowBorder,
                  themeClass.rowHover
                )}
                style={{
                  ["--row-delay" as any]: `${index * animationDelay}s`,
                }}
              >
                {renderRow(item, index)}
              </TableRow>
            ))
          )}
        </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

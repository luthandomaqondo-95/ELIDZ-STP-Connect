"use client"

import * as React from "react"
import { MoreHorizontal, Search } from "lucide-react"

import { AnimatedTable } from "@/components/animated-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TableCell } from "@/components/ui/table"
import { type ReportStatus, type ReportTableItem, updateMessageReportStatus } from "@/lib/message-reports"

const STATUS_FILTERS: Array<"all" | ReportStatus> = ["all", "pending", "reviewing", "resolved", "dismissed"]

const STATUS_BADGE_CLASS: Record<ReportStatus, string> = {
  pending: "bg-amber-500 text-white hover:bg-amber-500",
  reviewing: "bg-blue-600 text-white hover:bg-blue-600",
  resolved: "bg-emerald-600 text-white hover:bg-emerald-600",
  dismissed: "bg-slate-600 text-white hover:bg-slate-600",
}

export function UserReportsTable({ reports }: { reports: ReportTableItem[] }) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | ReportStatus>("all")
  const [isPending, setIsPending] = React.useState(false)

  const filteredReports = React.useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const search = searchQuery.toLowerCase()
      const matchesSearch =
        report.reason.toLowerCase().includes(search) ||
        report.messagePreview.toLowerCase().includes(search) ||
        report.reporterName.toLowerCase().includes(search) ||
        report.reportedUserName.toLowerCase().includes(search) ||
        report.chatLabel.toLowerCase().includes(search)
      return matchesStatus && matchesSearch
    })
  }, [reports, searchQuery, statusFilter])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  const handleStatusUpdate = async (reportId: string, status: ReportStatus) => {
    setIsPending(true)
    const result = await updateMessageReportStatus(reportId, status)
    setIsPending(false)

    if (!result.success) {
      alert(`Failed to update report: ${result.error}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-2xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const isActive = statusFilter === status
            return (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                  isActive
                    ? "bg-orange-500 text-white hover:bg-orange-500/90"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            )
          })}
        </div>
      </div>

      <AnimatedTable
        columns={[
          { header: "Reported User" },
          { header: "Reporter" },
          { header: "Reason" },
          { header: "Message" },
          { header: "Status" },
          { header: "Submitted" },
          { header: "Actions", align: "right" },
        ]}
        data={filteredReports}
        emptyMessage="No reports found."
        theme="orange"
        renderRow={(report: ReportTableItem) => (
          <>
            <TableCell>
              <div className="font-medium">{report.reportedUserName}</div>
              <div className="text-xs text-muted-foreground">{report.reportedUserEmail}</div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{report.reporterName}</div>
              <div className="text-xs text-muted-foreground">{report.reporterEmail}</div>
            </TableCell>
            <TableCell className="max-w-[180px] truncate" title={report.reason}>
              {report.reason}
            </TableCell>
            <TableCell className="max-w-[220px]">
              <div className="truncate text-sm" title={report.messagePreview}>
                {report.messagePreview}
              </div>
              <div className="text-xs text-muted-foreground">{report.chatLabel}</div>
            </TableCell>
            <TableCell>
              <Badge className={STATUS_BADGE_CLASS[report.status]}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{formatDate(report.createdAt)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Moderate Report</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, "reviewing")}>
                    Mark as Reviewing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, "resolved")}>
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(report.id, "dismissed")}>
                    Dismiss Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </>
        )}
      />
    </div>
  )
}


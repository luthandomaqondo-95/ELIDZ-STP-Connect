"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const CIRCLE_BUTTON_CLASS =
  "flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-white text-sm font-semibold text-foreground shadow-[0_6px_14px_-4px_rgba(0,0,0,0.4)] transition-all duration-150 outline-none hover:-translate-y-0.5 hover:shadow-[0_10px_18px_-6px_rgba(0,0,0,0.5)] focus-visible:ring-2 focus-visible:ring-orange-400/60 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none dark:bg-slate-800 dark:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.85)] dark:hover:shadow-[0_10px_20px_-6px_rgba(0,0,0,0.95)]"

const ACTIVE_CIRCLE_CLASS =
  "bg-orange-500 text-white shadow-[0_8px_18px_-4px_rgba(234,88,12,0.6)] dark:bg-orange-500 dark:shadow-[0_8px_18px_-4px_rgba(0,0,0,0.9)]"

type PageToken = number | "ellipsis-start" | "ellipsis-end"

function getPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  const tokens: PageToken[] = [1]

  if (start > 2) tokens.push("ellipsis-start")
  for (let page = start; page <= end; page++) tokens.push(page)
  if (end < totalPages - 1) tokens.push("ellipsis-end")
  tokens.push(totalPages)

  return tokens
}

type DataPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  summary?: React.ReactNode
  className?: string
}

export function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  summary,
  className,
}: DataPaginationProps) {
  const pageCount = Math.max(1, totalPages)
  const page = Math.min(Math.max(1, currentPage), pageCount)

  return (
    <nav aria-label="Pagination" className={cn("flex flex-col items-center gap-3 px-2 pt-2", className)}>
      {summary ? <div className="text-xs text-muted-foreground">{summary}</div> : null}

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={CIRCLE_BUTTON_CLASS}
        >
          <ChevronLeft className="size-4" />
        </button>

        {getPageTokens(page, pageCount).map((token) =>
          typeof token === "number" ? (
            <button
              key={token}
              type="button"
              aria-label={`Page ${token}`}
              aria-current={token === page ? "page" : undefined}
              onClick={() => onPageChange(token)}
              className={cn(CIRCLE_BUTTON_CLASS, token === page && ACTIVE_CIRCLE_CLASS)}
            >
              {token}
            </button>
          ) : (
            <span key={token} className="flex size-9 items-center justify-center text-sm text-muted-foreground">
              …
            </span>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={CIRCLE_BUTTON_CLASS}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}

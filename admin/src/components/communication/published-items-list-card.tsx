"use client"

import { ReactNode, useMemo, useState } from "react"
import { Search } from "lucide-react"

import { DataPagination } from "@/components/data-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, DASHBOARD_CARD_CLASS } from "@/lib/utils"

type PublishedItemsListCardProps<T> = {
  title: string
  description: string
  filterPlaceholder: string
  emptyText: string
  items: T[]
  itemsPerPage?: number
  matchesQuery: (item: T, query: string) => boolean
  renderItem: (item: T) => ReactNode
}

export function PublishedItemsListCard<T>({
  title,
  description,
  filterPlaceholder,
  emptyText,
  items,
  itemsPerPage = 2,
  matchesQuery,
  renderItem,
}: PublishedItemsListCardProps<T>) {
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((item) => matchesQuery(item, normalized))
  }, [items, query, matchesQuery])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const visibleItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card className={cn(DASHBOARD_CARD_CLASS, "min-w-0 gap-3 py-5")}>
      <CardHeader className="space-y-2 px-4 sm:px-6">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCurrentPage(1)
            }}
            placeholder={filterPlaceholder}
            className="h-11 w-full rounded-full border-0 bg-slate-100 pl-11 pr-4 text-sm text-foreground shadow-[inset_0_2px_6px_rgba(0,0,0,0.18)] outline-none transition dark:bg-slate-800"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 sm:px-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 sm:p-6 text-center text-sm text-muted-foreground shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)] dark:bg-slate-800/50 dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            {emptyText}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">{visibleItems.map(renderItem)}</div>
        )}

        {filteredItems.length > itemsPerPage ? (
          <DataPagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
        ) : null}
      </CardContent>
    </Card>
  )
}

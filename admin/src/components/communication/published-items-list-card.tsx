"use client"

import { ReactNode, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card className="rounded-3xl border border-cyan-500/20 bg-[#040c20] text-slate-100 shadow-[0_20px_45px_rgba(2,10,30,0.45)]">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg text-slate-100">{title}</CardTitle>
        <p className="text-sm text-slate-300">{description}</p>

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
            className="h-12 w-full rounded-full border border-cyan-500/40 bg-[#07152f] pl-11 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/70"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-300">
          <p>
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-300">
            {emptyText}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">{visibleItems.map(renderItem)}</div>
        )}

        {filteredItems.length > itemsPerPage ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-full border border-cyan-500/20 bg-[#0a1a37] px-4 text-slate-200 hover:bg-[#10264d] disabled:opacity-45"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <p className="text-sm text-slate-300">
              Page {safePage} of {totalPages}
            </p>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-full border border-cyan-500/20 bg-[#0a1a37] px-4 text-slate-200 hover:bg-[#10264d] disabled:opacity-45"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Clock3, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteNews } from "@/lib/publish-mobile-news"

const ITEMS_PER_PAGE = 2

type NewsAuthor =
  | {
      id?: string | null
      name?: string | null
      email?: string | null
    }
  | Array<{
      id?: string | null
      name?: string | null
      email?: string | null
    }>
  | null

type PublishedNewsItem = {
  id: string
  title?: string | null
  content?: string | null
  image_url?: string | null
  published_at?: string | null
  created_at?: string | null
  author?: NewsAuthor
}

type PublishedNewsListProps = {
  items: PublishedNewsItem[]
}

function toDisplayDate(value?: string | null) {
  if (!value) return "Not scheduled"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not scheduled"

  return date.toLocaleString()
}

function resolveAuthorName(author: NewsAuthor | undefined) {
  if (!author) return null
  if (Array.isArray(author)) return author[0]?.name ?? author[0]?.email ?? null
  return author.name ?? author.email ?? null
}

export function PublishedNewsList({ items }: PublishedNewsListProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return items

    return items.filter((item) => {
      const title = (item.title ?? "").toLowerCase()
      const content = (item.content ?? "").toLowerCase()
      return title.includes(normalizedQuery) || content.includes(normalizedQuery)
    })
  }, [items, query])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const visibleItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  async function handleDelete(id: string) {
    setDeletingId(id)
    const result = await deleteNews(id)

    if (result.error) {
      toast.error(result.error)
      setDeletingId(null)
      return
    }

    toast.success("News item deleted.")
    router.refresh()
    setDeletingId(null)
  }

  return (
    <Card className="rounded-3xl border border-cyan-500/20 bg-[#040c20] text-slate-100 shadow-[0_20px_45px_rgba(2,10,30,0.45)]">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg text-slate-100">Recently Published</CardTitle>
        <p className="text-sm text-slate-300">
          Review the latest items currently available to mobile users.
        </p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter news..."
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
            No published news found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleItems.map((item) => {
              const authorName = resolveAuthorName(item.author)
              return (
                <article
                  key={item.id}
                  className="group flex h-full flex-col rounded-3xl border border-cyan-500/15 bg-[#06122a] p-5 shadow-[0_12px_30px_rgba(1,8,22,0.45)]"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-3 text-xl font-semibold leading-tight text-slate-100">
                      {item.title || "Untitled article"}
                    </h3>
                    <Badge className="shrink-0 rounded-full bg-emerald-500/25 px-3 py-1 text-emerald-200 hover:bg-emerald-500/25">
                      Published
                    </Badge>
                  </div>

                  {authorName ? (
                    <p className="mb-3 text-sm text-slate-300">{authorName}</p>
                  ) : null}

                  <p className="line-clamp-4 text-base leading-relaxed text-slate-200/95">
                    {item.content || "No content available."}
                  </p>

                  <div className="mt-auto pt-4">
                    <p className="inline-flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 className="h-4 w-4" />
                      {toDisplayDate(item.published_at)}
                    </p>

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete news item"
                        className="h-8 w-8 rounded-full text-slate-400/35 transition hover:bg-red-500/10 hover:text-red-400 group-hover:text-slate-300/80"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {filteredItems.length > ITEMS_PER_PAGE ? (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-full border border-cyan-500/20 bg-[#0a1a37] px-4 text-slate-200 hover:bg-[#10264d] disabled:opacity-45"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <p className="text-sm text-slate-300">
              Page {Math.min(currentPage, totalPages)} of {totalPages}
            </p>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={currentPage === totalPages}
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

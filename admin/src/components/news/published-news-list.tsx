"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Clock3, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PublishedItemsListCard } from "@/components/communication/published-items-list-card"
import { deleteNews } from "@/lib/publish-mobile-news"

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    <PublishedItemsListCard
      title="Recently Published"
      description="Review the latest items currently available to mobile users."
      filterPlaceholder="Filter news..."
      emptyText="No published news found."
      items={items}
      matchesQuery={(item, query) => {
        const title = (item.title ?? "").toLowerCase()
        const content = (item.content ?? "").toLowerCase()
        return title.includes(query) || content.includes(query)
      }}
      renderItem={(item) => {
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

            {authorName ? <p className="mb-3 text-sm text-slate-300">{authorName}</p> : null}

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
      }}
    />
  )
}

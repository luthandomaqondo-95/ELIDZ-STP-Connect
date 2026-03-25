import { Newspaper } from "lucide-react"

import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { NewsPublisher } from "@/components/news/news-publisher"
import { PublishedNewsList } from "@/components/news/published-news-list"
import { createClient } from "@/lib/supabase/server"

export default async function PublishNewsPage() {
  const supabase = await createClient()
  const { data: news } = await supabase
    .from("news")
    .select(
      "id, title, content, image_url, published_at, created_at, author:profiles(id, name, email)"
    )
    .order("published_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title="Publish News"
        icon={<Newspaper className="h-5 w-5" />}
      />

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Add mobile news updates for the ELIDZ Science and Technology Park app. Articles are saved
        to Supabase and then shown in the app&apos;s news tab.
      </p>

      <NewsPublisher />

      <PublishedNewsList items={(news || []) as Parameters<typeof PublishedNewsList>[0]["items"]} />
    </div>
  )
}

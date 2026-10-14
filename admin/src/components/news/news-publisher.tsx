"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Clock,
  ImageIcon,
  Link2,
  Newspaper,
  Share2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import {
  PhoneAppHeader,
  PhoneBottomNav,
  PhoneChips,
  PhoneFrame,
  PhoneSkeletonCards,
  PreviewModeToggle,
} from "@/components/phone-frame"
import { cn } from "@/lib/utils"

import {
  FloatingLabelInput,
  FloatingLabelTextarea,
} from "@/components/floating-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  createNewsPublisherInitialForm,
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_MAX_BYTES,
} from "@/lib/news"
import { publishNews } from "@/lib/publish-mobile-news"

export function NewsPublisher() {
  const router = useRouter()
  const [form, setForm] = useState(createNewsPublisherInitialForm)
  const [previewMode, setPreviewMode] = useState<"feed" | "article">("feed")
  const [loading, setLoading] = useState(false)
  const [imageSource, setImageSource] = useState<"url" | "upload">("url")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const excerpt = useMemo(() => {
    const trimmed = form.content.trim().replace(/\s+/g, " ")
    if (!trimmed) return "Your mobile news preview will appear here."
    return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed
  }, [form.content])

  const readMinutes = useMemo(() => {
    const words = form.content.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [form.content])

  const uploadedImagePreviewUrl = useMemo(() => {
    if (!selectedImageFile) {
      return null
    }

    return URL.createObjectURL(selectedImageFile)
  }, [selectedImageFile])

  useEffect(() => {
    return () => {
      if (uploadedImagePreviewUrl) {
        URL.revokeObjectURL(uploadedImagePreviewUrl)
      }
    }
  }, [uploadedImagePreviewUrl])

  const previewImageUrl = imageSource === "upload" ? uploadedImagePreviewUrl : form.imageUrl.trim()
  const previewDateLabel = useMemo(() => {
    const value = form.publishedAt ? new Date(form.publishedAt) : new Date()
    if (Number.isNaN(value.getTime())) return "Publish date"
    return value.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [form.publishedAt])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await publishNews(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("News published to the mobile app feed.")
    setForm(createNewsPublisherInitialForm())
    setImageSource("url")
    setSelectedImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    router.refresh()
    setLoading(false)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedImageFile(nextFile)

    if (nextFile) {
      setImageSource("upload")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="h-full min-w-0 gap-3 sm:gap-4 py-5 rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Write Article</CardTitle>
            <CardDescription>
              Publish a news item straight to the app&apos;s ELIDZ-STP news tab.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3 sm:gap-4 px-4 sm:px-6">
            <div className="grid gap-3 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                name="title"
                label="Headline"
                placeholder="e.g. ELIDZ opens new innovation support programme"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                required
              />

              <FloatingLabelInput
                id="published_at"
                name="published_at"
                type="datetime-local"
                label="Publish Date"
                value={form.publishedAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, publishedAt: event.target.value }))
                }
                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
              />
            </div>

            <input type="hidden" name="image_url" value={form.imageUrl} />

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Cover Image</p>
                <p className="text-sm text-muted-foreground">
                  Use a direct image URL or upload a file from your device.
                </p>
              </div>

              <Tabs
                value={imageSource}
                onValueChange={(value) => setImageSource(value as "url" | "upload")}
                className="gap-3 md:flex-row md:items-start"
              >
                <TabsList className="h-11 w-full shrink-0 rounded-3xl bg-orange-100/70 p-1 md:w-auto dark:bg-slate-800/70">
                  <TabsTrigger value="url" className="flex-1 rounded-3xl px-4 md:flex-none">
                    <Link2 className="h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1 rounded-3xl px-4 md:flex-none">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="min-w-0 space-y-2">
                  <FloatingLabelInput
                    id="image-url-visible"
                    label="Cover Image URL"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, imageUrl: event.target.value }))
                      setImageSource("url")
                    }}
                    className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a direct image link. If you also upload a file, the uploaded image will be used.
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="min-w-0 space-y-3">
                  <div className="rounded-3xl bg-orange-50/80 p-3 sm:p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] dark:bg-slate-900/40 dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)]">
                    <label
                      htmlFor="image_file"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl px-3 py-5 text-center sm:px-4 sm:py-6 transition-all hover:bg-white/70 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:hover:bg-slate-800/60 dark:hover:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.4)] dark:bg-orange-900/30 dark:text-orange-200 dark:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.85)]">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {selectedImageFile ? selectedImageFile.name : "Choose a cover image"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP, or GIF up to {Math.floor(NEWS_IMAGE_MAX_BYTES / 1024 / 1024)} MB
                        </p>
                      </div>
                    </label>

                    <input
                      ref={fileInputRef}
                      id="image_file"
                      name="image_file"
                      type="file"
                      accept={NEWS_IMAGE_ACCEPT}
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex flex-1 flex-col [&>div]:flex [&>div]:flex-1 [&>div]:flex-col [&>div>div]:flex-1 [&_textarea]:h-full">
              <FloatingLabelTextarea
                id="content"
                name="content"
                label="Article Content"
                placeholder="Share the full news update for app users..."
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                className="min-h-[200px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                required
              />
            </div>

            <div className="flex sm:justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-3xl border-0 bg-orange-100/80 px-6 text-sm sm:w-auto text-orange-800 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-orange-200/80 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/50"
              >
                {loading ? "Publishing..." : "Publish News"}
              </Button>
            </div>
          </CardContent>
        </Card>

      <div className="flex w-full min-w-0 flex-col lg:w-[380px]">

        <Card className="h-full flex-1 gap-3 py-5 rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
          <CardHeader className="space-y-3 px-4 sm:px-6">
            <div>
              <CardTitle>Mobile Preview</CardTitle>
              <CardDescription className="mt-1.5">
                See how the story looks in the app feed and when opened.
              </CardDescription>
            </div>
            <PreviewModeToggle modes={["feed", "article"] as const} value={previewMode} onChange={setPreviewMode} />
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center px-2 pb-4 pt-1 sm:px-4">
            <PhoneFrame className="max-[359px]:-my-7 max-[359px]:scale-[0.88]">
              {previewMode === "feed" ? (
                <div className="flex h-full flex-col">
                  <PhoneAppHeader
                    title="News"
                    subtitle="Stay updated with the latest from ELIDZ-STP"
                    searchPlaceholder="Search news..."
                  />

                  <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-20 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <PhoneChips chips={["All", "Innovation", "Events", "Tenders"]} />

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8fa3c0]">Latest</p>

                    <article
                      onClick={() => setPreviewMode("article")}
                      className="cursor-pointer overflow-hidden rounded-2xl bg-[#112846] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.75)] transition-transform hover:-translate-y-0.5"
                    >
                      <div className="relative h-32 w-full">
                        {previewImageUrl ? (
                          <Image src={previewImageUrl} alt="News cover preview" fill unoptimized className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2d4a70] to-[#1a3254] text-[#d7e1ef]">
                            <ImageIcon className="size-7 opacity-70" />
                          </div>
                        )}
                        <span className="absolute left-2 top-2 rounded-full bg-[#f38c1e] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
                          New
                        </span>
                      </div>
                      <div className="space-y-1.5 p-3">
                        <p className="flex items-center gap-1 text-[9px] text-[#8fa3c0]">
                          <CalendarDays className="size-2.5" />
                          {previewDateLabel}
                        </p>
                        <h3 className="line-clamp-2 text-[12px] font-bold leading-snug">
                          {form.title.trim() || "Your headline will appear here"}
                        </h3>
                        <p className="line-clamp-3 text-[10px] leading-relaxed text-[#c3d0e3]">{excerpt}</p>
                        <p className="flex items-center gap-1 pt-0.5 text-[10px] font-semibold text-[#f38c1e]">
                          Read more <ArrowRight className="size-3" />
                        </p>
                      </div>
                    </article>

                    <PhoneSkeletonCards />
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pb-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="relative h-52 w-full">
                    {previewImageUrl ? (
                      <Image src={previewImageUrl} alt="News cover preview" fill unoptimized className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2d4a70] to-[#1a3254] text-[#d7e1ef]">
                        <ImageIcon className="size-8 opacity-70" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0a1628]" />
                    <div className="absolute inset-x-3 top-12 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("feed")}
                        className="flex size-8 items-center justify-center rounded-full bg-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.5)] backdrop-blur-md"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="flex size-8 items-center justify-center rounded-full bg-black/40 shadow-[0_4px_10px_rgba(0,0,0,0.5)] backdrop-blur-md">
                        <Share2 className="size-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="relative -mt-6 space-y-3 rounded-t-3xl bg-[#0a1628] px-4 pt-5">
                    <span className="inline-block rounded-full bg-[#f38c1e]/15 px-2.5 py-1 text-[9px] font-semibold text-[#f8a94f] shadow-[0_3px_8px_rgba(0,0,0,0.4)]">
                      ELIDZ-STP News
                    </span>
                    <h3 className="text-[15px] font-bold leading-snug">
                      {form.title.trim() || "Your headline will appear here"}
                    </h3>
                    <div className="flex items-center gap-3 text-[9px] text-[#8fa3c0]">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-2.5" />
                        {previewDateLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-2.5" />
                        {readMinutes} min read
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap pb-4 text-[11px] leading-relaxed text-[#c3d0e3]">
                      {form.content.trim() || "Your full article will appear here as you type."}
                    </p>
                  </div>
                </div>
              )}

              <PhoneBottomNav activeLabel="News" activeIcon={Newspaper} />
            </PhoneFrame>
          </CardContent>
        </Card>
      </div>
      </div>
    </form>
  )
}

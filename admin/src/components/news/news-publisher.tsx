"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Grid2x2,
  Home,
  ImageIcon,
  Link2,
  MessageCircle,
  Newspaper,
  Search,
  Shield,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

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
  const [loading, setLoading] = useState(false)
  const [imageSource, setImageSource] = useState<"url" | "upload">("url")
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const excerpt = useMemo(() => {
    const trimmed = form.content.trim().replace(/\s+/g, " ")
    if (!trimmed) return "Your mobile news preview will appear here."
    return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader>
            <CardTitle>Write Article</CardTitle>
            <CardDescription>
              Publish a news item straight to the app&apos;s ELIDZ-STP news tab.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                name="title"
                label="Headline"
                placeholder="e.g. ELIDZ opens new innovation support programme"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
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
                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
              />
            </div>

            <input type="hidden" name="image_url" value={form.imageUrl} />

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Cover Image</p>
                <p className="text-sm text-muted-foreground">
                  Use a direct image URL or upload a file from your device.
                </p>
              </div>

              <Tabs
                value={imageSource}
                onValueChange={(value) => setImageSource(value as "url" | "upload")}
                className="space-y-4"
              >
                <TabsList className="h-11 rounded-3xl bg-orange-100/70 p-1 dark:bg-slate-800/70">
                  <TabsTrigger value="url" className="rounded-3xl px-4">
                    <Link2 className="h-4 w-4" />
                    Image URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-3xl px-4">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="url" className="space-y-3">
                  <FloatingLabelInput
                    id="image-url-visible"
                    label="Cover Image URL"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, imageUrl: event.target.value }))
                      setImageSource("url")
                    }}
                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a direct image link. If you also upload a file, the uploaded image will be used.
                  </p>
                </TabsContent>

                <TabsContent value="upload" className="space-y-3">
                  <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/80 p-4 dark:border-orange-800/40 dark:bg-slate-900/40">
                    <label
                      htmlFor="image_file"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-transparent px-4 py-6 text-center transition-colors hover:border-orange-300 hover:bg-white/60 dark:hover:border-orange-700/60 dark:hover:bg-slate-800/50"
                    >
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200">
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

            <FloatingLabelTextarea
              id="content"
              name="content"
              label="Article Content"
              placeholder="Share the full news update for app users..."
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              className="min-h-[220px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
              required
            />
          </CardContent>
        </Card>

      <div className="flex w-full flex-col gap-4 lg:w-[380px]">
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="h-10 rounded-3xl border border-orange-200/60 bg-orange-100/80 px-6 text-sm text-orange-800 shadow-sm hover:bg-orange-200/80 dark:border-orange-800/40 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/50"
          >
            {loading ? "Publishing..." : "Publish News"}
          </Button>
        </div>

        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader>
            <CardTitle>Mobile Preview</CardTitle>
            <CardDescription>
              This gives you a quick sense of how the story will read in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-6">
            <div className="mx-auto h-[390px] w-[220px] overflow-hidden rounded-[2rem] border border-[#1f3557] bg-[#0a1628] shadow-[0_24px_50px_rgba(2,8,24,0.55)]">
              <div className="flex h-full flex-col">
                <div className="bg-gradient-to-r from-[#002147] to-[#003366] px-3 pb-3 pt-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold leading-none text-white">News</p>
                      <p className="mt-1 text-[8px] text-white/80">
                        Stay updated with the latest from ELIDZ-STP
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-white/90" />
                      <div className="h-5 w-5 rounded-full border border-white/35 bg-gradient-to-br from-[#f4b25f] to-[#2a4f89]" />
                    </div>
                  </div>

                  <div className="flex h-7 items-center rounded-full border border-white/20 bg-white/10 px-2.5">
                    <Search className="h-3 w-3 text-white/70" />
                    <p className="ml-2 text-[8px] text-white/55">Search news...</p>
                  </div>
                </div>

                <div className="flex-1 bg-[#0a1628] p-2">
                  <article className="overflow-hidden rounded-xl border border-[#3a5377] bg-[#112846]">
                    {previewImageUrl ? (
                      <div className="relative h-24 w-full">
                        <Image
                          src={previewImageUrl}
                          alt="News cover preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-[#2d4a70] text-[#d7e1ef]">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}

                    <div className="space-y-1.5 p-2.5">
                      <p className="text-right text-[8px] text-[#b8c6dc]">{previewDateLabel}</p>
                      <h3 className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">
                        {form.title.trim() || "Your headline will appear here"}
                      </h3>
                      <p className="line-clamp-2 text-[9px] leading-relaxed text-[#c3d0e3]">{excerpt}</p>
                    </div>
                  </article>
                </div>

                <div className="grid grid-cols-5 border-t border-[#31496c] bg-[#081326] px-1.5 py-1.5">
                  <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                    <Home className="h-3.5 w-3.5" />
                    <span className="text-[7px]">Home</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                    <Grid2x2 className="h-3.5 w-3.5" />
                    <span className="text-[7px]">Services</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-[#f38c1e]">
                    <Newspaper className="h-3.5 w-3.5" />
                    <span className="text-[7px]">News</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="text-[7px]">SMME&apos;s</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 text-[#9aa8bc]">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-[7px]">Messages</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </form>
  )
}

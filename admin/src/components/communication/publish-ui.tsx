"use client"

import Image from "next/image"
import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Grid2x2,
  Home,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  Newspaper,
  Search,
  Shield,
  Trash2,
  Upload,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import {
  FloatingLabelInput,
  FloatingLabelTextarea,
  FloatingLabelSelect,
  SelectItem,
} from "@/components/floating-input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PublishedEventItem } from "@/lib/events"
import {
  createNewsPublisherInitialForm,
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_MAX_BYTES,
  type NewsAuthor,
  type PublishedNewsItem,
} from "@/lib/news"

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

function PublishedItemsListCard<T>({
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
    <Card className="rounded-3xl border-0 bg-white/90 text-slate-900 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:text-slate-100 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg text-slate-900 dark:text-slate-100">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCurrentPage(1)
            }}
            placeholder={filterPlaceholder}
            className="h-11 w-full rounded-2xl border border-orange-200/60 bg-white/80 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-orange-500/25 dark:border-orange-800/40 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200/70 bg-orange-50/40 p-6 text-sm text-muted-foreground dark:border-orange-800/40 dark:bg-slate-800/40">
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
              variant="outline"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-3xl border-orange-200/60 px-4 dark:border-orange-800/40"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <p className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="rounded-3xl border-orange-200/60 px-4 dark:border-orange-800/40"
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
    const imageUrl = String(formData.get("image_url") ?? "").trim() || null
    console.log("Form data image_url:", formData.get("image_url"))
    console.log("Processed imageUrl:", imageUrl)
    console.log("Form imageUrl state:", form.imageUrl)
    console.log("Selected image file:", selectedImageFile)
    
    // Create FormData for API call
    const apiFormData = new FormData()
    apiFormData.append("title", String(formData.get("title") ?? ""))
    apiFormData.append("content", String(formData.get("content") ?? ""))
    apiFormData.append("excerpt", String(formData.get("excerpt") ?? ""))
    apiFormData.append("target_audience", String(formData.get("target_audience") ?? "all"))
    apiFormData.append("published_at", String(formData.get("published_at") ?? ""))
    apiFormData.append("createdBy", "admin")
    
    // Add image file if uploaded, otherwise add image URL
    if (selectedImageFile && imageSource === "upload") {
      apiFormData.append("image_file", selectedImageFile)
      console.log("Using uploaded file:", selectedImageFile.name)
    } else if (imageUrl) {
      apiFormData.append("featuredImage", imageUrl)
      console.log("Using image URL:", imageUrl)
    }

    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        body: apiFormData // Send FormData instead of JSON
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to publish news")
        setLoading(false)
        return
      }

      if (result.duplicate) {
        toast.error("This news was already published recently. Please wait a few minutes before publishing again.")
      } else {
        toast.success(`News published to ${result.notificationsCreated || 0} users!`)
      }

      setForm(createNewsPublisherInitialForm())
      setImageSource("url")
      setSelectedImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      router.refresh()
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
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
            <input type="hidden" name="target_audience" value={form.targetAudience} />
            <FloatingLabelSelect
              label="Target Audience"
              placeholder="Select audience"
              className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
              value={form.targetAudience}
              onValueChange={(value) => setForm((current) => ({ ...current, targetAudience: value }))}
            >
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="tenants">Tenants</SelectItem>
              <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="smmes">SMMES</SelectItem>
              <SelectItem value="staff">Staff Only</SelectItem>
            </FloatingLabelSelect>

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

function createEventPublisherInitialForm() {
  return {
    title: "",
    date: "",
    location: "",
    description: "",
    targetAudience: "all",
  }
}

export function EventPublisher() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(createEventPublisherInitialForm)

  const previewDateLabel = useMemo(() => {
    if (!form.date) return "Event date"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "Event date"
    return value.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }, [form.date])

  const previewMonthSection = useMemo(() => {
    if (!form.date) return "Upcoming Events"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "Upcoming Events"
    return value.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    })
  }, [form.date])

  const previewMonthShort = useMemo(() => {
    if (!form.date) return "MON"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "MON"
    return value
      .toLocaleDateString(undefined, { month: "short" })
      .toUpperCase()
      .slice(0, 3)
  }, [form.date])

  const previewDay = useMemo(() => {
    if (!form.date) return "15"
    const value = new Date(form.date)
    if (Number.isNaN(value.getTime())) return "15"
    return String(value.getDate())
  }, [form.date])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const eventData = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      startDate: String(formData.get("date") ?? ""),
      endDate: String(formData.get("date") ?? ""), // Same as start date for now
      location: String(formData.get("location") ?? ""),
      type: "general", // Default event type
      targetAudience: String(formData.get("target_audience") ?? "all"),
      maxParticipants: null, // Optional field
      createdBy: "admin" // You might want to get this from auth context
    }

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to publish event")
        setLoading(false)
        return
      }

      if (result.duplicate) {
        toast.error("This event was already published recently. Please wait a few minutes before publishing again.")
      } else {
        toast.success(`Event published to ${result.notificationsCreated || 0} users!`)
      }

      setForm(createEventPublisherInitialForm())
      router.refresh()
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
            <CardDescription>
              Publish an event directly to the app&apos;s ELIDZ-STP events tab.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FloatingLabelInput
                id="title"
                name="title"
                label="Event Title"
                placeholder="e.g. ELIDZ Innovation Demo Day"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                required
              />

              <div className="space-y-1.5">
                <label htmlFor="date" className="px-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Event Date & Time
                </label>
                <Input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <FloatingLabelInput
              id="location"
              name="location"
              label="Location"
              placeholder="ELIDZ Innovation Centre, East London"
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
              className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
            />

            <input type="hidden" name="target_audience" value={form.targetAudience} />
            <FloatingLabelSelect
              label="Target Audience"
              placeholder="Select audience"
              className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
              value={form.targetAudience}
              onValueChange={(value) => setForm((current) => ({ ...current, targetAudience: value }))}
            >
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="tenants">Tenants</SelectItem>
              <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="smmes">SMMES</SelectItem>
              <SelectItem value="staff">Staff Only</SelectItem>
            </FloatingLabelSelect>

            <FloatingLabelTextarea
              id="description"
              name="description"
              label="Description"
              placeholder="Describe what this event is about..."
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-[220px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
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
              {loading ? "Publishing..." : "Publish Event"}
            </Button>
          </div>

          <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
            <CardHeader>
              <CardTitle>Mobile Preview</CardTitle>
              <CardDescription>
                This gives you a quick sense of how the event will read in the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6">
              <div className="mx-auto h-[390px] w-[220px] overflow-hidden rounded-[2rem] border border-[#1f3557] bg-[#0a1628] shadow-[0_24px_50px_rgba(2,8,24,0.55)]">
                <div className="flex h-full flex-col">
                  <div className="bg-gradient-to-r from-[#002147] to-[#003366] px-3 pb-3 pt-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-bold leading-none text-white">Events</p>
                        <p className="mt-1 text-[8px] text-white/80">
                          Discover upcoming ELIDZ-STP events
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bell className="h-3.5 w-3.5 text-white/90" />
                        <div className="h-5 w-5 rounded-full border border-white/35 bg-gradient-to-br from-[#f4b25f] to-[#2a4f89]" />
                      </div>
                    </div>

                    <div className="flex h-7 items-center rounded-full border border-white/20 bg-white/10 px-2.5">
                      <Search className="h-3 w-3 text-white/70" />
                      <p className="ml-2 text-[8px] text-white/55">Search events...</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 overflow-hidden bg-[#0a1628] p-2">
                    <p className="text-[11px] font-semibold text-white">{previewMonthSection}</p>

                    <article className="rounded-xl border border-[#3a5377] bg-[#112846] p-2.5">
                      <div className="flex gap-2.5">
                        <div className="flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#002147] text-white">
                          <span className="text-[7px] font-semibold">{previewMonthShort}</span>
                          <span className="text-[15px] font-bold leading-none">{previewDay}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white">
                            {form.title.trim() || "Your event title will appear here"}
                          </p>
                          <p className="mt-1 text-[8px] font-semibold text-[#f4b25f]">{previewDateLabel}</p>
                          <p className="mt-1.5 line-clamp-1 text-[8px] text-[#c3d0e3]">
                            {form.location.trim() || "ELIDZ STP, East London"}
                          </p>
                        </div>
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
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="text-[7px]">Events</span>
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

export function PublishedNewsList({ items }: { items: PublishedNewsItem[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    // Delete functionality not implemented yet - would need DELETE API routes
    toast.error("Delete functionality not available in this version.")
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
            className="group flex h-full flex-col overflow-hidden rounded-3xl border-0 bg-white/90 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.22)] dark:bg-slate-900/75"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="line-clamp-3 text-xl font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {item.title || "Untitled article"}
              </h3>
              <Badge className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                Published
              </Badge>
            </div>

            {authorName ? <p className="mb-3 text-sm text-muted-foreground">{authorName}</p> : null}

            <p className="line-clamp-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {item.content || "No content available."}
            </p>

            <div className="mt-auto pt-4">
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
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
                  className="h-8 w-8 rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
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

function toEventDate(value: string | null) {
  if (!value) return "Not scheduled"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not scheduled"
  return parsed.toLocaleString()
}

export function PublishedEventsList({ items }: { items: PublishedEventItem[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    // Delete functionality not implemented yet - would need DELETE API routes
    toast.error("Delete functionality not available in this version.")
    setDeletingId(null)
  }

  return (
    <PublishedItemsListCard
      title="Published Events & RSVPs"
      description="Track what is live in the app and who has RSVP&apos;d."
      filterPlaceholder="Filter events..."
      emptyText="No events found."
      items={items}
      matchesQuery={(item, query) => {
        const title = (item.title ?? "").toLowerCase()
        const description = (item.description ?? "").toLowerCase()
        const location = (item.location ?? "").toLowerCase()
        return (
          title.includes(query) ||
          description.includes(query) ||
          location.includes(query)
        )
      }}
      renderItem={(item) => (
        <article
          key={item.id}
          className="group flex h-full flex-col overflow-hidden rounded-3xl border-0 bg-white/90 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(249,115,22,0.22)] dark:bg-slate-900/75"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-slate-900 dark:text-slate-100">
              {item.title || "Untitled event"}
            </h3>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
              aria-label="Delete event"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {toEventDate(item.date)}
            </p>
            {item.location ? (
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {item.location}
              </p>
            ) : null}
          </div>

          {item.description ? (
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          ) : null}

          <div className="mt-5 rounded-2xl border border-orange-200/50 bg-orange-50/50 p-3 dark:border-orange-800/35 dark:bg-slate-800/50">
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-orange-800 dark:text-orange-200">
              <Users className="h-4 w-4" />
              RSVP&apos;d ({item.rsvps.length})
            </p>

            {item.rsvps.length === 0 ? (
              <p className="text-xs text-muted-foreground">No RSVPs yet.</p>
            ) : (
              <div className="space-y-2">
                {item.rsvps.map((person) => (
                  <div
                    key={`${item.id}-${person.id}`}
                    className="rounded-xl border border-orange-100/90 bg-white/90 px-3 py-2 dark:border-slate-600 dark:bg-slate-900/60"
                  >
                    <p className="text-sm text-slate-900 dark:text-slate-100">{person.name || "Unnamed attendee"}</p>
                    <p className="text-xs text-muted-foreground">{person.email || "No email"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      )}
    />
  )
}

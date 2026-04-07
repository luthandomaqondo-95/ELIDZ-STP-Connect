"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  Play,
  Upload,
  Video,
  X,
} from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { useVisitTracker } from "@/hooks/use-visit-tracker"
import { Button } from "@/components/ui/button"

// ── Types ─────────────────────────────────────────────────────────────────────

type FacilityMeta = {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

type Scene = {
  id: string
  title: string
  section_description: string
  details: string[]
  /** 360° equirectangular video URL */
  video_url: string | null
  /** 360° equirectangular image URL (also used as VR panorama fallback in mobile) */
  thumbnail_url: string | null
  is_initial: boolean
  display_order: number
}

type UploadState = { sceneId: string; type: "video" | "image" } | null

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a usable src for thumbnail_url. Full URLs are used directly; bare
 *  filenames fall back to the static /assets/360-tours/ folder. */
function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `/assets/360-tours/${url}`
}

function isUploaded360Image(url: string | null | undefined): boolean {
  if (!url?.trim()) return false
  return url.startsWith("http://") || url.startsWith("https://")
}

// ── Component ─────────────────────────────────────────────────────────────────

type CenterFacilityPageProps = { centerServiceName: string }

export default function CenterFacilityPage({ centerServiceName }: CenterFacilityPageProps) {
  const [facility, setFacility] = useState<FacilityMeta | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [previewSceneId, setPreviewSceneId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<UploadState>(null)
  const [uploadSuccess, setUploadSuccess] = useState<UploadState>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pendingUpload = useRef<UploadState>(null)

  const { trackFacilityVisit } = useVisitTracker()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // ── Data loading ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const base = centerServiceName.trim()
        const candidates = new Set<string>([base])
        if (base.toLowerCase() === "analytics laboratory") candidates.add("Analytical Laboratory")
        if (base.toLowerCase() === "renewable energy center") candidates.add("Renewable Energy Centre")

        const orClause = Array.from(candidates)
          .map((n) => `service_name.ilike.%${n.replaceAll("%", "\\%")}%`)
          .join(",")

        const { data: rows } = await supabase
          .from("facilities")
          .select(
            "id, service_id, service_name, service_description, service_color, service_icon, title, section_description, details, video_url, thumbnail_url, is_initial, display_order"
          )
          .or(orClause)
          .order("display_order", { ascending: true })

        if (rows && rows.length > 0) {
          const first = rows[0]
          const meta: FacilityMeta = {
            id: first.service_id,
            name: first.service_name,
            description: first.service_description,
            color: first.service_color,
            icon: first.service_icon,
          }
          setFacility(meta)
          trackFacilityVisit(meta.id)

          const sceneList: Scene[] = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            section_description: r.section_description || "",
            details: Array.isArray(r.details) ? r.details : [],
            video_url: r.video_url || null,
            thumbnail_url: r.thumbnail_url || null,
            is_initial: r.is_initial,
            display_order: r.display_order,
          }))
          setScenes(sceneList)

          const initial = sceneList.find((s) => s.is_initial) ?? sceneList[0]
          setPreviewSceneId(initial?.id ?? null)
        } else {
          setFacility(null)
          setScenes([])
        }
      } catch (err) {
        console.error("Error fetching center data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerServiceName])

  // ── Upload helpers ──────────────────────────────────────────────────────────

  const triggerUpload = (sceneId: string, type: "video" | "image") => {
    pendingUpload.current = { sceneId, type }
    if (type === "video") videoInputRef.current?.click()
    else imageInputRef.current?.click()
  }

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "image"
  ) => {
    const file = e.target.files?.[0]
    const pending = pendingUpload.current
    if (!file || !pending || pending.type !== type) return

    e.target.value = ""
    const { sceneId } = pending

    setUploading({ sceneId, type })
    setUploadSuccess(null)
    setUploadError(null)

    try {
      const prefix = type === "video" ? "video" : "image"
      const fileName = `${sceneId}/${prefix}-${Date.now()}-${file.name}`
      const bucket = "videos" // single bucket for all facility media

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (uploadErr) {
        setUploadError(`Upload failed: ${uploadErr.message}`)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName)

      const dbField = type === "video" ? "video_url" : "thumbnail_url"
      const { error: updateErr } = await supabase
        .from("facilities")
        .update({ [dbField]: publicUrl })
        .eq("id", sceneId)

      if (updateErr) {
        setUploadError(`Failed to save URL: ${updateErr.message}`)
        return
      }

      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, [dbField]: publicUrl } : s
        )
      )
      setUploadSuccess({ sceneId, type })
      setPreviewSceneId(sceneId)
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (err) {
      setUploadError("An unexpected error occurred.")
      console.error(err)
    } finally {
      setUploading(null)
      pendingUpload.current = null
    }
  }

  const removeMedia = async (sceneId: string, type: "video" | "image") => {
    const dbField = type === "video" ? "video_url" : "thumbnail_url"
    const { error } = await supabase
      .from("facilities")
      .update({ [dbField]: null })
      .eq("id", sceneId)
    if (!error) {
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, [dbField]: null } : s))
      )
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const previewScene = scenes.find((s) => s.id === previewSceneId) ?? scenes[0] ?? null
  const hasSubFacilities = scenes.length > 1
  const videoCount = scenes.filter((s) => s.video_url).length
  const imageCount = scenes.filter((s) => isUploaded360Image(s.thumbnail_url)).length
  const isUploading = (sceneId: string, type: "video" | "image") =>
    uploading?.sceneId === sceneId && uploading?.type === type
  const wasSuccess = (sceneId: string, type: "video" | "image") =>
    uploadSuccess?.sceneId === sceneId && uploadSuccess?.type === type

  // ── Loading / not-found ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Center not found</h2>
        <p className="text-muted-foreground">The requested center could not be loaded.</p>
      </div>
    )
  }

  // ── Preview media ───────────────────────────────────────────────────────────

  const previewImageSrc = resolveImageUrl(previewScene?.thumbnail_url)

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "video")}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "image")}
      />

      <DashboardPageHeader
        title={facility.name}
        backHref="/dashboard"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <Video className="h-3.5 w-3.5" />
              {videoCount} / {scenes.length} videos
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
              {imageCount} / {scenes.length} images
            </Badge>
          </div>
        }
      />

      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          <X className="h-4 w-4 shrink-0" />
          {uploadError}
          <button
            className="ml-auto text-red-600 hover:text-red-800"
            onClick={() => setUploadError(null)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Manage 360° videos and equirectangular images for each sub-facility. Both are streamed
        directly in the mobile app's VR tour viewer.
      </p>

      <Tabs
        defaultValue={
          searchParams.get("tab") === "facilities" && hasSubFacilities
            ? "facilities"
            : hasSubFacilities
            ? "facilities"
            : "overview"
        }
        className="space-y-4"
      >
        <div className="flex justify-center overflow-x-auto">
          <TabsList className="h-11 rounded-3xl border-0 bg-white/90 p-1 shadow-sm dark:bg-slate-900/70 whitespace-nowrap">
            <TabsTrigger value="overview" className="rounded-3xl px-5">Overview</TabsTrigger>
            {hasSubFacilities && (
              <TabsTrigger value="facilities" className="rounded-3xl px-5">Sub-facilities</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
            <CardHeader className="pb-3">
              <CardTitle>About {facility.name}</CardTitle>
              <CardDescription className="text-sm">{facility.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-orange-100/70 p-4 dark:bg-slate-800/60">
                  <h4 className="text-sm font-semibold mb-1">Sub-facilities</h4>
                  <p className="text-sm text-muted-foreground">{scenes.length} areas</p>
                </div>
                <div className="rounded-3xl bg-orange-100/70 p-4 dark:bg-slate-800/60">
                  <h4 className="text-sm font-semibold mb-1">360° Videos</h4>
                  <p className="text-sm text-muted-foreground">{videoCount} uploaded</p>
                </div>
                <div className="rounded-3xl bg-orange-100/70 p-4 dark:bg-slate-800/60">
                  <h4 className="text-sm font-semibold mb-1">360° Images</h4>
                  <p className="text-sm text-muted-foreground">{imageCount} uploaded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview panel */}
          {previewScene && (
            <Card className="overflow-hidden rounded-3xl border-0 bg-black shadow-[0_10px_30px_rgba(2,6,23,0.12)]">
              <div className="relative aspect-video w-full bg-black">
                {previewScene.video_url ? (
                  <video
                    key={previewScene.video_url}
                    src={previewScene.video_url}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : previewImageSrc ? (
                  <Image
                    src={previewImageSrc}
                    alt={previewScene.title}
                    fill
                    className="object-cover opacity-90"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-zinc-500">No media uploaded yet</p>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-xl font-bold text-white mb-0.5">{previewScene.title}</h3>
                  <p className="text-sm text-zinc-300">
                    {previewScene.video_url
                      ? "360° Video"
                      : previewImageSrc
                      ? "Equirectangular Image"
                      : "No media"}
                  </p>

                  {scenes.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {scenes.map((scene) => (
                        <button
                          key={scene.id}
                          onClick={() => setPreviewSceneId(scene.id)}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            previewSceneId === scene.id
                              ? "bg-white text-black"
                              : "bg-black/50 text-white hover:bg-black/70"
                          }`}
                        >
                          {scene.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Upload controls — shown inline in Overview for single-room facilities */}
          {!hasSubFacilities && previewScene && (
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">360° Media</CardTitle>
                <CardDescription className="text-xs">
                  Upload a <strong>360° video</strong> (MP4 equirectangular) and/or a{" "}
                  <strong>360° image</strong> (equirectangular JPEG/PNG) for the mobile VR tour.
                  Videos take priority; images are used as the panoramic fallback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* 360° Video */}
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Video className="h-3 w-3" /> 360° Video
                    </p>
                    {previewScene.video_url ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                        <video
                          src={previewScene.video_url}
                          className="h-full w-full object-cover opacity-70"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white/80" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                        <Video className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={previewScene.video_url ? "outline" : "default"}
                        className="flex-1 rounded-full"
                        disabled={isUploading(previewScene.id, "video")}
                        onClick={() => triggerUpload(previewScene.id, "video")}
                      >
                        {isUploading(previewScene.id, "video") ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />{previewScene.video_url ? "Replace Video" : "Upload Video"}</>
                        )}
                      </Button>
                      {previewScene.video_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full px-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          onClick={() => removeMedia(previewScene.id, "video")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {wasSuccess(previewScene.id, "video") && (
                      <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Video uploaded successfully
                      </p>
                    )}
                  </div>

                  {/* 360° Image */}
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <ImageIcon className="h-3 w-3" /> 360° Image
                    </p>
                    {previewImageSrc ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={previewImageSrc}
                          alt={previewScene.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isUploaded360Image(previewScene.thumbnail_url) ? "outline" : "default"}
                        className="flex-1 rounded-full"
                        disabled={isUploading(previewScene.id, "image")}
                        onClick={() => triggerUpload(previewScene.id, "image")}
                      >
                        {isUploading(previewScene.id, "image") ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload className="h-4 w-4 mr-2" />{isUploaded360Image(previewScene.thumbnail_url) ? "Replace Image" : "Upload Image"}</>
                        )}
                      </Button>
                      {isUploaded360Image(previewScene.thumbnail_url) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full px-3 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          onClick={() => removeMedia(previewScene.id, "image")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {wasSuccess(previewScene.id, "image") && (
                      <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Image uploaded successfully
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Sub-facilities ── */}
        <TabsContent value="facilities" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each sub-facility supports a <strong>360° video</strong> (MP4 equirectangular) and/or a{" "}
            <strong>360° image</strong> (equirectangular JPEG/PNG). Videos take priority in the
            mobile VR viewer; images are used as the panoramic fallback.
          </p>

          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {scenes.map((scene) => {
              const imgSrc = resolveImageUrl(scene.thumbnail_url)
              const hasUploadedImage = isUploaded360Image(scene.thumbnail_url)

              return (
                <Card
                  key={scene.id}
                  onClick={() => setPreviewSceneId(scene.id)}
                  className={`flex flex-col rounded-3xl border-0 cursor-pointer transition-all ${
                    previewSceneId === scene.id
                      ? "ring-2 ring-orange-400 shadow-[0_0_0_2px_rgba(251,146,60,0.3)]"
                      : "hover:shadow-[0_12px_32px_rgba(2,6,23,0.12)]"
                  } bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-[15px] leading-tight">{scene.title}</CardTitle>
                      <div
                        className="flex shrink-0 flex-wrap justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {scene.is_initial && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Default
                          </Badge>
                        )}
                        {scene.video_url && (
                          <Badge className="gap-0.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] px-1.5 py-0">
                            <Video className="h-2.5 w-2.5" />
                            Video
                          </Badge>
                        )}
                        {hasUploadedImage && (
                          <Badge className="gap-0.5 bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300 text-[10px] px-1.5 py-0">
                            <ImageIcon className="h-2.5 w-2.5" />
                            Image
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 gap-3 pt-0">
                    {scene.section_description && (
                      <p className="text-sm leading-snug text-muted-foreground">
                        {scene.section_description}
                      </p>
                    )}
                    {scene.details.length > 0 && (
                      <ul className="list-disc space-y-0.5 pl-4 text-sm text-muted-foreground">
                        {scene.details.map((d, i) => (
                          <li key={i} className="leading-snug">{d}</li>
                        ))}
                      </ul>
                    )}

                    {/* ── Media grid ── */}
                    <div
                      className="mt-1 grid grid-cols-2 gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 360° Video slot */}
                      <div className="flex flex-col gap-1.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <Video className="h-3 w-3" /> 360° Video
                        </p>
                        {scene.video_url ? (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <video
                              src={scene.video_url}
                              className="h-full w-full object-cover opacity-70"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-6 w-6 text-white/80" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                            <Video className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={scene.video_url ? "outline" : "default"}
                            className="h-7 flex-1 rounded-full px-2 text-xs"
                            disabled={isUploading(scene.id, "video")}
                            onClick={() => triggerUpload(scene.id, "video")}
                          >
                            {isUploading(scene.id, "video") ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                {scene.video_url ? "Replace" : "Upload"}
                              </>
                            )}
                          </Button>
                          {scene.video_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              onClick={() => removeMedia(scene.id, "video")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {wasSuccess(scene.id, "video") && (
                          <p className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Uploaded
                          </p>
                        )}
                      </div>

                      {/* 360° Image slot */}
                      <div className="flex flex-col gap-1.5">
                        <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <ImageIcon className="h-3 w-3" /> 360° Image
                        </p>
                        {imgSrc ? (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={imgSrc}
                              alt={scene.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={hasUploadedImage ? "outline" : "default"}
                            className="h-7 flex-1 rounded-full px-2 text-xs"
                            disabled={isUploading(scene.id, "image")}
                            onClick={() => triggerUpload(scene.id, "image")}
                          >
                            {isUploading(scene.id, "image") ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Upload className="h-3 w-3 mr-1" />
                                {hasUploadedImage ? "Replace" : "Upload"}
                              </>
                            )}
                          </Button>
                          {hasUploadedImage && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                              onClick={() => removeMedia(scene.id, "image")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {wasSuccess(scene.id, "image") && (
                          <p className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Uploaded
                          </p>
                        )}
                      </div>
                    </div>
                    {/* end media grid */}
                  </CardContent>
                </Card>
              )
            })}

            {scenes.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No sub-facilities listed for this center yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

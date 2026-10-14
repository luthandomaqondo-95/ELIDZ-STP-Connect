"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { BarChart3, Building2, Car, Cpu, Loader2, PenTool, Zap, type LucideIcon } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { UploadButton } from "@/components/upload-button"
import { cn } from "@/lib/utils"

type Facility = {
  id: string
  name: string
  description: string
  location: string
  type: string
  color: string
  icon: string
  image_url: string
}

type CenterFacilityPageProps = {
  centerServiceName: string
}

const CENTER_ICONS: [RegExp, LucideIcon][] = [
  [/design/i, PenTool],
  [/digital/i, Cpu],
  [/renewable|energy/i, Zap],
  [/automotive|manufactur/i, Car],
  [/analytic/i, BarChart3],
]

export const TOGGLE_LIST_CLASS =
  "h-11 whitespace-nowrap rounded-3xl border-0 bg-white/90 p-1 shadow-[0_14px_30px_-8px_rgba(0,0,0,0.55),0_4px_10px_rgba(0,0,0,0.22)] dark:bg-slate-900/80 dark:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.95),0_4px_12px_rgba(0,0,0,0.65)]"
export const TOGGLE_TRIGGER_CLASS =
  "rounded-3xl px-5 transition-[color,background-color,box-shadow] duration-200 data-[state=active]:bg-white data-[state=active]:shadow-[0_6px_14px_-3px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.2)] dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-slate-700/80 dark:data-[state=active]:shadow-[0_6px_16px_-3px_rgba(0,0,0,0.95),0_2px_5px_rgba(0,0,0,0.7)]"

function centerIcon(name: string): LucideIcon {
  return CENTER_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? Building2
}

export default function CenterFacilityPage({
  centerServiceName,
}: CenterFacilityPageProps) {
  const [facility, setFacility] = useState<Facility | null>(null)
  const [vrScenes, setVrScenes] = useState<any[]>([])
  const [vrSections, setVrSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeScene, setActiveScene] = useState<any | null>(null)
  const [uploading, setUploading] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  const supabase = createClient()

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !facility) return

    setUploading(true)
    const file = files[0]
    
    try {
      // Upload to Supabase storage bucket 'videos'
      const fileName = `${facility.id}/${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      // Update database with video URL
      const { error: updateError } = await supabase
        .from('facilities')
        .update({ video_url: publicUrl })
        .eq('service_id', facility.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        return
      }

      console.log('Video uploaded successfully:', publicUrl)
      
      // Refresh videos list
      const { data: refreshedVideoData } = await supabase
        .from("facilities")
        .select("id, video_url, title")
        .eq("service_id", facility.id)
        .not("video_url", "is", null)
        .order("updated_at", { ascending: false })
      
      setVideos(refreshedVideoData || [])
      
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const base = centerServiceName.trim()
        const candidates = new Set<string>([base])

        // Common naming variants we’ve seen in the DB.
        if (base.toLowerCase() === "analytics laboratory") {
          candidates.add("Analytical Laboratory")
        }
        if (base.toLowerCase() === "renewable energy center") {
          candidates.add("Renewable Energy Centre")
        }

        const orClause = Array.from(candidates)
          .map((name) => `service_name.ilike.%${name.replaceAll("%", "\\%")}%`)
          .join(",")

        const { data: rows } = await supabase
          .from("facilities")
          .select("*")
          // Use wildcard matching and aliases so minor DB differences still load the center UI.
          .or(orClause)
          .order("display_order", { ascending: true })

        if (rows && rows.length > 0) {
          const first = rows[0]

          setFacility({
            id: first.service_id,
            name: first.service_name,
            description: first.service_description,
            location: first.service_name,
            type: "Facility",
            color: first.service_color,
            icon: first.service_icon,
            image_url: first.service_image_url,
          })

          setVrScenes(
            rows.map((r: any) => ({
              id: r.id,
              title: r.title,
              image_url: r.thumbnail_url,
              is_initial_scene: r.is_initial,
            }))
          )

          const initial = rows.find((s: any) => s.is_initial) || rows[0]

          setActiveScene({
            id: initial.id,
            title: initial.title,
            image_url: initial.thumbnail_url,
            is_initial_scene: initial.is_initial,
          })

          setVrSections(
            rows.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.section_description || "",
              details: Array.isArray(r.details) ? r.details : [],
            }))
          )

          // Fetch videos for this facility
          const { data: videoData } = await supabase
            .from("facilities")
            .select("id, video_url, title")
            .eq("service_id", first.service_id)
            .not("video_url", "is", null)
            .order("updated_at", { ascending: false })

          setVideos(videoData || [])
        } else {
          setFacility(null)
          setVrScenes([])
          setVrSections([])
          setActiveScene(null)
        }
      } catch (error) {
        console.error("Error fetching center data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [centerServiceName, supabase])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4 sm:p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center sm:p-8">
        <h2 className="text-2xl font-bold">Center not found</h2>
        <p className="text-muted-foreground">
          The requested center could not be loaded.
        </p>
      </div>
    )
  }

  const CenterIcon = centerIcon(centerServiceName)

  return (
    <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
      <DashboardPageHeader
        title={facility.name}
        icon={<CenterIcon className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <UploadButton 
              onFileSelect={handleVideoUpload}
              isLoading={uploading}
              variant="blue"
            >
              Upload Video
            </UploadButton>
          </div>
        }
      />

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Explore the {facility.name} virtual tour, featured sections, and key
        facility information in one place.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-3 sm:gap-4">
        <div className="flex justify-center">
          <TabsList className={TOGGLE_LIST_CLASS}>
            <TabsTrigger value="overview" className={TOGGLE_TRIGGER_CLASS}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className={TOGGLE_TRIGGER_CLASS}>
              Services & Features
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="order-2 space-y-3 sm:space-y-4">
          <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
            <CardHeader className="pb-3">
              <CardTitle>About {facility.name}</CardTitle>
              <CardDescription className="text-sm">
                {facility.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-orange-100/70 p-3 sm:p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-slate-800/60 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]">
                  <h4 className="text-sm font-semibold mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">
                    {facility.location}
                  </p>
                </div>
                <div className="rounded-3xl bg-orange-100/70 p-3 sm:p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-slate-800/60 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]">
                  <h4 className="text-sm font-semibold mb-2">
                    Facility Type
                  </h4>
                  <p className="text-sm text-muted-foreground">{facility.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="order-2 space-y-3 sm:space-y-4">
          <div className="grid items-stretch gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vrSections.map((section) => (
              <Card
                key={section.id}
                className="h-full rounded-3xl sm:min-h-[220px] border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"
              >
                <CardHeader className="pb-1">
                  <CardTitle className="text-[15px] leading-tight">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="mb-2 text-sm leading-snug text-muted-foreground">
                    {section.description}
                  </p>
                  {section.details && Array.isArray(section.details) && (
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {section.details.map((detail: string, idx: number) => (
                        <li key={idx} className="leading-snug">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}

            {vrSections.length === 0 && (
              <div className="col-span-full py-6 text-center text-muted-foreground sm:py-8">
                No specific services listed for this center yet.
              </div>
            )}
          </div>
        </TabsContent>

      {(activeScene || videos.length > 0) && (
        <Card
          className={cn(
            "order-3 gap-0 overflow-hidden rounded-3xl border-0 py-0 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]",
            activeTab === "overview" && "order-1"
          )}
        >
          <div className="relative aspect-video w-full bg-black">
            {/* Check if we have videos for this facility */}
            {videos.length > 0 ? (
              <video
                src={videos[0].video_url}
                controls
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={`/assets/360-tours/${activeScene.image_url}`}
                alt={activeScene.title}
                fill
                className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
              <h3 className="mb-1 text-lg font-bold text-white sm:text-xl">
                {videos.length > 0 ? videos[0].title : activeScene.title}
              </h3>
              <p className="text-sm text-zinc-300">
                {videos.length > 0 ? "Video View" : "Interactive 360° View"}
              </p>

              {/* Scene/Video switcher */}
              {(vrScenes.length > 1 || videos.length > 0) && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:pb-2">
                  {/* Show VR scenes if no videos or mixed */}
                  {vrScenes.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium shadow-[0_4px_12px_rgba(0,0,0,0.55)] transition-colors ${
                        activeScene?.id === scene.id && videos.length === 0
                          ? 'bg-white text-black' 
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      {scene.title}
                    </button>
                  ))}
                  {/* Show videos if available */}
                  {videos.map((video, idx) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        // Switch to video view
                        setActiveScene(null)
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium shadow-[0_4px_12px_rgba(0,0,0,0.55)] transition-colors ${
                        videos.length > 0 && !activeScene
                          ? 'bg-white text-black' 
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      {video.title || `Video ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      </Tabs>
    </div>
  )
}


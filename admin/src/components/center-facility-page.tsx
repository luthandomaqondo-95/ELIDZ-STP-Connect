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
import { Loader2 } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"

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

export default function CenterFacilityPage({
  centerServiceName,
}: CenterFacilityPageProps) {
  const [facility, setFacility] = useState<Facility | null>(null)
  const [vrScenes, setVrScenes] = useState<any[]>([])
  const [vrSections, setVrSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeScene, setActiveScene] = useState<any | null>(null)

  const supabase = createClient()

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
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">Center not found</h2>
        <p className="text-muted-foreground">
          The requested center could not be loaded.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title={facility.name}
        backHref="/dashboard"
        action={<AnimatedDashboardButton label="Manage Facility" />}
      />

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Explore the {facility.name} virtual tour, featured sections, and key
        facility information in one place.
      </p>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-center overflow-x-auto">
          <TabsList className="h-11 rounded-3xl border-0 bg-white/90 p-1 shadow-sm dark:bg-slate-900/70 whitespace-nowrap">
            <TabsTrigger value="overview" className="rounded-3xl px-5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-3xl px-5">
              Services & Features
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
            <CardHeader className="pb-3">
              <CardTitle>About {facility.name}</CardTitle>
              <CardDescription className="text-sm">
                {facility.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-orange-100/70 p-4 dark:bg-slate-800/60">
                  <h4 className="text-sm font-semibold mb-2">Location</h4>
                  <p className="text-sm text-muted-foreground">
                    {facility.location}
                  </p>
                </div>
                <div className="rounded-3xl bg-orange-100/70 p-4 dark:bg-slate-800/60">
                  <h4 className="text-sm font-semibold mb-2">
                    Facility Type
                  </h4>
                  <p className="text-sm text-muted-foreground">{facility.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vrSections.map((section) => (
              <Card
                key={section.id}
                className="h-full min-h-[220px] rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
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
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No specific services listed for this center yet.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Panoramic View Section */}
      {activeScene && (
        <Card className="overflow-hidden border-zinc-800">
          <div className="relative aspect-video w-full bg-black">
            <Image
              src={`/assets/360-tours/${activeScene.image_url}`}
              alt={activeScene.title}
              fill
              className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-xl font-bold text-white mb-1">
                {activeScene.title}
              </h3>
              <p className="text-sm text-zinc-300">Interactive 360° View</p>

              {/* Scene switcher if multiple scenes exist */}
              {vrScenes.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {vrScenes.map((scene) => (
                    <button
                      key={scene.id}
                      onClick={() => setActiveScene(scene)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeScene.id === scene.id
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
    </div>
  )
}


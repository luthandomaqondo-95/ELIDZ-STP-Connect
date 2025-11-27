"use client"

import { Button } from "@/components/ui/button"
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
import { useParams } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function FacilityPage() {
    const params = useParams()
    const [facility, setFacility] = useState<any>(null)
    const [vrScenes, setVrScenes] = useState<any[]>([])
    const [vrSections, setVrSections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeScene, setActiveScene] = useState<any>(null)
    const supabase = createClient()
    const id = params.id as string

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Fetch facility details
                const { data: facilityData } = await supabase
                    .from('facilities')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (facilityData) {
                    setFacility(facilityData)
                    
                    // Fetch VR scenes
                    const { data: scenes } = await supabase
                        .from('vr_scenes')
                        .select('*')
                        .eq('facility_id', id)
                    
                    if (scenes) {
                        setVrScenes(scenes)
                        const initial = scenes.find((s: any) => s.is_initial_scene) || scenes[0]
                        setActiveScene(initial)
                    }

                    // Fetch VR sections/services
                    const { data: sections } = await supabase
                        .from('vr_sections')
                        .select('*')
                        .eq('facility_id', id)
                        .order('display_order', { ascending: true })
                    
                    if (sections) setVrSections(sections)
                }
            } catch (error) {
                console.error("Error fetching facility data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchData()
    }, [id, supabase])

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
                <h2 className="text-2xl font-bold">Facility not found</h2>
                <p className="text-muted-foreground">The requested facility could not be loaded.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div 
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-lg"
                        style={{ backgroundColor: facility.color || '#3b82f6' }}
                    >
                        {/* Placeholder icon based on facility type - could be improved with dynamic icon map */}
                        <span className="text-lg font-bold">{facility.name.charAt(0)}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">{facility.name}</h1>
                </div>
                <Button>Manage Facility</Button>
            </div>
            
            {/* Panoramic View Section */}
            {activeScene && (
                <Card className="overflow-hidden border-zinc-800">
                    <div className="relative aspect-video w-full bg-black">
                        {/* 
                          In a real implementation, this would use a 360 viewer library like pannellum or react-360.
                          For now, we display the panoramic image directly.
                        */}
                        <Image 
                            src={`/assets/360-tours/${activeScene.image_url}`}
                            alt={activeScene.title}
                            fill
                            className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h3 className="text-xl font-bold text-white mb-1">{activeScene.title}</h3>
                            <p className="text-sm text-zinc-300">Interactive 360° View</p>
                            
                            {/* Scene switcher if multiple scenes exist */}
                            {vrScenes.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {vrScenes.map(scene => (
                                        <button
                                            key={scene.id}
                                            onClick={() => setActiveScene(scene)}
                                            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                activeScene.id === scene.id 
                                                ? 'bg-white text-black' 
                                                : 'bg-black/50 text-white hover:bg-black/70'
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

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="services">Services & Features</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>About {facility.name}</CardTitle>
                            <CardDescription>{facility.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Location</h4>
                                    <p className="text-sm text-muted-foreground">{facility.location}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Facility Type</h4>
                                    <p className="text-sm text-muted-foreground">{facility.type}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="services" className="space-y-4">
                     <div className="grid gap-4 md:grid-cols-2">
                        {vrSections.map((section) => (
                            <Card key={section.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{section.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                                    {section.details && Array.isArray(section.details) && (
                                        <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
                                            {section.details.map((detail: string, idx: number) => (
                                                <li key={idx}>{detail}</li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        {vrSections.length === 0 && (
                            <div className="col-span-full text-center py-8 text-muted-foreground">
                                No specific services listed for this facility yet.
                            </div>
                        )}
                     </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}


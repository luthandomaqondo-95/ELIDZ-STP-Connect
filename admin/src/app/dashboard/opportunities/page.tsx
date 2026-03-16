import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function OpportunitiesPage() {
    const supabase = await createClient()
    const { data: opportunities } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false })

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
                <Button asChild>
                    <Link href="/dashboard/opportunities/create">Post Opportunity</Link>
                </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(opportunities || []).map((opp) => (
                    <Card key={opp.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <Badge variant={opp.status === "active" || opp.status === "Active" ? "default" : "secondary"}>
                                    {opp.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{opp.type}</span>
                            </div>
                            <CardTitle className="mt-2 line-clamp-1">{opp.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {opp.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{opp.location || 'ELIDZ STP'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{0} Applicants</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/dashboard/opportunities/${opp.id}`}>View Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
                {(!opportunities || opportunities.length === 0) && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <p>No opportunities found.</p>
                        <Button variant="link" asChild className="mt-2">
                             <Link href="/dashboard/opportunities/create">Create your first opportunity</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

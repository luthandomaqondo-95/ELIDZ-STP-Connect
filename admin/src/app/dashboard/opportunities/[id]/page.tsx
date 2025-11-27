import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Building2, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function OpportunityPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch opportunity details
    const { data: opportunity, error } = await supabase
        .from('opportunities')
        .select(`
            *,
            tenant:tenants(name, logo_url),
            poster:profiles(name, email)
        `)
        .eq('id', id)
        .single()

    if (error || !opportunity) {
        console.error(error)
        notFound()
    }

    // Fetch applications
    const { data: applications } = await supabase
        .from('applications')
        .select(`
            *,
            applicant:profiles(id, name, email, avatar, role, organization)
        `)
        .eq('opportunity_id', id)
        .order('submitted_at', { ascending: false })

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{opportunity.title}</h1>
                        <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                            {opportunity.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Posted on {new Date(opportunity.created_at).toLocaleDateString()} by {opportunity.poster?.name || 'Unknown'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/opportunities">Back to List</Link>
                    </Button>
                    <Button>Edit Opportunity</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {opportunity.description}
                            </div>
                            
                            {opportunity.requirements && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2">Requirements</h3>
                                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {opportunity.requirements}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Applications List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Applications ({applications?.length || 0})</CardTitle>
                            <CardDescription>Review and manage applicants for this opportunity.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {applications?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">No applications received yet.</p>
                                ) : (
                                    applications?.map((app) => (
                                        <div key={app.id} className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={app.applicant?.avatar} />
                                                    <AvatarFallback>{app.applicant?.name?.charAt(0) || '?'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{app.applicant?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{app.applicant?.email}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Applied: {new Date(app.submitted_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    app.status === 'accepted' ? 'default' : 
                                                    app.status === 'rejected' ? 'destructive' : 
                                                    'outline'
                                                }>
                                                    {app.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" title="View Application">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Sidebar Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Type:</span>
                                <span>{opportunity.type}</span>
                            </div>
                             <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Deadline:</span>
                                <span>{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No deadline'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Location:</span>
                                <span>{opportunity.location || 'ELIDZ STP'}</span>
                            </div>
                            {opportunity.tenant && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Tenant:</span>
                                        <span>{opportunity.tenant.name}</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {opportunity.status === 'active' ? (
                                <Button variant="secondary" className="w-full">Close Opportunity</Button>
                            ) : (
                                <Button className="w-full">Reopen Opportunity</Button>
                            )}
                            <Button variant="destructive" className="w-full">Delete</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}


import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Building2, Clock, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { EditOpportunityDialog } from "./edit-opportunity-dialog"

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
            <DashboardPageHeader
                title={
                    <span className="inline-flex items-center gap-2">
                        <span>{opportunity.title}</span>
                        <Badge variant={opportunity.status === "active" ? "default" : "secondary"}>
                            {opportunity.status}
                        </Badge>
                    </span>
                }
                backHref="/dashboard/opportunities"
                action={
                    <EditOpportunityDialog
                        id={id}
                        initial={{
                            title: opportunity.title,
                            type: opportunity.type,
                            deadline: opportunity.deadline,
                            description: opportunity.description,
                            requirements: opportunity.requirements,
                        }}
                    />
                }
            />
            <p className="-mt-2 text-sm text-muted-foreground">
                Posted on {new Date(opportunity.created_at).toLocaleDateString()} by {opportunity.poster?.name || 'Unknown'}
            </p>

            <div className="space-y-6">
                    {/* Details Card */}
                    <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle>Description</CardTitle>
                            <div className="grid grid-cols-2 gap-2">
                                {opportunity.status === 'active' ? (
                                    <Button variant="secondary" className="w-full rounded-3xl">Close Opportunity</Button>
                                ) : (
                                    <Button className="w-full rounded-3xl">Reopen Opportunity</Button>
                                )}
                                <Button
                                    variant="destructive"
                                    className="w-full rounded-3xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                >
                                    Delete
                                </Button>
                            </div>
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

                            <Separator />
                            <div className="rounded-2xl bg-gray-800 p-4 text-slate-100">
                                <h3 className="mb-3 text-sm font-semibold">Overview</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="h-4 w-4 text-orange-400" />
                                        <span className="font-medium">Type:</span>
                                        <span>{opportunity.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-sky-400" />
                                        <span className="font-medium">Deadline:</span>
                                        <span>{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-emerald-400" />
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Applications List */}
                    <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
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
                                        <div key={app.id} className="flex items-start justify-between rounded-2xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800/70 dark:bg-slate-900/40">
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
                                                } className="rounded-full">
                                                    {app.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" title="View Application" className="rounded-2xl">
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
        </div>
    )
}


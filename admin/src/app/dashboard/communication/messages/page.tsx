"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Loader2, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"

type EnquiryStatus = "new" | "in_progress" | "resolved" | "closed"

type EnquiryRow = {
    id: string
    user_id: string | null
    enquiry_type: string
    subject: string
    message: string
    related_facility_id?: string | null
    status: EnquiryStatus
    response?: string | null
    responded_by?: string | null
    responded_at?: string | null
    created_at: string
    updated_at: string
    user?: { id: string; name: string; email: string; avatar?: string | null; role?: string | null } | null
    responder?: { id: string; name: string; email: string } | null
}

export default function MessageCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true)
    const [enquiries, setEnquiries] = useState<EnquiryRow[]>([])
    const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null)
    const [draftResponse, setDraftResponse] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(date);
        } else if (days < 7) {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'short'
            }).format(date);
        } else {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric'
            }).format(date);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const selectedEnquiry = useMemo(() => {
        return enquiries.find((e) => e.id === selectedEnquiryId) || null
    }, [enquiries, selectedEnquiryId])

    const filteredEnquiries = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return enquiries
        return enquiries.filter((e) => {
            const name = e.user?.name || e.user?.email || ""
            return (
                name.toLowerCase().includes(q) ||
                (e.subject || "").toLowerCase().includes(q) ||
                (e.message || "").toLowerCase().includes(q) ||
                (e.related_facility_id || "").toLowerCase().includes(q)
            )
        })
    }, [enquiries, searchQuery])

    const loadEnquiries = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/facility-enquiries?q=${encodeURIComponent(searchQuery)}`, {
                method: "GET",
                headers: { "content-type": "application/json" },
            })
            const json = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(json?.error || "Failed to load enquiries")
            }
            const rows = (json?.enquiries || []) as EnquiryRow[]
            setEnquiries(rows)
            if (rows.length > 0 && !selectedEnquiryId) {
                setSelectedEnquiryId(rows[0].id)
            } else if (selectedEnquiryId && !rows.some((r) => r.id === selectedEnquiryId)) {
                setSelectedEnquiryId(rows[0]?.id ?? null)
            }
        } catch (e: any) {
            setError(e?.message || "Failed to load enquiries")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadEnquiries()
        const id = window.setInterval(() => {
            // Light polling keeps it simple + reliable (no realtime config needed)
            loadEnquiries()
        }, 6000)
        return () => window.clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!selectedEnquiry) {
            setDraftResponse("")
            return
        }
        setDraftResponse(selectedEnquiry.response || "")
    }, [selectedEnquiryId])

    const saveResponse = async (status: EnquiryStatus) => {
        if (!selectedEnquiry) return
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/facility-enquiries`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: selectedEnquiry.id, response: draftResponse, status }),
            })
            const json = await res.json().catch(() => null)
            if (!res.ok) {
                throw new Error(json?.error || "Failed to save response")
            }
            const updated = json?.enquiry as EnquiryRow
            setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
        } catch (e: any) {
            setError(e?.message || "Failed to save response")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0 h-[calc(100vh-2rem)]">
            <DashboardPageHeader title="Facility Enquiries" backHref="/dashboard/communication" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                View and respond to facility booking enquiries submitted from the mobile Services page.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Sidebar / List */}
                <Card className="col-span-1 h-full flex flex-col rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] overflow-hidden">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search enquiries..." 
                                className="h-10 rounded-3xl border-0 bg-orange-100/80 pl-8 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="h-10 w-10 rounded-3xl grid place-items-center bg-orange-100/80 text-zinc-900 shadow-sm hover:bg-orange-100 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
                            onClick={loadEnquiries}
                            aria-label="Refresh"
                            title="Refresh"
                          >
                            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                          </button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        {loading ? (
                            <div className="flex justify-center items-center h-full p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredEnquiries.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No facility enquiries found
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredEnquiries.map((enquiry) => {
                                    const name = enquiry.user?.name || enquiry.user?.email || "Unknown User";
                                    const isSelected = selectedEnquiryId === enquiry.id;
                                    
                                    return (
                                        <div 
                                            key={enquiry.id} 
                                            className={cn(
                                                "flex gap-3 p-4 border-b cursor-pointer transition-all",
                                                isSelected && "bg-orange-100/70 dark:bg-orange-900/25",
                                                !isSelected && "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                                            )}
                                            onClick={() => setSelectedEnquiryId(enquiry.id)}
                                        >
                                            <Avatar>
                                                <AvatarImage src={enquiry.user?.avatar || undefined} />
                                                <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn(
                                                        "text-sm truncate pr-2",
                                                        "font-medium"
                                                    )}>
                                                        {name}
                                                    </span>
                                                    {enquiry.created_at && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {formatDate(enquiry.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={cn(
                                                        "text-xs truncate max-w-[180px]",
                                                        "text-muted-foreground"
                                                    )}>
                                                        {enquiry.subject || "No subject"}
                                                    </p>
                                                    <div className={cn(
                                                        "text-[10px] font-bold px-2 py-1 rounded-full",
                                                        enquiry.status === "new" && "bg-blue-500 text-white",
                                                        enquiry.status === "in_progress" && "bg-amber-500 text-white",
                                                        enquiry.status === "resolved" && "bg-emerald-600 text-white",
                                                        enquiry.status === "closed" && "bg-slate-500 text-white"
                                                    )}>
                                                        {enquiry.status.replace("_", " ")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Enquiry View */}
                <Card className="col-span-1 md:col-span-2 h-full flex flex-col overflow-hidden rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    {selectedEnquiry ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-3 bg-card">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedEnquiry.user?.avatar || undefined} />
                                    <AvatarFallback>
                                        {getInitials(selectedEnquiry.user?.name || selectedEnquiry.user?.email || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">
                                        {selectedEnquiry.user?.name || selectedEnquiry.user?.email || "Unknown User"}
                                    </h3>
                                    {!!selectedEnquiry.user?.email && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedEnquiry.user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                                {error && (
                                    <div className="rounded-2xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div className="rounded-2xl bg-background border shadow-sm p-4">
                                    <div className="flex flex-wrap gap-2 items-center justify-between mb-2">
                                        <div className="text-sm font-semibold">
                                            {selectedEnquiry.subject || "(No subject)"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDate(selectedEnquiry.created_at)}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        Facility ID: {selectedEnquiry.related_facility_id || "—"} • Type: {selectedEnquiry.enquiry_type}
                                    </div>
                                    <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                        {selectedEnquiry.message}
                                    </pre>
                                </div>

                                <div className="rounded-2xl bg-background border shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-semibold">Response</div>
                                        <div className="text-xs text-muted-foreground">
                                            {selectedEnquiry.responded_at ? `Last responded: ${formatDate(selectedEnquiry.responded_at)}` : "Not responded yet"}
                                        </div>
                                    </div>
                                    <textarea
                                        value={draftResponse}
                                        onChange={(e) => setDraftResponse(e.target.value)}
                                        className="w-full min-h-[140px] rounded-2xl border border-input bg-background p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Type your response to the user..."
                                        disabled={saving}
                                    />
                                    <div className="mt-3 flex flex-wrap gap-2 justify-end">
                                        <AnimatedDashboardButton
                                            label={saving ? "Saving..." : "Mark In Progress"}
                                            className="h-10 rounded-3xl px-4"
                                            onClick={() => saveResponse("in_progress")}
                                            disabled={saving}
                                        />
                                        <AnimatedDashboardButton
                                            label={saving ? "Saving..." : "Resolve"}
                                            className="h-10 rounded-3xl px-4"
                                            onClick={() => saveResponse("resolved")}
                                            disabled={saving}
                                        />
                                        <AnimatedDashboardButton
                                            label={saving ? "Saving..." : "Close"}
                                            className="h-10 rounded-3xl px-4"
                                            onClick={() => saveResponse("closed")}
                                            disabled={saving}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Enquiry Selected</h3>
                            <p className="max-w-xs mx-auto">
                                Select a facility enquiry from the list to view details and respond.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

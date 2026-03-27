"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, FileText, Package, ShieldCheck } from "lucide-react"
import {
    getSmmeSubmissionDetails,
    type SmmeServiceProductRow,
    type SmmeVerificationRow,
    type VerificationStatus,
} from "./actions"

type SmmeLite = {
    id: string
    name?: string | null
    email?: string | null
    organization?: string | null
    verification_status?: string | null
}

function statusBadge(status: VerificationStatus) {
    if (status === "verified") {
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Verified</Badge>
    }
    if (status === "rejected") {
        return <Badge className="bg-red-600 text-white hover:bg-red-600">Rejected</Badge>
    }
    return <Badge className="bg-amber-500 text-white hover:bg-amber-500">Pending</Badge>
}

function docLabel(type: SmmeVerificationRow["document_type"]) {
    switch (type) {
        case "Business Registration":
            return "Business Registration (CIPC)"
        case "ID Document":
            return "ID Document"
        case "Business Profile":
            return "Business Profile"
        case "Tax Clearance":
            return "Tax Clearance"
        default:
            return "Other"
    }
}

export function SmmeDetailsDialog({
    smme,
}: {
    smme: SmmeLite
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [documents, setDocuments] = useState<SmmeVerificationRow[]>([])
    const [products, setProducts] = useState<SmmeServiceProductRow[]>([])
    const [services, setServices] = useState<SmmeServiceProductRow[]>([])
    const [selectedDoc, setSelectedDoc] = useState<SmmeVerificationRow | null>(null)

    useEffect(() => {
        if (!open) return
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)
            try {
                const res = await getSmmeSubmissionDetails(smme.id)
                if (cancelled) return
                setDocuments(res.documents)
                setProducts(res.products)
                setServices(res.services)
                setSelectedDoc(res.documents?.[0] || null)
            } catch (e: any) {
                if (cancelled) return
                setError(e?.message || "Failed to load submission details")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [open, smme.id])

    const docByType = useMemo(() => {
        const map = new Map<string, SmmeVerificationRow>()
        for (const d of documents) {
            if (!map.has(d.document_type)) map.set(d.document_type, d)
        }
        return map
    }, [documents])

    const requiredTypes: SmmeVerificationRow["document_type"][] = useMemo(
        () => ["Business Registration", "ID Document", "Business Profile"],
        []
    )

    const requiredSummary = useMemo(() => {
        const rows = requiredTypes.map((t) => docByType.get(t))
        const submitted = rows.filter(Boolean).length
        const verified = rows.filter((r) => r?.status === "verified").length
        return { submitted, verified, total: requiredTypes.length }
    }, [docByType, requiredTypes])

    const selectedUrl = selectedDoc?.document_url || ""
    const isPdf = useMemo(() => {
        const u = selectedUrl.toLowerCase()
        return u.includes(".pdf") || u.includes("application/pdf")
    }, [selectedUrl])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-3xl px-4">
                    View
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] rounded-3xl border-0 bg-white/95 p-4 md:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/85 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-orange-600" />
                        {smme.name || "SMME"} submission
                    </DialogTitle>
                    <DialogDescription>
                        {smme.email || "—"} {smme.organization ? `• ${smme.organization}` : ""}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                        {error}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-orange-200/60 bg-white/70 p-4 dark:bg-slate-950/30 dark:border-orange-800/40">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                    <div className="text-sm font-semibold">Verification documents</div>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Required: {requiredSummary.submitted}/{requiredSummary.total} submitted • {requiredSummary.verified}/{requiredSummary.total} verified
                                </div>
                            </div>
                            <Badge
                                className={
                                    (smme.verification_status || "pending") === "verified"
                                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                        : "bg-amber-500 text-white hover:bg-amber-500"
                                }
                            >
                                {(smme.verification_status || "pending") === "verified" ? "Profile Verified" : "Profile Pending"}
                            </Badge>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">Loading documents…</div>
                            ) : (
                                <>
                                    {requiredTypes.map((t) => {
                                        const row = docByType.get(t)
                                        return (
                                            <div key={t} className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-medium">{docLabel(t)}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {row ? `Submitted • ${new Date(row.created_at).toLocaleString()}` : "Not submitted"}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {row ? statusBadge(row.status) : <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">Missing</Badge>}
                                                    {row?.document_url ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-2xl"
                                                                onClick={() => setSelectedDoc(row)}
                                                            >
                                                                Preview
                                                            </Button>
                                                            <a
                                                                href={row.document_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex"
                                                            >
                                                                <Button variant="outline" size="sm" className="rounded-2xl">
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    Open
                                                                </Button>
                                                            </a>
                                                        </>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {documents.filter((d) => !requiredTypes.includes(d.document_type)).length > 0 && (
                                        <>
                                            <Separator className="my-2" />
                                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Additional documents
                                            </div>
                                            {documents
                                                .filter((d) => !requiredTypes.includes(d.document_type))
                                                .map((d) => (
                                                    <div key={d.id} className="flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-sm font-medium">{docLabel(d.document_type)}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(d.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {statusBadge(d.status)}
                                                            {d.document_url ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="rounded-2xl"
                                                                        onClick={() => setSelectedDoc(d)}
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <a href={d.document_url} target="_blank" rel="noreferrer" className="inline-flex">
                                                                        <Button variant="outline" size="sm" className="rounded-2xl">
                                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                                            Open
                                                                        </Button>
                                                                    </a>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-orange-200/60 bg-white/70 p-4 dark:bg-slate-950/30 dark:border-orange-800/40">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-orange-600" />
                                    <div className="text-sm font-semibold">Products & services</div>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {products.length} products • {services.length} services
                                </div>
                            </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="mb-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Document preview
                            </div>
                            <div className="mt-2 overflow-hidden rounded-2xl border border-orange-100 bg-white/60 dark:border-orange-900/30 dark:bg-slate-950/20">
                                {!selectedDoc?.document_url ? (
                                    <div className="p-4 text-sm text-muted-foreground">
                                        Select a document to preview.
                                    </div>
                                ) : isPdf ? (
                                    <iframe
                                        title="Document preview"
                                        src={selectedDoc.document_url}
                                        className="h-[420px] w-full"
                                    />
                                ) : (
                                    <img
                                        src={selectedDoc.document_url}
                                        alt="Document preview"
                                        className="h-[420px] w-full object-contain bg-white/40 dark:bg-black/20"
                                    />
                                )}
                            </div>
                            {selectedDoc?.document_url ? (
                                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <div className="truncate">
                                        {docLabel(selectedDoc.document_type)} • {statusBadge(selectedDoc.status)}
                                    </div>
                                    <a href={selectedDoc.document_url} target="_blank" rel="noreferrer" className="shrink-0">
                                        <Button variant="outline" size="sm" className="rounded-2xl">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open
                                        </Button>
                                    </a>
                                </div>
                            ) : null}
                        </div>

                        {loading ? (
                            <div className="text-sm text-muted-foreground">Loading products/services…</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Products
                                    </div>
                                    {products.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No active products.</div>
                                    ) : (
                                        products.slice(0, 6).map((p) => (
                                            <div key={p.id} className="rounded-2xl border border-orange-100 bg-white/60 p-3 dark:border-orange-900/30 dark:bg-slate-950/20">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="truncate text-sm font-semibold">{p.name}</div>
                                                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</div>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                                                                {p.category}
                                                            </Badge>
                                                            {p.price ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/35 dark:text-emerald-200">
                                                                    {p.price}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {products.length > 6 ? (
                                        <div className="text-xs text-muted-foreground">
                                            Showing 6 of {products.length} products.
                                        </div>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Services
                                    </div>
                                    {services.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No active services.</div>
                                    ) : (
                                        services.slice(0, 6).map((s) => (
                                            <div key={s.id} className="rounded-2xl border border-orange-100 bg-white/60 p-3 dark:border-orange-900/30 dark:bg-slate-950/20">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold">{s.name}</div>
                                                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                                                            {s.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {services.length > 6 ? (
                                        <div className="text-xs text-muted-foreground">
                                            Showing 6 of {services.length} services.
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


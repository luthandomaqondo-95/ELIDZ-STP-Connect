import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import { FloatingLabelInput, FloatingLabelSelect, SelectItem } from "@/components/floating-input"
import { ExternalLink, FileText, Package, ShieldCheck } from "lucide-react"
import { useSmmeDetails, statusBadge, docLabel, type SmmeLite } from "@/hooks/use-smmes"
import { useVisitTracker } from "@/hooks/use-visit-tracker"

interface AddSmmeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddSmme: (data: { name: string; email: string; organization: string; role: string }) => Promise<void>
}

export function AddSmmeDialog({ open, onOpenChange, onAddSmme }: AddSmmeDialogProps) {
    const [loading, setAddLoading] = useState(false)
    const [error, setAddError] = useState<string | null>(null)
    const [role, setRole] = useState("SME")

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setAddLoading(true)
        setAddError(null)

        const formData = new FormData(event.currentTarget)
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            organization: formData.get("organization") as string,
            role: formData.get("role") as string,
        }

        try {
            await onAddSmme(data)
            onOpenChange(false)
            setRole("SME")
        } catch (e: any) {
            setAddError(e.message)
        } finally {
            setAddLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] rounded-3xl border-0 bg-white/90 p-4 md:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Verified SMME</DialogTitle>
                        <DialogDescription>
                            Add a new SMME user. They will receive an email invite and be automatically verified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2 md:gap-4 md:py-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-500 dark:border-red-900/40 dark:bg-red-950/20">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingLabelInput
                                id="name"
                                name="name"
                                label="Name"
                                placeholder="Acme Innovations"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="contact@company.com"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelInput
                                id="organization"
                                name="organization"
                                label="Organization"
                                placeholder="Acme Group"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelSelect
                                label="Role"
                                value={role}
                                onValueChange={setRole}
                                className="rounded-3xl bg-gray-800"
                            >
                                <SelectItem value="SME">SME</SelectItem>
                                <SelectItem value="SMME">SMME</SelectItem>
                            </FloatingLabelSelect>
                            <input type="hidden" name="role" value={role} />
                        </div>
                    </div>
                    <DialogFooter className="justify-center sm:justify-center">
                        <Button type="button" variant="outline" className="rounded-2xl mt-1" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <AnimatedDashboardButton
                            type="submit"
                            variant="green"
                            disabled={loading}
                            className="rounded-3xl h-10 px-5"
                            label={loading ? "Adding..." : "Add SMME"}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface SmmeDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    smme: SmmeLite | null
}

export function SmmeDetailsDialog({ open, onOpenChange, smme }: SmmeDetailsDialogProps) {
    const [selectedDoc, setSelectedDoc] = useState<any>(null)
    const { documents, products, services, loading, error } = useSmmeDetails(smme?.id || null)
    const { trackServiceVisit, trackProductVisit } = useVisitTracker()

    const docByType = documents.reduce((map, d) => {
        if (!map.has(d.document_type)) map.set(d.document_type, d)
        return map
    }, new Map<string, any>())

    const requiredTypes = ["Business Registration", "ID Document", "Business Profile"]
    const requiredSummary = {
        submitted: requiredTypes.map(t => docByType.get(t)).filter(Boolean).length,
        verified: requiredTypes.map(t => docByType.get(t)).filter(r => r?.status === "verified").length,
        total: requiredTypes.length
    }

    const selectedUrl = selectedDoc?.document_url || ""
    const isPdf = selectedUrl.toLowerCase().includes(".pdf") || selectedUrl.includes("application/pdf")

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl border-0 bg-white/90 p-4 md:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        SMME Verification Details
                    </DialogTitle>
                    <DialogDescription>
                        Review {smme?.name}'s verification documents and business offerings.
                    </DialogDescription>
                </DialogHeader>
                
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-500 dark:border-red-900/40 dark:bg-red-950/20">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-8">Loading details...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Documents Section */}
                        <div>
                            <h4 className="mb-3 font-semibold">Verification Documents</h4>
                            <div className="mb-4 flex gap-4 text-sm">
                                <span className="text-muted-foreground">
                                    {requiredSummary.submitted}/{requiredSummary.total} submitted
                                </span>
                                <span className="text-emerald-600">
                                    {requiredSummary.verified}/{requiredSummary.total} verified
                                </span>
                            </div>
                            
                            {documents.length === 0 ? (
                                <p className="text-muted-foreground">No documents submitted</p>
                            ) : (
                                <div className="space-y-2">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{docLabel(doc.document_type)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={statusBadge(doc.status)}>
                                                    {doc.status}
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedDoc(doc)}
                                                    className="rounded-3xl px-3"
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Document Preview */}
                        {selectedDoc && selectedUrl && (
                            <div>
                                <h4 className="mb-3 font-semibold">Document Preview</h4>
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    {isPdf ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-center">
                                                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                                <p className="mt-2 text-sm text-muted-foreground">PDF Document</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2 rounded-3xl"
                                                    asChild
                                                >
                                                    <a href={selectedUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        Open PDF
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={selectedUrl}
                                            alt="Document preview"
                                            className="mx-auto max-h-96 rounded-lg object-contain"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Services and Products */}
                        {(products.length > 0 || services.length > 0) && (
                            <div>
                                <h4 className="mb-3 font-semibold">Business Offerings</h4>
                                <div className="space-y-4">
                                    {services.length > 0 && (
                                        <div>
                                            <h5 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                                <Package className="h-4 w-4" />
                                                Services ({services.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {services.map((service) => (
                                                    <div key={service.id} className="rounded-lg border p-3">
                                                        <div className="flex items-start justify-between">
                                                            <div onClick={() => trackServiceVisit(service.id)} className="cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors">
                                                                <p className="font-medium">{service.name}</p>
                                                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                                                {service.contact_email && (
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Contact: {service.contact_email}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline">{service.category}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {products.length > 0 && (
                                        <div>
                                            <h5 className="mb-2 flex items-center gap-2 text-sm font-medium">
                                                <Package className="h-4 w-4" />
                                                Products ({products.length})
                                            </h5>
                                            <div className="space-y-2">
                                                {products.map((product) => (
                                                    <div key={product.id} className="rounded-lg border p-3">
                                                        <div className="flex items-start justify-between">
                                                            <div onClick={() => trackProductVisit(product.id)} className="cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors">
                                                                <div className="flex gap-3">
                                                                    {product.image_url && (
                                                                        <img
                                                                            src={product.image_url}
                                                                            alt={product.name}
                                                                            className="h-12 w-12 rounded-lg object-cover"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{product.name}</p>
                                                                        <p className="text-sm text-muted-foreground">{product.description}</p>
                                                                        {product.price && (
                                                                            <p className="text-sm font-medium text-emerald-600">{product.price}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline">{product.category}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

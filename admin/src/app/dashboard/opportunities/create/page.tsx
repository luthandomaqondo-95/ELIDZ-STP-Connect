"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
    FloatingLabelInput,
    FloatingLabelTextarea,
    FloatingLabelSelect,
    SelectItem,
} from "@/components/floating-input"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createOpportunity } from "../actions"
import { createClient } from "@/lib/supabase/client"

export default function CreateOpportunityPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loadingTenants, setLoadingTenants] = useState(true)
    const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([])

    const [form, setForm] = useState({
        title: "",
        type: "tender",
        tenant_id: "",
        deadline: "",
        description: "",
        requirements: "",
    })

    useEffect(() => {
        async function fetchTenants() {
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from("tenants")
                    .select("id, name")
                    .order("name", { ascending: true })

                if (data) setTenants(data as Array<{ id: string; name: string }>)
            } catch (e) {
                // Tenant loading failure shouldn't block draft creation entirely,
                // but posting will fail if tenant_id is missing.
                console.error("Failed to load tenants:", e)
            } finally {
                setLoadingTenants(false)
            }
        }

        fetchTenants()
    }, [])

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSaving(true)
        setError(null)

        if (!form.tenant_id) {
            setSaving(false)
            const message = "Please select a tenant."
            setError(message)
            toast.error(message)
            return
        }

        const fd = new FormData()
        fd.set("title", form.title)
        fd.set("type", form.type)
        fd.set("tenant_id", form.tenant_id)
        fd.set("deadline", form.deadline)
        fd.set("description", form.description)
        fd.set("requirements", form.requirements)

        const result = await createOpportunity(fd)
        setSaving(false)

        if (!result.success) {
            setError(result.error)
            toast.error(result.error)
            return
        }

        toast.success("Opportunity posted.")
        router.push(`/dashboard/opportunities/${result.id}`)
        router.refresh()
    }

    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Post New Opportunity" backHref="/dashboard/opportunities" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Create and publish a new ELIDZ opportunity for tenants, partners, and stakeholders with clear requirements, timelines, and application details.
            </p>
            <div>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] w-full min-h-[calc(100vh-8rem)]">
                        <CardHeader>
                            <CardTitle className="text-xl">Opportunity Details</CardTitle>
                            <CardDescription className="text-sm">
                                Fill in the details for the new opportunity.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={onSubmit}>
                        <CardContent className="space-y-6">
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingLabelInput
                                    id="title"
                                    label="Title"
                                    placeholder="e.g. Innovation Challenge 2024"
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                    required
                                />
                                <FloatingLabelSelect
                                    label="Type"
                                    placeholder="Select type"
                                    value={form.type}
                                    onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                >
                                    <SelectItem value="tender">Tender</SelectItem>
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="funding">Funding</SelectItem>
                                    <SelectItem value="program">Program</SelectItem>
                                </FloatingLabelSelect>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingLabelSelect
                                    label="Tenant"
                                    placeholder={loadingTenants ? "Loading tenants..." : "Select tenant"}
                                    value={form.tenant_id}
                                    onValueChange={(value) => setForm((prev) => ({ ...prev, tenant_id: value }))}
                                    disabled={loadingTenants}
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                >
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </FloatingLabelSelect>
                                <FloatingLabelInput
                                    id="deadline"
                                    label="Deadline"
                                    type="date"
                                    value={form.deadline}
                                    onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <FloatingLabelTextarea
                                    id="description"
                                    label="Description"
                                    placeholder="Describe the opportunity..."
                                    value={form.description}
                                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="min-h-[150px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                    required
                                />
                            </div>
                            <div>
                                <FloatingLabelTextarea
                                    id="requirements"
                                    label="Requirements"
                                    placeholder="Optional requirements, eligibility, or documents needed..."
                                    value={form.requirements}
                                    onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
                                    className="min-h-[120px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            </div>

                        
                        </CardContent>
                        <CardFooter className="justify-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                                type="button"
                                onClick={() => router.push("/dashboard/opportunities")}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <AnimatedDashboardButton
                                type="submit"
                                variant="green"
                                disabled={saving}
                                label={saving ? "Posting..." : "Post Opportunity"}
                                className="h-10 rounded-3xl px-5"
                            />
                        </CardFooter>
                        </form>
                    </Card>
            </div>
        </div>
    );
}
